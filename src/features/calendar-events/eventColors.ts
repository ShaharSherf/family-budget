export const EVENT_COLORS = [
  { value: 'blue', swatch: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  { value: 'green', swatch: 'bg-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  { value: 'red', swatch: 'bg-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  { value: 'amber', swatch: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  { value: 'purple', swatch: 'bg-purple-500', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
  { value: 'pink', swatch: 'bg-pink-500', badge: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300' },
] as const

export function eventColorBadgeClasses(color: string): string {
  return EVENT_COLORS.find((c) => c.value === color)?.badge ?? EVENT_COLORS[0].badge
}
