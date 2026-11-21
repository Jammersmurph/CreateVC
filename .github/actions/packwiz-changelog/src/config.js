import path from 'node:path';

export function input(name, fallback = '') {
  return process.env[`INPUT_${name.replaceAll(' ', '_').toUpperCase()}`]?.trim() || fallback;
}

function boolean(name, fallback) {
  const value = input(name, String(fallback));
  if (!['true', 'false'].includes(value)) throw new Error(`${name} must be true or false`);
  return value === 'true';
}

function integer(name, fallback, max) {
  const value = input(name, String(fallback));
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > max) {
    throw new Error(`${name} must be an integer between 1 and ${max}`);
  }
  return Number(value);
}

function ids(name) {
  const values = [...new Set(input(name).split(/[\s,]+/).filter(Boolean))];
  if (values.length > 100 || values.some(value => !/^\d{17,20}$/.test(value))) {
    throw new Error(`${name} must contain at most 100 numeric Discord IDs`);
  }
  return values;
}

export function httpUrl(value, label) {
  if (!value) return '';
  let url;
  try { url = new URL(value); } catch { throw new Error(`${label} must be an HTTP(S) URL`); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error(`${label} must be an HTTP(S) URL without credentials`);
  }
  if (url.href.length > 512) throw new Error(`${label} must not exceed 512 characters`);
  return url.href;
}

function customLinks() {
  let links;
  try { links = JSON.parse(input('custom-links', '[]')); }
  catch { throw new Error('custom-links must be a JSON array'); }
  if (!Array.isArray(links) || links.length > 2) throw new Error('custom-links must contain at most two links');
  return links.map(item => {
    if (!item || typeof item.label !== 'string' || !item.label.trim() || item.label.length > 80 || typeof item.url !== 'string' || !item.url) {
      throw new Error('Each custom link needs a label (1–80 characters) and an HTTP(S) url');
    }
    return { label: item.label, url: httpUrl(item.url, 'custom-links url') };
  });
}

export function getConfig(workspace) {
  const packDirectory = input('pack-directory', '.');
  const absolute = path.resolve(workspace, packDirectory);
  const relative = path.relative(workspace, absolute);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error('pack-directory must be inside the repository');
  }
  const color = input('color', '5865F2').replace(/^#/, '');
  if (!/^[a-f\d]{6}$/i.test(color)) throw new Error('color must be a six-digit hex color');
  return {
    packDirectory: relative.split(path.sep).join('/'),
    webhookUrl: input('webhook-url'),
    changelogUrl: httpUrl(input('changelog-url'), 'changelog-url'),
    avatarUrl: httpUrl(input('avatar-url'), 'avatar-url'),
    title: input('title'),
    description: input('description'),
    username: input('username').slice(0, 80),
    buttons: boolean('buttons', true),
    customLinks: customLinks(),
    color: parseInt(color, 16),
    roles: ids('mention-roles'),
    users: ids('mention-users'),
    everyone: boolean('mention-everyone', false),
    includeCommits: boolean('include-commits', true),
    includeFiles: boolean('include-files', true),
    includePackInfo: boolean('include-pack-info', true),
    excludePaths: input('exclude-paths').split(/\r?\n/).map(x => x.trim()).filter(Boolean),
    maxCommits: integer('max-commits', 10, 50),
    maxItems: integer('max-items', 50, 200),
    maxMessages: integer('max-messages', 5, 10),
    dryRun: boolean('dry-run', false),
    failOnError: boolean('fail-on-error', true),
  };
}
