import type { ReactNode } from 'react';

export type StatListItem = {
  label: string;
  value: ReactNode;
};

export function StatList({ items }: { items: StatListItem[] }) {
  return (
    <dl className="divide-y divide-line-subtle">
      {items.map((item, index) => (
        <div key={index} className="flex items-center justify-between gap-4 py-2 text-sm first:pt-0 last:pb-0">
          <dt className="text-muted">{item.label}</dt>
          <dd className="font-medium text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
