import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const SHA = /^[a-f\d]{40}(?:[a-f\d]{24})?$/i;
export const isZero = sha => /^0+$/.test(sha || '');

export class Git {
  constructor(workspace) { this.workspace = workspace; }

  async run(...args) {
    const { stdout } = await exec('git', args, {
      cwd: this.workspace,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    });
    return stdout;
  }

  async ensure(sha) {
    if (!SHA.test(sha)) throw new Error('Push event contains an invalid commit SHA');
    try { await this.run('cat-file', '-e', `${sha}^{commit}`); }
    catch {
      // Explicit SHAs, never untrusted branch names or shell interpolation.
      try { await this.run('fetch', '--no-tags', '--depth=1', 'origin', sha); }
      catch {
        throw new Error(`Commit ${sha} is unavailable. Use actions/checkout with fetch-depth: 0. A force-pushed old commit may no longer be fetchable.`);
      }
    }
  }

  async file(sha, name) {
    return this.run('show', `${sha}:${name}`);
  }

  async files(sha) {
    return (await this.run('ls-tree', '-r', '--name-only', '-z', sha)).split('\0').filter(Boolean);
  }

  async changes(before, after) {
    if (!before) return (await this.files(after)).map(file => ({ status: 'A', file }));
    const tokens = (await this.run('diff', '--no-renames', '--name-status', '-z', before, after, '--')).split('\0');
    const changes = [];
    for (let i = 0; i < tokens.length - 1; i += 2) changes.push({ status: tokens[i], file: tokens[i + 1] });
    return changes;
  }

  async commits(before, after, limit) {
    // No history traversal across missing shallow boundaries: users should check out full history.
    const range = before ? `${before}..${after}` : after;
    const raw = await this.run('log', `--max-count=${limit}`, '--format=%H%x00%an%x00%s%x00', range, '--');
    const parts = raw.split('\0');
    const commits = [];
    for (let i = 0; i + 2 < parts.length; i += 3) {
      commits.push({ sha: parts[i].trim(), author: parts[i + 1], subject: parts[i + 2] });
    }
    return commits;
  }
}
