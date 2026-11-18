/**
 * Renders audit data to downloadable formats. Nothing here touches the network or disk.
 */

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const STATUS_LABEL = { pass: 'Pass', fail: 'Fail', warn: 'Observation', na: 'Not applicable' };

/* ---------------------------------------------------------------- session log */

export function buildSessionExport(snap, format) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const base = `bis-assist-session-${snap.id.slice(0, 8)}-${stamp}`;
  const exportedAt = new Date().toISOString();

  if (format === 'csv') {
    const rows = [['seq', 'timestamp', 'type', 'summary', 'hash'].join(',')];
    for (const e of snap.events) rows.push([e.seq, e.timestamp, e.type, csvCell(e.summary), e.hash].join(','));
    return { contentType: 'text/csv; charset=utf-8', filename: `${base}.csv`, body: rows.join('\n') + '\n' };
  }

  if (format === 'md') {
    const lines = [
      '# BIS-Assist session log',
      '',
      `- Session: \`${snap.id}\``,
      `- Started: ${snap.createdAt}`,
      `- Exported: ${exportedAt}`,
      `- Events: ${snap.integrity.eventCount}`,
      `- Chain integrity: ${snap.integrity.valid ? 'verified' : `BROKEN at event ${snap.integrity.brokenAt}`}`,
      `- Chain head: \`${snap.integrity.head}\``,
      '',
      '| # | Time (UTC) | Type | Summary | Hash |',
      '|---|---|---|---|---|',
      ...snap.events.map((e) => `| ${e.seq} | ${e.timestamp} | ${e.type} | ${String(e.summary).replace(/\|/g, '\\|')} | \`${e.hash.slice(0, 12)}\` |`),
      '',
      'Each hash covers the event and the previous hash. Editing or removing any row invalidates every later hash.',
    ];
    return { contentType: 'text/markdown; charset=utf-8', filename: `${base}.md`, body: lines.join('\n') + '\n' };
  }

  return {
    contentType: 'application/json; charset=utf-8',
    filename: `${base}.json`,
    body: JSON.stringify({ exportedAt, session: { id: snap.id, createdAt: snap.createdAt }, integrity: snap.integrity, events: snap.events, reports: snap.reports }, null, 2),
  };
}

/* ----------------------------------------------------------- compliance report */

export function buildReportExport(report, format, integrity) {
  const base = `bis-assist-${report.reportId}`;

  if (format === 'json') {
    return { contentType: 'application/json; charset=utf-8', filename: `${base}.json`, body: JSON.stringify({ report, auditChainHead: integrity?.head || null }, null, 2) };
  }

  if (format === 'md') {
    const lines = [
      `# Compliance audit report ${report.reportId}`,
      '',
      `**Result: ${report.verdict.label}**  (${report.counts.pass} pass, ${report.counts.fail} fail, ${report.counts.warn} observation${report.counts.warn === 1 ? '' : 's'}, ${report.counts.na} not applicable)`,
      '',
      `- Check: ${report.title} against ${report.standard}`,
      `- Generated: ${report.generatedAt}`,
      `- Input source: ${report.source}${report.filename ? ` (${report.filename})` : ''}`,
      '',
      '## Inputs',
      '',
      '| Parameter | Value |', '|---|---|',
      ...report.inputs.map((i) => `| ${i.label} | ${i.value}${i.unit ? ' ' + i.unit : ''} |`),
      '',
      '## Checks',
      '',
      '| Result | Check | Required | Provided | Clause |', '|---|---|---|---|---|',
      ...report.checks.map((c) => `| ${STATUS_LABEL[c.status]} | ${c.name} | ${c.requirement} | ${c.provided} | ${c.citation?.label || ''} |`),
      '',
      ...(report.checks.some((c) => c.advice)
        ? ['## Corrective actions', '', ...report.checks.filter((c) => c.advice).map((c) => `- **${c.name}:** ${c.advice}`), '']
        : []),
      '## Derived values',
      '',
      ...report.derived.map((d) => `- ${d.label}: ${d.value}`),
      '',
      '## Clause excerpts relied on',
      '',
      ...[...new Map(report.checks.filter((c) => c.citation).map((c) => [c.citation.id, c.citation])).values()].flatMap((c) => [`**${c.label}** ${c.heading}`, '', `> ${c.text}`, '']),
      '---',
      '',
      `_${report.notice}_`,
      ...(integrity ? ['', `Session audit chain head: \`${integrity.head}\``] : []),
    ];
    return { contentType: 'text/markdown; charset=utf-8', filename: `${base}.md`, body: lines.join('\n') + '\n' };
  }

  return { contentType: 'text/html; charset=utf-8', filename: `${base}.html`, body: renderReportHtml(report, integrity) };
}

