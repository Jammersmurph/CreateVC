import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { Git } from '../src/git.js';
import { analyze, modFromToml, parseToml } from '../src/packwiz.js';
import { buildMessages, sendMessages, validateWebhook, truncate } from '../src/discord.js';
import { getConfig, httpUrl } from '../src/config.js';

const exec = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));
const config = {
  packDirectory: '', excludePaths: [], maxCommits: 10, maxItems: 50, maxMessages: 5,
  includeCommits: true, includeFiles: true, includePackInfo: true,
  title: '', description: '', color: 0x5865f2, changelogUrl: '', username: '', avatarUrl: '',
  roles: [], users: [], everyone: false, buttons: true, customLinks: [],
};
const context = {
  repoUrl: 'https://github.com/owner/pack', serverUrl: 'https://github.com',
  before: 'a'.repeat(40), after: 'b'.repeat(40),
  branch: 'feature/mods', actor: 'alice', forced: false, created: false,
  compareUrl: 'https://github.com/owner/pack/compare/a..b',
  timestamp: '2026-01-01T00:00:00.000Z',
};
const pack = 'name = "Example Pack"\nversion = "1.2.0"\n[index]\nfile = "index.toml"\n[versions]\nminecraft = "1.21.1"\nfabric = "0.16.0"\n';
const manifest = (name, id, version = '1', extra = '') =>
  `name = "${name}"\nfilename = "${name}-${version}.jar"\nside = "both"\n${extra}\n[update.modrinth]\nmod-id = "${id}"\nversion = "${version}"\n`;
const emptyReport = () => ({ pack: parseToml(pack, 'pack.toml'), added: [], removed: [], updated: [], files: [] });
const children = payload => payload.components[0].components;
const text = payload => children(payload).filter(component => component.type === 10).map(component => component.content).join('\n');
const buttons = payload => children(payload).find(component => component.type === 1)?.components;

async function repository(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'packwiz-action-test-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const git = new Git(dir);
  await git.run('init', '-b', 'main');
  await git.run('config', 'user.name', 'Test Developer');
  await git.run('config', 'user.email', 'test@example.com');
  const write = async (name, text) => {
    await fs.mkdir(path.dirname(path.join(dir, name)), { recursive: true });
    await fs.writeFile(path.join(dir, name), text);
  };
  const commit = async subject => {
    await git.run('add', '-A');
    await git.run('commit', '-m', subject);
    return (await git.run('rev-parse', 'HEAD')).trim();
  };
  return { dir, git, write, commit };
}

test('parses real packwiz providers and never uses token-bearing download URLs', () => {
  const mr = modFromToml(manifest('Sodium', 'AANobbMI'), 'mods/sodium.pw.toml');
  assert.equal(mr.source, 'https://modrinth.com/mod/AANobbMI');
  const cf = modFromToml('name="JEI"\n[update.curseforge]\nproject-id=238222\nfile-id=123456\n', 'mods/jei.pw.toml');
  assert.equal(cf.source, 'https://www.curseforge.com/projects/238222');
  assert.equal(cf.version, '123456');
  const direct = modFromToml('name="Private"\n[download]\nurl="https://example.com/file?token=secret"\n', 'mods/private.pw.toml');
  assert.equal(direct.source, '');
  assert.throws(() => parseToml('name = [', 'mods/broken.pw.toml'), /Invalid TOML in mods\/broken/);
});

test('detects additions, removals, updates, renames, configs and ignores index hash noise', async t => {
  const { dir, git, write, commit } = await repository(t);
  await write('pack.toml', pack);
  await write('index.toml', 'hash="old"\n');
  await write('mods/remove.pw.toml', manifest('Removed', 'removed'));
  await write('mods/update.pw.toml', manifest('Updated', 'updated'));
  await write('mods/rename.pw.toml', manifest('Renamed', 'renamed'));
  await write('mods/metadata.pw.toml', manifest('Metadata', 'metadata'));
  const before = await commit('Initial pack');
  await fs.unlink(path.join(dir, 'mods/remove.pw.toml'));
  await fs.rename(path.join(dir, 'mods/rename.pw.toml'), path.join(dir, 'mods/new-name.pw.toml'));
  await write('mods/update.pw.toml', manifest('Updated', 'updated', '2'));
  await write('mods/add.pw.toml', manifest('Added', 'added'));
  await write('mods/metadata.pw.toml', manifest('Metadata', 'metadata', '1', '[option]\noptional = true'));
  await write('config/space name.toml', 'enabled = true\n');
  await write('index.toml', 'hash="new"\n');
  const after = await commit('Update mods and configs');
  const report = await analyze(git, before, after, config);
  assert.deepEqual(report.added.map(x => x.name), ['Added']);
  assert.deepEqual(report.removed.map(x => x.name), ['Removed']);
  assert.deepEqual(report.updated.map(x => x.name), ['Metadata', 'Renamed', 'Updated']);
  assert.equal(report.updated[0].optional, true);
  assert.equal(report.removed[0].source, 'https://modrinth.com/mod/removed');
  assert.deepEqual(report.files, [{ status: 'A', file: 'config/space name.toml' }]);
  const commits = await git.commits(before, after, 11);
  assert.equal(commits.length, 1);
  assert.equal(commits[0].author, 'Test Developer');
  assert.equal(commits[0].subject, 'Update mods and configs');
});

