import type { ReactNode } from 'react';

export function OnboardingLayout({
  title,
  step,
  totalSteps,
  children,
}: {
  title: string;
  step?: number;
  totalSteps?: number;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      {step !== undefined && totalSteps !== undefined && (
        <div className="h-1.5 w-full bg-slate-200">
          <div
            className="h-full bg-brand-600 transition-all"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      )}
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-8">
        <h1 className="mb-6 text-xl font-semibold text-slate-900">{title}</h1>
        {children}
      </main>
    </div>
  );
}
