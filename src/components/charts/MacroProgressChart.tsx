import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getChartColors } from './chartColors';
import { useIsDarkMode } from '../../hooks/useIsDarkMode';

export function MacroProgressChart({
  protein,
  carbs,
  fat,
}: {
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
}) {
  const isDark = useIsDarkMode();
  const colors = getChartColors(isDark);
  const tickStyle = { fontSize: 12, fill: colors.axis };

  const data = [
    { name: 'Protein', consumed: Math.round(protein.current), target: protein.target },
    { name: 'Carbs', consumed: Math.round(carbs.current), target: carbs.target },
    { name: 'Fat', consumed: Math.round(fat.current), target: fat.target },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid stroke={colors.grid} vertical={false} />
        <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={false} tickLine={false} unit="g" />
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
        <Legend wrapperStyle={{ fontSize: 12, color: colors.axis }} iconType="circle" iconSize={8} />
        <Bar dataKey="consumed" name="Consumed" fill={colors.calories} radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="target" name="Target" fill={colors.track} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
