import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

export function AppLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-full bg-page">
      <header className="sticky top-0 z-10 border-b border-line/70 bg-surface/90 px-4 py-3.5 backdrop-blur">
        <h1 className="text-lg font-semibold tracking-tight text-ink">{title}</h1>
      </header>
      <main className="mx-auto max-w-lg px-4 pb-24 pt-5">{children}</main>
      <BottomNav />
    </div>
  );
}
