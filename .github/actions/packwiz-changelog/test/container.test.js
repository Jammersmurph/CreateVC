import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMessages } from '../src/discord.js';

test('long headings and explicit mentions fit Components V2 total text limits', () => {
  const roles = Array.from({ length: 75 }, (_, index) => String(123456789012345000n + BigInt(index)));
  const messages = buildMessages({
    pack: {}, added: [], removed: [], updated: [],
    files: Array.from({ length: 50 }, (_, i) => ({ status: 'A', file: `config/${i}.toml` })),
  }, [], {
    repoUrl: 'https://github.com/owner/pack', serverUrl: 'https://github.com',
    after: 'b'.repeat(40), before: 'a'.repeat(40), branch: 'main', actor: 'alice',
    compareUrl: 'https://github.com/owner/pack/compare/a..b',
  }, {
    title: '*'.repeat(256), description: 'intro '.repeat(250), roles, users: [], everyone: false,
    customLinks: [], buttons: true, color: 0x5865f2, maxMessages: 2, maxItems: 50,
    includeFiles: true, includeCommits: false, includePackInfo: false,
  });
  assert.equal(messages.length, 2);
  for (const [index, message] of messages.entries()) {
    assert.equal(message.components.length, 1);
    const container = message.components[0];
    assert.equal(container.type, 17);
    assert.equal(container.components.at(-1).type, 1);
    const displays = container.components.filter(component => component.type === 10);
    assert.ok(displays.reduce((sum, display) => sum + display.content.length, 0) <= 4000);
    assert.equal(displays[0].content.includes(`<@&${roles[0]}>`), index === 0);
    assert.equal(message.content, undefined);
    assert.equal(message.embeds, undefined);
  }
});
