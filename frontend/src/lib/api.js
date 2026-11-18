/**
 * Thin client for the BIS-Assist API.
 * The session id lives in localStorage and is sent on every request so the server can keep
 * a per-browser audit trail without any login.
 */

const SESSION_KEY = 'bis-assist-session';

export function getSessionId() {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return (getSessionId.fallback ||= crypto.randomUUID());
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const res = await fetch(path, {
    method,
    signal,
    headers: { 'x-session-id': getSessionId(), ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.details = data.details;
    err.status = res.status;
    throw err;
  }
  return data;
}

/** Save a server-generated file (report or log) through the browser's download flow. */
async function download(path) {
  const res = await fetch(path, { headers: { 'x-session-id': getSessionId() } });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Download failed');
  const name = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') || '')?.[1] || 'bis-assist-export';
  saveBlob(await res.blob(), name);
}

export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Stream an answer over server-sent events.
 * Calls onMeta once (citations, confidence, follow-ups), then onToken for each chunk.
 */
async function streamChat(message, { onMeta, onToken, signal }) {
  const res = await fetch('/api/chat/stream', {
    method: 'POST',
    signal,
    headers: { 'content-type': 'application/json', 'x-session-id': getSessionId() },
    body: JSON.stringify({ message }),
  });
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const event = /^event: (.+)$/m.exec(frame)?.[1];
      const data = /^data: (.+)$/m.exec(frame)?.[1];
      if (!event || !data) continue;
      const payload = JSON.parse(data);
      if (event === 'meta') onMeta?.(payload);
      else if (event === 'token') onToken?.(payload.t);
    }
  }
}

export const api = {
  streamChat,
  prompts: () => request('/api/chat/prompts'),
  standards: () => request('/api/standards'),
  clauses: ({ standard = '', q = '' } = {}) => request(`/api/standards/clauses?standard=${encodeURIComponent(standard)}&q=${encodeURIComponent(q)}`),
  modules: () => request('/api/compliance/modules'),
  samples: () => request('/api/compliance/samples'),
  parseSpec: (filename, content) => request('/api/compliance/parse', { method: 'POST', body: { filename, content } }),
  runAudit: (payload) => request('/api/compliance/run', { method: 'POST', body: payload }),
  downloadReport: (id, format) => download(`/api/compliance/reports/${encodeURIComponent(id)}?format=${format}`),
  audit: () => request('/api/audit'),
  resetAudit: () => request('/api/audit', { method: 'DELETE' }),
  logCitationView: (clauseId) => request('/api/audit/event', { method: 'POST', body: { type: 'citation.view', clauseId } }).catch(() => {}),
  downloadLog: (format) => download(`/api/audit/export?format=${format}`),
};
