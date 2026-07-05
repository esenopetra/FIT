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
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className={over ? 'font-semibold text-amber-600' : 'text-slate-500'}>
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
        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className={`h-full rounded-full ${over ? 'bg-amber-500' : 'bg-brand-600'}`}
          style={{ width: `${visualPct}%` }}
        />
      </div>
    </div>
  );
}
