import React from 'react';
import { MessageSquareText, ClipboardCheck, Library, ScrollText } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

export const TABS = [
  { id: 'assistant', label: 'Assistant', Icon: MessageSquareText },
  { id: 'compliance', label: 'Compliance check', Icon: ClipboardCheck },
  { id: 'library', label: 'Standards library', Icon: Library },
  { id: 'audit', label: 'Audit trail', Icon: ScrollText },
];

export default function Header({ activeTab, onTab, theme, onToggleTheme, auditCount }) {
  const tabButton = (t, compact) => {
    const active = activeTab === t.id;
    return (
      <button
        key={t.id}
        type="button"
        onClick={() => onTab(t.id)}
        aria-current={active ? 'page' : undefined}
        className={`relative flex items-center gap-2 whitespace-nowrap px-3 text-sm font-medium transition-colors ${compact ? 'h-10' : 'h-16'} ${
          active ? 'text-ink' : 'text-muted hover:text-ink'
        }`}
      >
        <t.Icon className="h-4 w-4" aria-hidden="true" />
        {t.label}
        {t.id === 'audit' && auditCount > 0 && <span className="rounded-full bg-sunken px-1.5 text-[11px] font-semibold tabular-nums text-muted">{auditCount}</span>}
        {active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-accent" />}
      </button>
    );
  };

  return (
    <header className="shrink-0 border-b border-line bg-panel/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6">
        <button type="button" className="flex items-center gap-3 text-left" onClick={() => onTab('assistant')} aria-label="BIS-Assist home">
          <Logo />
          <span>
            <span className="block text-[17px] font-semibold leading-tight tracking-tight">BIS-Assist</span>
            <span className="hidden text-xs leading-tight text-muted sm:block">Indian Standards question answering</span>
          </span>
        </button>

        <nav className="hidden items-center md:flex" aria-label="Main">
          {TABS.map((t) => tabButton(t, false))}
        </nav>

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
      <nav className="flex overflow-x-auto border-t border-line px-2 md:hidden" aria-label="Main">
        {TABS.map((t) => tabButton(t, true))}
      </nav>
    </header>
  );
}
