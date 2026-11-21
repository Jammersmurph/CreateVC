import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const sha = process.env.REPLAY_SHA || '';
const branch = process.env.REPLAY_BRANCH || '';
if (!/^[a-f\d]{40}$/i.test(sha)) throw new Error('Provide a full 40-character commit SHA');
execFileSync('git', ['check-ref-format', `refs/heads/${branch}`], { stdio: 'pipe' });
const parents = execFileSync('git', ['rev-list', '--parents', '-n', '1', sha], { encoding: 'utf8' }).trim().split(/\s+/);
const directory = await fs.mkdtemp(path.join(process.env.RUNNER_TEMP, 'packwiz-replay-'));
const eventPath = path.join(directory, 'push.json');
await fs.writeFile(eventPath, JSON.stringify({
  before: parents[1] || '0'.repeat(40),
  after: sha,
  ref: `refs/heads/${branch}`,
  sender: { login: process.env.GITHUB_ACTOR },
}));

// Scope the synthetic event to this process; never rewrite GitHub's event file.
process.env.GITHUB_EVENT_NAME = 'push';
process.env.GITHUB_EVENT_PATH = eventPath;
await import('../actions/packwiz-changelog/dist/index.js');
