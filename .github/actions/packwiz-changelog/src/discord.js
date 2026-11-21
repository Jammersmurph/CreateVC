export function truncate(value, max) {
  const text = String(value);
  if (text.length <= max) return text;
  // Avoid cutting a UTF-16 surrogate pair.
  let end = max - 1;
  if (/[\uD800-\uDBFF]/.test(text[end - 1] || '')) end--;
  return `${text.slice(0, end)}…`;
}

export function escape(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/([`*_~|[\]()<>])/g, '\\$1').replace(/[\r\n]+/g, ' ');
}

function link(label, url) {
  // Percent-encode delimiters Discord's Markdown parser treats as link boundaries.
  return `[${escape(label)}](${url.replace(/[()<>\s\\]/g, char => encodeURIComponent(char))})`;
}

function blob(context, sha, file) {
  return `${context.repoUrl}/blob/${sha}/${file.split('/').map(encodeURIComponent).join('/')}`;
}

function modLine(mod, context, removed = false) {
  const label = truncate(mod.name, 160);
  const url = mod.source || blob(context, removed ? context.before : context.after, mod.file);
  const badges = [
    mod.side !== 'both' ? escape(mod.side) : '',
    mod.optional ? 'optional' : '',
  ].filter(Boolean);
  let detail = '';
  if (mod.previous) {
    const old = mod.previous.filename || mod.previous.version;
    const current = mod.filename || mod.version;
    detail = old !== current
      ? ` — ${escape(truncate(old, 100))} → ${escape(truncate(current, 100))}`
      : ' — metadata/configuration changed';
  }
  return `• ${link(label, url)}${badges.length ? ` (${badges.join(', ')})` : ''}${detail}`;
}

function section(title, lines, maxItems) {
  if (!lines.length) return [];
  const limited = lines.slice(0, maxItems);
  if (lines.length > maxItems) limited.push(`…and ${lines.length - maxItems} more (see changelog).`);
  return [`**${title} (${lines.length})**`, ...limited, ''];
}

export function buildMessages(report, commits, context, config) {
  const { pack, added, removed, updated, files } = report;
  const title = truncate(config.title || `${pack.name || 'Packwiz'} • ${context.branch}`, 256);
  const navigation = [
    { label: 'Commit', url: `${context.repoUrl}/commit/${context.after}` },
    { label: 'Changelog', url: config.changelogUrl || context.compareUrl },
    { label: context.isTag ? 'Tag' : 'Branch', url: `${context.repoUrl}/tree/${encodeURIComponent(context.branch)}` },
    ...config.customLinks,
  ];
  if (navigation.some(item => item.url.length > 512)) throw new Error('A navigation URL exceeds Discord’s 512-character button URL limit');
  const mentionText = [
    ...config.roles.map(id => `<@&${id}>`),
    ...config.users.map(id => `<@${id}>`),
    config.everyone ? '@everyone' : '',
  ].filter(Boolean).join(' ');
  if (mentionText.length > 2000) throw new Error('Configured mentions exceed Discord’s 2,000-character content limit');
  const heading = index => `## ${escape(index === 0 ? title : truncate(`${title} (continued)`, 256))}`;
  // Components V2 allows 4,000 text characters across the message. Reserve
  // space for the heading, configured mentions, footer, and truncation notice.
  const pageLimit = Math.min(3500, 3800 - Math.max(heading(0).length, heading(1).length) - mentionText.length);
  const lines = [];
  if (config.description) lines.push(truncate(config.description, 1500), '');
  lines.push(`**${added.length} added · ${removed.length} removed · ${updated.length} updated**`);
  lines.push(`Pushed by ${link(context.actor, `${context.serverUrl}/${encodeURIComponent(context.actor)}`)}${context.forced ? ' • **Force push**' : ''}${context.created ? ' • New ref' : ''}`, '');
  if (config.includePackInfo) {
    const versions = Object.entries(pack.versions || {}).map(([key, value]) => `${escape(key)} ${escape(value)}`);
    const info = [pack.version ? `Pack ${escape(pack.version)}` : '', ...versions].filter(Boolean).join(' • ');
    if (info) lines.push(truncate(info, 1000), '');
  }
  lines.push(...section('Added mods', added.map(mod => modLine(mod, context)), config.maxItems));
  lines.push(...section('Removed mods', removed.map(mod => modLine(mod, context, true)), config.maxItems));
  lines.push(...section('Updated mods', updated.map(mod => modLine(mod, context)), config.maxItems));
  if (config.includeFiles) lines.push(...section('Other pack changes', files.map(({ file, status }) =>
    `• ${status === 'A' ? 'Added' : status === 'D' ? 'Removed' : 'Changed'} ${link(truncate(file, 200), blob(context, status === 'D' ? context.before : context.after, file))}`), config.maxItems));
  if (config.includeCommits) {
    lines.push(...section('Commits', commits.slice(0, config.maxCommits).map(commit =>
      `• ${link(commit.sha.slice(0, 7), `${context.repoUrl}/commit/${commit.sha}`)} ${escape(truncate(commit.subject, 250))} — ${escape(truncate(commit.author, 80))}`), config.maxCommits));
    if (commits.length > config.maxCommits) lines.push('More commits are available in the changelog.', '');
  }
  if (!added.length && !removed.length && !updated.length && !files.length) {
    lines.push('No pack changes detected in the selected directory.');
  }
  // One container per message, with the button row inside the container.
  const pages = [];
  let page = '';
  for (const raw of lines) {
    const line = truncate(raw, Math.min(1500, pageLimit - 1));
    if (page && page.length + line.length + 1 > pageLimit) { pages.push(page.trim()); page = ''; }
    page += `${line}\n`;
  }
  if (page.trim()) pages.push(page.trim());
  const clipped = pages.length > config.maxMessages;
  const visible = pages.slice(0, config.maxMessages);
  if (clipped) visible[visible.length - 1] += '\n\n**Report truncated — view the changelog for all changes.**';
  return visible.map((description, index) => ({
    ...(config.username ? { username: config.username } : {}),
    ...(config.avatarUrl ? { avatar_url: config.avatarUrl } : {}),
    flags: 32768,
    allowed_mentions: index === 0
      ? { parse: config.everyone ? ['everyone'] : [], roles: config.roles, users: config.users }
      : { parse: [], roles: [], users: [] },
    components: [{
      type: 17,
      accent_color: config.color,
      components: [
        { type: 10, content: `${heading(index)}${index === 0 && mentionText ? `\n${mentionText}` : ''}` },
        { type: 10, content: description },
        { type: 14, divider: true, spacing: 1 },
        { type: 10, content: `-# Packwiz changelog • ${index + 1}/${visible.length}` },
        ...(config.buttons ? [{
          type: 1,
          components: navigation.map(item => ({ type: 2, style: 5, label: item.label, url: item.url })),
        }] : []),
      ],
    }],
  }));
}

export function validateWebhook(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('A valid Discord webhook-url is required'); }
  if (url.protocol !== 'https:' || !['discord.com', 'canary.discord.com', 'ptb.discord.com', 'discordapp.com'].includes(url.hostname)
    || url.port || url.username || url.password
    || !/^\/api(?:\/v\d+)?\/webhooks\/\d+\/[\w-]+\/?$/.test(url.pathname)) {
    throw new Error('webhook-url must be an HTTPS Discord webhook URL');
  }
  // Preserve thread_id for forum/thread webhooks; confirmation avoids silent HTTP 204 failures.
  url.searchParams.set('wait', 'true');
  url.searchParams.set('with_components', 'true');
  return url;
}

export async function sendMessages(webhookUrl, messages, { fetcher = fetch, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) } = {}) {
  const url = validateWebhook(webhookUrl);
  for (const payload of messages) {
    for (let attempt = 0; attempt < 5; attempt++) {
      let response;
      try {
        response = await fetcher(url, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload), signal: AbortSignal.timeout(20_000),
          redirect: 'error',
        });
      } catch {
        // Delivery may have succeeded before the connection failed. Avoid duplicate notifications.
        throw new Error('Discord request failed or timed out; delivery is uncertain. Check Discord before rerunning.');
      }
      if (response.ok) { await response.text(); break; }
      if ((response.status === 429 || response.status >= 500) && attempt < 4) {
        let body = {};
        try { body = await response.json(); } catch { /* No JSON on some server errors. */ }
        const seconds = Number(body.retry_after ?? response.headers.get('retry-after') ?? 2 ** attempt);
        await sleep(Math.min(60, Math.max(1, Number.isFinite(seconds) ? seconds : 2 ** attempt)) * 1000);
        continue;
      }
      // Never echo a response body or URL: either might contain credentials.
      throw new Error(`Discord rejected the notification (HTTP ${response.status}). Check webhook permissions and configuration.`);
    }
  }
}
