import fs from 'node:fs/promises';
import path from 'node:path';
import { getConfig, input } from './config.js';
import { Git, isZero } from './git.js';
import { analyze } from './packwiz.js';
import { buildMessages, sendMessages } from './discord.js';

function commandEscape(text) {
  return String(text).replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
}

async function output(name, value) {
  if (process.env.GITHUB_OUTPUT) await fs.appendFile(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

async function main() {
  const secret = input('webhook-url');
  if (secret) console.log(`::add-mask::${commandEscape(secret)}`);
  const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
  const config = getConfig(workspace);
  if (process.env.GITHUB_EVENT_NAME !== 'push') throw new Error('This action supports GitHub push events only');
  const event = JSON.parse(await fs.readFile(process.env.GITHUB_EVENT_PATH, 'utf8'));
  if (event.deleted || isZero(event.after)) {
    console.log('Deleted ref: no pack snapshot to report.');
    for (const name of ['added', 'removed', 'updated', 'messages']) await output(name, 0);
    return;
  }
  const git = new Git(workspace);
  const before = isZero(event.before) ? null : event.before;
  await git.ensure(event.after);
  if (before) await git.ensure(before);
  const serverUrl = (process.env.GITHUB_SERVER_URL || 'https://github.com').replace(/\/$/, '');
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository || !/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error('GITHUB_REPOSITORY is missing or invalid');
  const repoUrl = `${serverUrl}/${repository}`;
  const context = {
    serverUrl, repoUrl, before, after: event.after,
    compareUrl: before ? `${repoUrl}/compare/${before}..${event.after}` : `${repoUrl}/commit/${event.after}`,
    branch: (event.ref || '').replace(/^refs\/(?:heads|tags)\//, ''),
    isTag: (event.ref || '').startsWith('refs/tags/'),
    actor: event.sender?.login || process.env.GITHUB_ACTOR || 'unknown',
    forced: Boolean(event.forced), created: Boolean(event.created),
    timestamp: new Date().toISOString(),
  };
  const report = await analyze(git, before, event.after, config);
  const commits = config.includeCommits ? await git.commits(before, event.after, config.maxCommits + 1) : [];
  const messages = buildMessages(report, commits, context, config);
  if (config.dryRun) {
    const preview = path.join(workspace, 'discord-preview.json');
    await fs.writeFile(preview, `${JSON.stringify(messages, null, 2)}\n`, { mode: 0o600 });
    await output('preview-path', preview);
    console.log('Dry run: payloads written to discord-preview.json; no webhook called.');
  } else {
    await sendMessages(config.webhookUrl, messages);
  }
  for (const name of ['added', 'removed', 'updated']) await output(name, report[name].length);
  await output('messages', messages.length);
  console.log(`Packwiz: ${report.added.length} added, ${report.removed.length} removed, ${report.updated.length} updated; ${messages.length} message(s).`);
}

main().catch(error => {
  const fail = input('fail-on-error', 'true') !== 'false';
  // Errors from Git can contain repository URLs; avoid logging raw stderr.
  const message = error.code || error.cmd ? 'Git operation failed. Check checkout history, repository access, and pack-directory.' : error.message;
  console.log(`::${fail ? 'error' : 'warning'}::${commandEscape(message)}`);
  if (fail) process.exitCode = 1;
});
