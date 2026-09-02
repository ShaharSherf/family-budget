// Colors are CSS custom properties (defined in src/index.css, light values on
// :root, dark values under prefers-color-scheme) so charts follow the
// viewer's theme automatically — no JS light/dark branching needed. Recharts
// accepts CSS var() strings directly in fill/stroke.

export const categorical = [
  'var(--series-1)',
  'var(--series-2)',
  'var(--series-3)',
  'var(--series-4)',
  'var(--series-5)',
  'var(--series-6)',
  'var(--series-7)',
  'var(--series-8)',
]

export const status = {
  good: 'var(--status-good)',
  warning: 'var(--status-warning)',
  serious: 'var(--status-serious)',
  critical: 'var(--status-critical)',
}

export const chrome = {
  surface: 'var(--chart-surface)',
  textPrimary: 'var(--chart-text-primary)',
  textSecondary: 'var(--chart-text-secondary)',
  muted: 'var(--chart-muted)',
  gridline: 'var(--chart-gridline)',
  baseline: 'var(--chart-baseline)',
}

const ils = new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 })
export const formatAxisILS = (value: number) => ils.format(value)