test('a new ref inventories its snapshot; subdirectories and excluded paths are respected', async t => {
  const { git, write, commit } = await repository(t);
  await write('packs/main/pack.toml', pack);
  await write('packs/main/mods/a.pw.toml', manifest('Included', 'included'));
  await write('packs/main/config/ignored.toml', 'x=1\n');
  await write('outside/mods/b.pw.toml', manifest('Outside', 'outside'));
  const after = await commit('Create pack');
  const report = await analyze(git, null, after, {
    ...config, packDirectory: 'packs/main', excludePaths: ['**/config/**'],
  });
  assert.equal(report.added.length, 1);
  assert.equal(report.added[0].name, 'Included');
  assert.deepEqual(report.files.map(x => x.file), ['packs/main/pack.toml']);
});

test('replacing a project at the same path is a removal and addition', async t => {
  const { git, write, commit } = await repository(t);
  await write('pack.toml', pack);
  await write('mods/mod.pw.toml', manifest('Old', 'old'));
  const before = await commit('Old mod');
  await write('mods/mod.pw.toml', manifest('New', 'new'));
  const after = await commit('Replace mod');
  const report = await analyze(git, before, after, config);
  assert.equal(report.removed.length, 1);
  assert.equal(report.added.length, 1);
  assert.equal(report.updated.length, 0);
});

test('TOML comment-only edits do not count as mod updates', async t => {
  const { git, write, commit } = await repository(t);
  await write('pack.toml', pack);
  await write('mods/mod.pw.toml', manifest('Mod', 'mod'));
  const before = await commit('Initial');
  await write('mods/mod.pw.toml', `# comment\n${manifest('Mod', 'mod')}`);
  const after = await commit('Comment');
  assert.equal((await analyze(git, before, after, config)).updated.length, 0);
});

test('snapshot comparison works for non-ancestor force pushes', async t => {
  const { git, write, commit } = await repository(t);
  await write('pack.toml', pack);
  const base = await commit('Base');
  await write('mods/old.pw.toml', manifest('Old', 'old'));
  const before = await commit('Old branch');
  await git.run('switch', '-c', 'replacement', base);
  await write('mods/new.pw.toml', manifest('New', 'new'));
  const after = await commit('Replacement branch');
  const report = await analyze(git, before, after, config);
  assert.equal(report.added.length, 1);
  assert.equal(report.removed.length, 1);
  assert.equal((await git.commits(before, after, 11))[0].subject, 'Replacement branch');
});

test('missing pack and invalid SHAs fail with actionable errors', async t => {
  const { git, write, commit } = await repository(t);
  await write('README.md', '# not a pack');
  const after = await commit('Not packwiz');
  await assert.rejects(analyze(git, null, after, config), /Is this a packwiz repository/);
  await assert.rejects(git.ensure('--bad-option'), /invalid commit SHA/);
});

test('renders authors, mod sources, buttons and tightly scoped explicit mentions', () => {
  const report = emptyReport();
  report.added.push(modFromToml(manifest('Mod [name]', 'id'), 'mods/mod.pw.toml'));
  const [payload] = buildMessages(report, [{
    sha: 'c'.repeat(40), author: 'Alice', subject: 'Update @everyone **mods**',
  }], context, {
    ...config, roles: ['123456789012345678'], users: ['223456789012345678'],
    customLinks: [{ label: 'Download', url: 'https://example.com/download' }],
  });
  assert.match(children(payload)[0].content, /<@&123456789012345678> <@223456789012345678>/);
  assert.deepEqual(payload.allowed_mentions.parse, []);
  assert.equal(payload.flags, 32768);
  assert.equal(payload.components.length, 1);
  assert.equal(payload.components[0].type, 17);
  assert.equal(payload.embeds, undefined);
  assert.equal(payload.content, undefined);
  assert.equal(buttons(payload).length, 4);
  assert.equal(buttons(payload)[0].style, 5);
  assert.match(text(payload), /https:\/\/modrinth.com\/mod\/id/);
  assert.match(text(payload), /Alice/);
  assert.match(text(payload), /fabric 0\.16\.0/);
  assert.doesNotMatch(text(payload), /Open ↗|\[Changelog\]|\[Branch\]|\[Download\]/);
  assert.equal(buttons(payload)[2].url, `${context.repoUrl}/tree/feature%2Fmods`);
});

