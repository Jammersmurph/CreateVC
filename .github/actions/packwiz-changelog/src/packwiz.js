import TOML from '@iarna/toml';
import picomatch from 'picomatch';

export function parseToml(text, file) {
  try { return TOML.parse(text); }
  catch { throw new Error(`Invalid TOML in ${file}`); }
}

export function modFromToml(text, file) {
  const data = parseToml(text, file);
  const mr = data.update?.modrinth;
  const cf = data.update?.curseforge;
  const identity = mr?.['mod-id'] ? `modrinth:${mr['mod-id']}`
    : cf?.['project-id'] ? `curseforge:${cf['project-id']}` : `path:${file}`;
  const source = mr?.['mod-id']
    ? `https://modrinth.com/mod/${encodeURIComponent(mr['mod-id'])}`
    : cf?.['project-id']
      ? `https://www.curseforge.com/projects/${encodeURIComponent(cf['project-id'])}` : '';
  // Do not expose download URLs: they can contain private tokens. Unknown providers link to the manifest.
  return {
    file, identity, source,
    name: String(data.name || file.split('/').at(-1).replace(/\.pw\.toml$/, '')),
    filename: String(data.filename || ''),
    version: String(mr?.version || cf?.['file-id'] || ''),
    side: String(data.side || 'both'),
    optional: data.option?.optional === true,
    data,
  };
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export async function analyze(git, before, after, config) {
  const prefix = config.packDirectory ? `${config.packDirectory}/` : '';
  const packPath = `${prefix}pack.toml`;
  let packText;
  try { packText = await git.file(after, packPath); }
  catch { throw new Error(`Cannot read ${packPath} at the pushed commit. Is this a packwiz repository?`); }
  const pack = parseToml(packText, packPath);
  const excluded = config.excludePaths.length ? picomatch(config.excludePaths, { dot: true }) : () => false;
  const changes = (await git.changes(before, after)).filter(({ file }) => file.startsWith(prefix) && !excluded(file));
  const oldMods = [];
  const newMods = [];
  const files = [];
  for (const change of changes) {
    if (!change.file.endsWith('.pw.toml')) {
      // Generated hashes create noise; pack.toml remains visible for pack version changes.
      if (change.file !== `${prefix}${pack.index?.file || 'index.toml'}`) files.push(change);
      continue;
    }
    if (before && change.status !== 'A') oldMods.push(modFromToml(await git.file(before, change.file), change.file));
    if (change.status !== 'D') newMods.push(modFromToml(await git.file(after, change.file), change.file));
  }
  const added = [], removed = [], updated = [];
  const used = new Set();
  for (const old of oldMods) {
    let index = newMods.findIndex((mod, i) => !used.has(i) && mod.identity === old.identity && mod.file === old.file);
    if (index < 0) index = newMods.findIndex((mod, i) => !used.has(i) && mod.identity === old.identity);
    if (index < 0) { removed.push(old); continue; }
    used.add(index);
    const mod = newMods[index];
    if (stable(mod.data) !== stable(old.data) || old.file !== mod.file) updated.push({ ...mod, previous: old });
  }
  newMods.forEach((mod, index) => { if (!used.has(index)) added.push(mod); });
  for (const list of [added, removed, updated]) list.sort((a, b) => a.name.localeCompare(b.name));
  return { pack, added, removed, updated, files };
}
