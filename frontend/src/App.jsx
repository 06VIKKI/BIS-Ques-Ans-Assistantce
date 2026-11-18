import React, { useCallback, useEffect, useState } from 'react';
import { PanelRightOpen } from 'lucide-react';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import CitationPanel from './components/CitationPanel';
import ComplianceChecker from './components/ComplianceChecker';
import StandardsLibrary from './components/StandardsLibrary';
import AuditTrail from './components/AuditTrail';
import Footer from './components/Footer';
import { useTheme } from './hooks/useTheme';
import { useChat } from './hooks/useChat';
import { useMediaQuery } from './hooks/useMediaQuery';
import { api } from './lib/api';

const NO_CITATIONS = [];

export default function App() {
  const { theme, toggle } = useTheme();
  const chat = useChat();
  const desktop = useMediaQuery('(min-width: 1024px)');

  const [tab, setTab] = useState('assistant');
  const [prompts, setPrompts] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [libraryFocus, setLibraryFocus] = useState(null);
  const [auditCount, setAuditCount] = useState(0);
  const [activity, setActivity] = useState(0);

  useEffect(() => {
    api.prompts().then((d) => setPrompts(d.prompts)).catch(() => {});
  }, []);

  // Keep the audit badge in the header current after each answer or audit run.
  useEffect(() => {
    if (chat.busy) return;
    api.audit().then((d) => setAuditCount(d.events.length)).catch(() => {});
  }, [chat.busy, activity, tab]);

  const selected = chat.messages.find((m) => m.id === chat.selection.messageId);
  const citations = selected?.citations || NO_CITATIONS;
  const selectedIndex = chat.messages.findIndex((m) => m.id === chat.selection.messageId);
  const question = selectedIndex > 0 ? chat.messages[selectedIndex - 1].content : '';

  const handleCite = useCallback(
    (messageId, ref) => {
      chat.select(messageId, ref);
      if (!desktop) setDrawerOpen(true);
    },
    [chat, desktop],
  );

  const openInLibrary = (clauseId) => {
    setDrawerOpen(false);
    setLibraryFocus(clauseId);
    setTab('library');
  };

  const panel = (onClose) => (
    <CitationPanel citations={citations} question={question} focus={chat.selection} onClose={onClose} onOpenLibrary={openInLibrary} />
  );

  return (
    <div className="flex h-full flex-col">
      <Header activeTab={tab} onTab={setTab} theme={theme} onToggleTheme={toggle} auditCount={auditCount} />

      {tab === 'assistant' ? (
        <main className="relative min-h-0 flex-1 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_440px]">
          <ChatPanel chat={chat} prompts={prompts} onCite={handleCite} />

          {desktop ? (
            <div className="min-h-0 border-l border-line">{panel(null)}</div>
          ) : (
            <>
              {citations.length > 0 && !drawerOpen && (
                <button type="button" onClick={() => setDrawerOpen(true)} className="btn btn-primary fixed bottom-32 right-4 z-30 rounded-full shadow-lg">
                  <PanelRightOpen className="h-4 w-4" aria-hidden="true" />
                  Evidence ({citations.length})
                </button>
              )}
              {drawerOpen && (
                <div className="fixed inset-0 z-50 flex items-end bg-ink/50" onClick={() => setDrawerOpen(false)} role="dialog" aria-modal="true" aria-label="Evidence">
                  <div className="h-[82dvh] w-full animate-sheet-in overflow-hidden rounded-t-2xl border-t border-line bg-surface" onClick={(e) => e.stopPropagation()}>
                    {panel(() => setDrawerOpen(false))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      ) : (
        <main className="min-h-0 flex-1 overflow-y-auto">
          {tab === 'compliance' && <ComplianceChecker onActivity={() => setActivity((n) => n + 1)} />}
          {tab === 'library' && <StandardsLibrary focusClauseId={libraryFocus} />}
          {tab === 'audit' && <AuditTrail refreshKey={activity + chat.messages.length} onChanged={setAuditCount} />}
          <Footer />
        </main>
      )}
    </div>
  );
}
