export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3.5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight text-ink">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-subtle">{sub}</p>}
    </div>
  );
}
