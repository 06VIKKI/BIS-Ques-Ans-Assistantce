import React from 'react';
import { CircleCheck, CircleX, TriangleAlert, MinusCircle } from 'lucide-react';

const STYLES = {
  pass: { label: 'Pass', Icon: CircleCheck, cls: 'text-pass bg-pass/10 border-pass/30' },
  fail: { label: 'Fail', Icon: CircleX, cls: 'text-fail bg-fail/10 border-fail/30' },
  warn: { label: 'Observation', Icon: TriangleAlert, cls: 'text-warn bg-warn/10 border-warn/30' },
  na: { label: 'Not applicable', Icon: MinusCircle, cls: 'text-muted bg-sunken border-line' },
};

/** Status is always shown as icon plus text, never colour alone. */
export default function StatusBadge({ status, size = 'sm' }) {
  const { label, Icon, cls } = STYLES[status] || STYLES.na;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium ${size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'} ${cls}`}>
      <Icon className={size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} aria-hidden="true" />
      {label}
    </span>
  );
}
