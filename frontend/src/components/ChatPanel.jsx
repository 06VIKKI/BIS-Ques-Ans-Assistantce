import React, { useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import QuickPrompts from './QuickPrompts';

export default function ChatPanel({ chat, prompts, onCite }) {
  const { messages, busy, send, stop, reset, selection } = chat;
  const endRef = useRef(null);
  const empty = messages.length === 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  return (
    <section className="flex h-full min-h-0 flex-col" aria-label="Chat">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6" aria-live="polite">
        {empty ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center py-8 text-center">
            <h1 className="font-serif text-3xl font-normal leading-tight sm:text-4xl">Ask an Indian Standard</h1>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
              Get the requirement, the number and the clause it comes from. Every answer cites its source, and you can open the exact excerpt in the evidence panel.
            </p>
            <div className="mt-7 w-full">
              <QuickPrompts prompts={prompts} onPick={send} disabled={busy} />
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-5">
            {messages.map((m, i) => (
              <ChatMessage
                key={m.id}
                message={m}
                selected={selection.messageId === m.id}
                activeRef={selection.ref}
                onCite={onCite}
                onFollowUp={send}
                isLast={i === messages.length - 1}
                busy={busy}
              />
            ))}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <div className="border-t border-line bg-surface px-4 pb-4 pt-3 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-2.5">
          {!empty && (
            <div className="hidden sm:block">
              <QuickPrompts prompts={prompts} onPick={send} disabled={busy} compact />
            </div>
          )}
          <ChatInput onSend={send} onStop={stop} busy={busy} />
          <div className="flex items-center justify-between text-[11.5px] text-muted">
            <span className="hidden sm:inline">Answers come from the built-in corpus and cite their clauses.</span>
            {!empty && (
              <button type="button" onClick={reset} className="ml-auto inline-flex items-center gap-1 whitespace-nowrap hover:text-ink">
                <RotateCcw className="h-3 w-3" /> New chat
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
