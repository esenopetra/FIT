import type { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

export function AppLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-full bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </header>
      <main className="mx-auto max-w-lg px-4 pb-24 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
