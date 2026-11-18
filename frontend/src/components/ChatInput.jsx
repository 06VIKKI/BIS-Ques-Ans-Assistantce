import React, { useRef, useState } from 'react';
import { ArrowUp, Square } from 'lucide-react';

const LIMIT = 500;

export default function ChatInput({ onSend, onStop, busy }) {
  const [text, setText] = useState('');
  const ref = useRef(null);

  const submit = () => {
    if (!text.trim() || busy) return;
    onSend(text);
    setText('');
    if (ref.current) ref.current.style.height = 'auto';
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const grow = (e) => {
    setText(e.target.value.slice(0, LIMIT));
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  return (
    <div className="rounded-xl border border-line bg-panel p-2 focus-within:border-brand">
      <label htmlFor="chat-input" className="sr-only">
        Ask a question about an Indian Standard
      </label>
      <div className="flex items-end gap-2">
        <textarea
          id="chat-input"
          ref={ref}
          rows={1}
          value={text}
          onChange={grow}
          onKeyDown={onKeyDown}
          placeholder="Ask about a clause or limit"
          className="max-h-36 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-2 text-[15px] placeholder:text-muted/70 focus:outline-none"
        />
        {busy ? (
          <button type="button" onClick={onStop} className="btn btn-quiet !p-2.5" aria-label="Stop generating">
            <Square className="h-4 w-4 fill-current" />
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={!text.trim()} className="btn btn-primary !p-2.5" aria-label="Send question">
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </div>
      {text.length > LIMIT - 80 && <p className="px-2 pb-1 text-right text-[11px] text-muted tabular-nums">{text.length} / {LIMIT}</p>}
    </div>
  );
}