function renderReportHtml(report, integrity) {
  const colour = { pass: '#17794a', fail: '#b42318', conditional: '#9a6700' }[report.verdict.code];
  const excerpts = [...new Map(report.checks.filter((c) => c.citation).map((c) => [c.citation.id, c.citation])).values()];
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Compliance audit ${esc(report.reportId)}</title>
<style>
  :root { --ink:#14213d; --muted:#5a6478; --line:#d6dad2; --paper:#fff; }
  * { box-sizing: border-box; }
  body { font: 14px/1.5 "IBM Plex Sans", system-ui, -apple-system, Segoe UI, sans-serif; color: var(--ink); margin: 0; background: #f4f5f1; }
  main { max-width: 920px; margin: 0 auto; padding: 32px 28px 48px; background: var(--paper); }
  h1 { font-size: 22px; margin: 0 0 4px; } h2 { font-size: 15px; margin: 28px 0 8px; padding-bottom: 4px; border-bottom: 1px solid var(--line); }
  .meta { color: var(--muted); font-size: 12.5px; }
  .verdict { display: inline-block; margin: 16px 0 6px; padding: 8px 16px; border: 2px solid ${colour}; color: ${colour}; font-weight: 700; letter-spacing: .02em; border-radius: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; } th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--line); vertical-align: top; }
  th { color: var(--muted); font-weight: 600; font-size: 12px; }
  .st { font-weight: 600; white-space: nowrap; } .st.pass { color:#17794a } .st.fail { color:#b42318 } .st.warn { color:#9a6700 } .st.na { color: var(--muted) }
  blockquote { margin: 4px 0 14px; padding: 6px 12px; border-left: 3px solid var(--ink); font-family: "IBM Plex Serif", Georgia, serif; color: #2b3550; }
  .notice { margin-top: 28px; padding: 10px 12px; background: #fff7e6; border: 1px solid #f0d9a8; font-size: 12px; }
  code { font-size: 11.5px; word-break: break-all; }
  @media print { body { background: #fff; } main { padding: 0; max-width: none; } h2 { break-after: avoid; } tr, blockquote { break-inside: avoid; } }
</style></head><body><main>
<h1>Compliance audit report</h1>
<div class="meta">${esc(report.reportId)} &nbsp;|&nbsp; ${esc(report.generatedAt)} &nbsp;|&nbsp; ${esc(report.title)} against ${esc(report.standard)}</div>
<div class="meta">Input source: ${esc(report.source)}${report.filename ? ` (${esc(report.filename)})` : ''}</div>
<div class="verdict">${esc(report.verdict.label)}</div>
<div class="meta">${report.counts.pass} pass, ${report.counts.fail} fail, ${report.counts.warn} observation${report.counts.warn === 1 ? '' : 's'}, ${report.counts.na} not applicable. Conformance score ${report.score}%.</div>

<h2>Inputs</h2>
<table><tbody>${report.inputs.map((i) => `<tr><th>${esc(i.label)}</th><td>${esc(i.value)}${i.unit ? ' ' + esc(i.unit) : ''}</td></tr>`).join('')}</tbody></table>

<h2>Checks</h2>
<table><thead><tr><th>Result</th><th>Check</th><th>Required</th><th>Provided</th><th>Clause</th></tr></thead><tbody>
${report.checks.map((c) => `<tr><td class="st ${c.status}">${STATUS_LABEL[c.status]}</td><td>${esc(c.name)}</td><td>${esc(c.requirement)}</td><td>${esc(c.provided)}</td><td>${esc(c.citation?.label || '')}</td></tr>`).join('\n')}
</tbody></table>

${report.checks.some((c) => c.advice) ? `<h2>Corrective actions</h2><ul>${report.checks.filter((c) => c.advice).map((c) => `<li><strong>${esc(c.name)}:</strong> ${esc(c.advice)}</li>`).join('')}</ul>` : ''}

<h2>Derived values</h2>
<table><tbody>${report.derived.map((d) => `<tr><th>${esc(d.label)}</th><td>${esc(d.value)}</td></tr>`).join('')}</tbody></table>

<h2>Clause excerpts relied on</h2>
${excerpts.map((c) => `<div><strong>${esc(c.label)}</strong> ${esc(c.heading)}<blockquote>${esc(c.text)}</blockquote></div>`).join('')}

<div class="notice">${esc(report.notice)}</div>
${integrity ? `<p class="meta">Session audit chain head: <code>${esc(integrity.head)}</code></p>` : ''}
</main></body></html>`;
}
