import { useCallback, useRef, useState } from 'react';
import { api } from '../lib/api';

let nextId = 1;

/**
 * Chat state and streaming. `selection` tracks which answer and citation the evidence panel
 * is showing, so clicking a [n] marker or a chip in any message focuses the right card.
 */
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [selection, setSelection] = useState({ messageId: null, ref: null, nonce: 0 });
  const abortRef = useRef(null);

  const patch = useCallback((id, fn) => setMessages((all) => all.map((m) => (m.id === id ? { ...m, ...fn(m) } : m))), []);

  const send = useCallback(
    async (text) => {
      const question = text.trim();
      if (!question || busy) return;

      const userMsg = { id: nextId++, role: 'user', content: question };
      const botId = nextId++;
      setMessages((all) => [...all, userMsg, { id: botId, role: 'assistant', content: '', citations: [], followUps: [], streaming: true }]);
      setBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;
      try {
        await api.streamChat(question, {
          signal: controller.signal,
          onMeta: (meta) => {
            patch(botId, () => ({ mode: meta.mode, confidence: meta.confidence, citations: meta.citations, followUps: meta.followUps, calc: meta.calc }));
            setSelection((s) => ({ messageId: botId, ref: null, nonce: s.nonce + 1 }));
          },
          onToken: (t) => patch(botId, (m) => ({ content: m.content + t })),
        });
        patch(botId, () => ({ streaming: false }));
      } catch (err) {
        if (err.name === 'AbortError') patch(botId, (m) => ({ streaming: false, stopped: true, content: m.content || 'Stopped.' }));
        else patch(botId, () => ({ streaming: false, error: true, content: err.message || 'Something went wrong. Please try again.' }));
      } finally {
        abortRef.current = null;
        setBusy(false);
      }
    },
    [busy, patch],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);
  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setSelection({ messageId: null, ref: null, nonce: 0 });
  }, []);
  const select = useCallback((messageId, ref = null) => setSelection((s) => ({ messageId, ref, nonce: s.nonce + 1 })), []);

  return { messages, busy, send, stop, reset, selection, select };
}
