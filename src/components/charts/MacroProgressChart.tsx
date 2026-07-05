import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function MacroProgressChart({
  protein,
  carbs,
  fat,
}: {
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
}) {
  const data = [
    { name: 'Protein', consumed: Math.round(protein.current), target: protein.target },
    { name: 'Carbs', consumed: Math.round(carbs.current), target: carbs.target },
    { name: 'Fat', consumed: Math.round(fat.current), target: fat.target },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} unit="g" />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="consumed" name="Consumed" fill="#16a34a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="target" name="Target" fill="#bbf7d0" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
