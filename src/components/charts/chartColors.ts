// One consistent hue per metric across every chart in the app — never mixed
// within a single chart, so no CVD-safe categorical ordering is needed.
// Dark-mode steps are tuned per-hue for the dark surface (not a flat opacity
// flip), matching the dataviz skill's validated categorical palette.
export type ChartColors = {
  calories: string;
  water: string;
  exercise: string;
  weight: string;
  track: string;
  axis: string;
  grid: string;
};

const LIGHT: ChartColors = {
  calories: '#059669',
  water: '#2a78d6',
  exercise: '#eb6834',
  weight: '#4a3aa7',
  track: '#e5e7eb',
  axis: '#94a3b8',
  grid: '#e2e8f0',
};

const DARK: ChartColors = {
  calories: '#34d399',
  water: '#3987e5',
  exercise: '#d95926',
  weight: '#9085e9',
  track: '#232833',
  axis: '#8b96a5',
  grid: '#262b35',
};

export function getChartColors(isDark: boolean): ChartColors {
  return isDark ? DARK : LIGHT;
}
