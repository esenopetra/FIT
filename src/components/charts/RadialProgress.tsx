import { RadialBar, RadialBarChart, PolarAngleAxis } from 'recharts';
import { calculateProgressPercent } from '../../lib/calculations';
import { getChartColors } from './chartColors';
import { useIsDarkMode } from '../../hooks/useIsDarkMode';

export function RadialProgress({
  current,
  target,
  unit,
  color,
}: {
  current: number;
  target: number;
  unit: string;
  color: string;
}) {
  const isDark = useIsDarkMode();
  const colors = getChartColors(isDark);
  const pct = Math.min(calculateProgressPercent(current, target), 100);
  const data = [{ name: 'value', value: pct, fill: color }];

  return (
    <div className="relative flex items-center justify-center">
      <RadialBarChart
        width={160}
        height={160}
        cx="50%"
        cy="50%"
        innerRadius={56}
        outerRadius={74}
        barSize={12}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar background={{ fill: colors.track }} dataKey="value" cornerRadius={6} angleAxisId={0} />
      </RadialBarChart>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-semibold text-ink">{Math.round(current)}</span>
        <span className="text-xs text-subtle">
          of {Math.round(target)} {unit}
        </span>
      </div>
    </div>
  );
}
