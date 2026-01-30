/**
 * Format a number with thousand separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('de-CH');
}

/**
 * Format distance in km with one decimal place
 */
export function formatDistance(km: number): string {
  return km.toFixed(1);
}

/**
 * Format calories as whole number
 */
export function formatCalories(cal: number): string {
  return Math.round(cal).toString();
}

/**
 * Calculate percentage (capped at 100%)
 */
export function calculatePercentage(current: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min((current / goal) * 100, 100);
}
