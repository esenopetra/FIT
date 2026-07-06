import { calculateProgressPercent } from '../../lib/calculations';

export function ProgressBar({
  label,
  current,
  target,
  unit,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
}) {
  const pct = calculateProgressPercent(current, target);
  const visualPct = Math.min(pct, 100);
  const over = pct > 100;

  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-ink-secondary">{label}</span>
        <span className={over ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-subtle'}>
          {Math.round(current)}
          {unit} / {Math.round(target)}
          {unit} · {pct}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-full bg-track"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${over ? 'bg-amber-500' : 'bg-brand-600'}`}
          style={{ width: `${visualPct}%` }}
        />
      </div>
    </div>
  );
}