test('large reports respect Discord limits, paginate and only ping once', () => {
  const report = emptyReport();
  report.added = Array.from({ length: 200 }, (_, i) =>
    modFromToml(manifest(`Mod ${i} ${'x'.repeat(200)}`, `id${i}`), `mods/${i}.pw.toml`));
  const messages = buildMessages(report, [], context, {
    ...config, maxItems: 200, maxMessages: 2, roles: ['123456789012345678'],
  });
  assert.equal(messages.length, 2);
  assert.match(text(messages.at(-1)), /Report truncated/);
  assert.equal(messages[1].content, undefined);
  assert.doesNotMatch(text(messages[1]), /<@&123456789012345678>/);
  assert.deepEqual(messages[1].allowed_mentions, { parse: [], roles: [], users: [] });
  for (const message of messages) {
    const displays = children(message).filter(component => component.type === 10);
    assert.ok(displays.every(component => component.content.length <= 4000));
    const total = displays.reduce((sum, component) => sum + component.content.length, 0);
    assert.ok(total <= 4000, `message contains ${total} text characters`);
    assert.ok(children(message).length + buttons(message).length + 1 <= 40);
  }
  assert.equal(truncate('abc😀def', 5), 'abc…');
});

test('optional sections and buttons can be disabled', () => {
  const report = emptyReport();
  report.files.push({ status: 'A', file: 'config/a.toml' });
  const [message] = buildMessages(report, [], context, {
    ...config, includeFiles: false, includeCommits: false, includePackInfo: false, buttons: false,
  });
  assert.equal(buttons(message), undefined);
  assert.doesNotMatch(text(message), /Other pack changes|Minecraft|Commits/);
});

test('gallery is first inside every container and avatar is independently configurable', () => {
  const report = emptyReport();
  report.files = Array.from({ length: 100 }, (_, i) => ({ status: 'A', file: `config/${i}.toml` }));
  const imageUrl = 'https://example.com/banner.png';
  const avatarUrl = 'https://example.com/avatar.png';
  const messages = buildMessages(report, [], context, { ...config, imageUrl, avatarUrl, maxItems: 100 });
  assert.ok(messages.length > 1);
  for (const message of messages) {
    assert.equal(message.avatar_url, avatarUrl);
    assert.deepEqual(children(message)[0], {
      type: 12, items: [{ media: { url: imageUrl }, description: 'Pack artwork' }],
    });
    assert.equal(children(message).at(-1).type, 1);
    assert.equal(message.components.length, 1);
  }
  const [withoutGallery] = buildMessages(emptyReport(), [], context, { ...config, avatarUrl });
  assert.equal(withoutGallery.avatar_url, avatarUrl);
  assert.equal(children(withoutGallery).some(component => component.type === 12), false);
  const [withoutAvatar] = buildMessages(emptyReport(), [], context, { ...config, imageUrl });
  assert.equal(withoutAvatar.avatar_url, undefined);
  assert.equal(children(withoutAvatar)[0].type, 12);
});

test('webhook URL validation disallows arbitrary hosts and preserves thread_id', () => {
  for (const bad of ['https://evil.com/api/webhooks/123/token', 'http://discord.com/api/webhooks/123/token',
    'https://discord.com.evil.com/api/webhooks/123/token', 'https://discord.com/api/webhooks/123/token/slack']) {
    assert.throws(() => validateWebhook(bad), /webhook/);
  }
  const url = validateWebhook('https://discord.com/api/webhooks/123/token?thread_id=456');
  assert.equal(url.searchParams.get('thread_id'), '456');
  assert.equal(url.searchParams.get('with_components'), 'true');
  assert.equal(url.searchParams.get('wait'), 'true');
});

