const ils = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
})

export function formatILS(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '—'
  return ils.format(amount)
}

const pct = new Intl.NumberFormat('he-IL', { style: 'percent', maximumFractionDigits: 0 })

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return pct.format(value / 100)
}

const monthLabelFormatter = new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' })

/** `monthKey` is a "YYYY-MM" string. */
export function formatMonthLabel(monthKey: string): string {
  return monthLabelFormatter.format(new Date(`${monthKey}-01T00:00:00`))
}
