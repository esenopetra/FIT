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
    <div className="flex min-h-full flex-col bg-surface">
      {step !== undefined && totalSteps !== undefined && (
        <div className="px-5 pt-5">
          <div className="mb-1.5 flex justify-between text-xs font-medium text-subtle">
            <span>
              Step {step} of {totalSteps}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-track">
            <div
              className="h-full rounded-full bg-brand-600 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-7">
        <h1 className="mb-6 text-xl font-semibold tracking-tight text-ink">{title}</h1>
        {children}
      </main>
    </div>
  );
}
