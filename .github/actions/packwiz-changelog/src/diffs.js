import picomatch from 'picomatch';

export async function collectDiffs(git, before, after, files, config) {
  if (!before || !config.includeDiffs || !config.includeFiles) return [];
  const included = picomatch(config.diffPaths, { dot: true });
  const excluded = config.diffExcludePaths.length ? picomatch(config.diffExcludePaths, { dot: true, nocase: true }) : () => false;
  const generated = /(?:^|\/)(?:pack\.toml|index\.toml|package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/;
  const candidates = files.filter(({ file }) => included(file) && !excluded(file) && !generated.test(file))
    .slice(0, config.maxDiffFiles);
  const previews = [];
  for (const { file } of candidates) {
    const patch = await git.diff(before, after, file);
    if (!patch || patch.includes('\0') || /^(?:index .* 120000|(?:old|new|deleted file|new file) mode (?:120000|160000))$/m.test(patch)) continue;
    const body = patch.split('\n');
    const start = body.findIndex(line => line.startsWith('@@'));
    if (start < 0) continue; // Binary files and mode-only changes have no text hunks.
    const lines = body.slice(start).filter(line => /^[@ +\-]/.test(line));
    if (!lines.length) continue;
    const selected = [];
    let size = 0;
    for (const line of lines) {
      // Prevent untrusted file contents from closing the Discord code fence.
      const safe = line.replaceAll('`', '`\u200b');
      if (selected.length >= config.maxDiffLines || size + safe.length + 1 > 1100) break;
      selected.push(safe);
      size += safe.length + 1;
    }
    if (selected.length) previews.push({ file, lines: selected, truncated: selected.length < lines.length });
  }
  return previews;
}
