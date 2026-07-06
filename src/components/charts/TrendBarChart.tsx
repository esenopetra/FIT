import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getChartColors } from './chartColors';
import { useIsDarkMode } from '../../hooks/useIsDarkMode';

export function TrendBarChart({
  data,
  dataKey,
  unit,
  color,
}: {
  data: Array<{ label: string; [key: string]: string | number }>;
  dataKey: string;
  unit: string;
  color: string;
}) {
  const isDark = useIsDarkMode();
  const colors = getChartColors(isDark);
  const tickStyle = { fontSize: 12, fill: colors.axis };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={colors.grid} vertical={false} />
        <XAxis dataKey="label" tick={tickStyle} axisLine={false} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={false} tickLine={false} unit={unit} />
        <Tooltip
          cursor={{ fill: 'var(--color-surface-hover)' }}
          contentStyle={{
            border: '1px solid var(--color-line)',
            borderRadius: 12,
            fontSize: 13,
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-ink)',
          }}
        />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
