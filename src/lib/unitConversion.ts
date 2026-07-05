export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54 * 10) / 10;
}

export function kgToLb(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbToKg(lb: number): number {
  return Math.round((lb / 2.20462) * 10) / 10;
}

export function mlToLiters(ml: number): number {
  return Math.round((ml / 1000) * 100) / 100;
}

export function litersToMl(liters: number): number {
  return Math.round(liters * 1000);
}

// When heightUnit is 'ft_in', heightValue stores total inches (feet*12 + inches).
export function toHeightCm(value: number, unit: 'cm' | 'ft_in'): number {
  return unit === 'cm' ? value : Math.round(value * 2.54 * 10) / 10;
}

export function cmToTotalInches(cm: number): number {
  return Math.round((cm / 2.54) * 10) / 10;
}

export function toWeightKg(value: number, unit: 'kg' | 'lb'): number {
  return unit === 'kg' ? value : lbToKg(value);
}
