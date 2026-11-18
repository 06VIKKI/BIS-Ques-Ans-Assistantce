import React from 'react';

/** Inline markup: **bold** and [n] citation markers. */
function renderInline(text, { onCite, activeRef }, keyBase) {
  return text.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((part, i) => {
    if (!part) return null;
    const key = `${keyBase}-${i}`;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={key}>{part.slice(2, -2)}</strong>;
    const m = /^\[(\d+)\]$/.exec(part);
    if (m && onCite) {
      const ref = Number(m[1]);
      return (
        <button key={key} type="button" className="cite-marker" data-active={activeRef === ref} onClick={() => onCite(ref)} aria-label={`Show evidence ${ref}`}>
          {ref}
        </button>
      );
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

/**
 * Renders the small markdown subset the answer engine produces: paragraphs, "- " bullets,
 * **bold** and [n] markers. Safe against partial text, so it can be called while streaming.
 */
export function renderAnswer(text, opts = {}) {
  const blocks = text.split(/\n{2,}/);
  return blocks.map((block, bi) => {
    const lines = block.split('\n').filter((l) => l.trim() !== '');
    if (!lines.length) return null;
    if (lines.every((l) => l.startsWith('- '))) {
      return (
        <ul key={bi}>
          {lines.map((l, li) => (
            <li key={li}>{renderInline(l.slice(2), opts, `${bi}-${li}`)}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={bi}>
        {lines.map((l, li) => (
          <React.Fragment key={li}>
            {li > 0 && <br />}
            {renderInline(l, opts, `${bi}-${li}`)}
          </React.Fragment>
        ))}
      </p>
    );
  });
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Wrap words that match any of the (stemmed) query terms in <mark>. */
export function highlight(text, terms = []) {
  const useful = [...new Set(terms.filter((t) => t && t.length > 2))];
  if (!useful.length) return text;
  const re = new RegExp(`\\b(${useful.map(escapeRe).join('|')})[a-z]*`, 'gi');
  const out = [];
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<mark key={m.index}>{m[0]}</mark>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export const pct = (n) => `${Math.round(n * 100)}%`;
