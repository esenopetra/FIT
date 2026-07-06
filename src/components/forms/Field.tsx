import type { ReactNode } from 'react';

export function Field({
  label,
  htmlFor,
  error,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-ink-secondary">
        {label}
        {optional && <span className="ml-1 text-subtle">(optional)</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