test('delivery handles rate limits and transient server errors without logging secrets', async () => {
  const delays = [];
  let calls = 0;
  await sendMessages('https://discord.com/api/webhooks/123/token', [{ embeds: [] }], {
    fetcher: async () => {
      calls++;
      if (calls === 1) return new Response(JSON.stringify({ retry_after: 1.5 }), { status: 429 });
      if (calls === 2) return new Response('bad gateway', { status: 502 });
      return new Response('{}');
    },
    sleep: async ms => delays.push(ms),
  });
  assert.equal(calls, 3);
  assert.deepEqual(delays, [1500, 2000]);
  await assert.rejects(sendMessages('https://discord.com/api/webhooks/123/secret', [{}], {
    fetcher: async () => new Response('secret', { status: 401 }),
  }), error => error.message.includes('HTTP 401') && !error.message.includes('secret'));
});

test('network errors do not blindly retry possibly delivered messages', async () => {
  let calls = 0;
  await assert.rejects(sendMessages('https://discord.com/api/webhooks/123/token', [{}], {
    fetcher: async () => { calls++; throw new Error('private webhook URL'); },
  }), /delivery is uncertain/);
  assert.equal(calls, 1);
});

test('persistent rate limits stop after five attempts', async () => {
  let calls = 0;
  await assert.rejects(sendMessages('https://discord.com/api/webhooks/123/token', [{}], {
    fetcher: async () => { calls++; return new Response('{}', { status: 429 }); },
    sleep: async () => {},
  }), /HTTP 429/);
  assert.equal(calls, 5);
});

test('config validates paths, booleans, IDs, limits and custom links', () => {
  const original = { ...process.env };
  try {
    assert.equal(getConfig('/repository').packDirectory, '');
    process.env['INPUT_IMAGE-URL'] = 'https://example.com/banner.png';
    process.env['INPUT_AVATAR-URL'] = 'https://example.com/avatar.png';
    const appearance = getConfig('/repository');
    assert.equal(appearance.imageUrl, 'https://example.com/banner.png');
    assert.equal(appearance.avatarUrl, 'https://example.com/avatar.png');
    process.env['INPUT_IMAGE-URL'] = 'javascript:alert(1)';
    assert.throws(() => getConfig('/repository'), /image-url must be an HTTP/);
    delete process.env['INPUT_IMAGE-URL'];
    delete process.env['INPUT_AVATAR-URL'];
    process.env['INPUT_PACK-DIRECTORY'] = '../outside';
    assert.throws(() => getConfig('/repository'), /inside the repository/);
    delete process.env['INPUT_PACK-DIRECTORY'];
    process.env['INPUT_MENTION-EVERYONE'] = 'yes';
    assert.throws(() => getConfig('/repository'), /true or false/);
    delete process.env['INPUT_MENTION-EVERYONE'];
    process.env['INPUT_MENTION-ROLES'] = '@everyone';
    assert.throws(() => getConfig('/repository'), /numeric Discord IDs/);
    delete process.env['INPUT_MENTION-ROLES'];
    process.env['INPUT_MAX-MESSAGES'] = '100';
    assert.throws(() => getConfig('/repository'), /between 1 and 10/);
    delete process.env['INPUT_MAX-MESSAGES'];
    process.env['INPUT_CUSTOM-LINKS'] = '[{"label":"Site","url":"javascript:alert(1)"}]';
    assert.throws(() => getConfig('/repository'), /HTTP\(S\)/);
    assert.throws(() => httpUrl('https://user:password@example.com', 'url'), /without credentials/);
  } finally { process.env = original; }
});

for (const entrypoint of ['src/index.js', 'dist/index.js']) test(`${entrypoint} dry-run produces a secret-free preview and action outputs`, async t => {
  const { dir, write, commit } = await repository(t);
  await write('pack.toml', pack);
  await write('mods/example.pw.toml', manifest('Example', 'example'));
  const after = await commit('Create pack');
  const eventPath = path.join(dir, 'event.json');
  const outputPath = path.join(dir, 'outputs.txt');
  await fs.writeFile(eventPath, JSON.stringify({
    before: '0'.repeat(40), after, ref: 'refs/heads/main', created: true,
    sender: { login: 'alice' },
  }));
  const env = {
    ...process.env, GITHUB_EVENT_NAME: 'push', GITHUB_WORKSPACE: dir,
    GITHUB_EVENT_PATH: eventPath, GITHUB_REPOSITORY: 'owner/pack',
    GITHUB_OUTPUT: outputPath, 'INPUT_DRY-RUN': 'true',
  };
  const { stdout } = await exec(process.execPath, [path.join(root, entrypoint)], { env });
  assert.match(stdout, /Dry run/);
  const preview = JSON.parse(await fs.readFile(path.join(dir, 'discord-preview.json'), 'utf8'));
  assert.match(text(preview[0]), /Example/);
  assert.equal(buttons(preview[0]).length, 3);
  assert.match(await fs.readFile(outputPath, 'utf8'), /added=1/);
});
