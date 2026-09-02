// Months are handled as plain "YYYY-MM" strings throughout the app (URL param,
// display) and converted to Postgres's "YYYY-MM-01" date key only at the
// query-function boundary. Never day-level granularity, so plain integer
// arithmetic beats pulling in a date library.

export function currentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function addMonths(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split('-').map(Number)
  const total = year * 12 + (month - 1) + delta
  const nextYear = Math.floor(total / 12)
  const nextMonth = (total % 12) + 1
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}`
}

export function monthRange(fromKey: string, toKey: string): string[] {
  const months: string[] = []
  let cursor = fromKey
  while (cursor <= toKey) {
    months.push(cursor)
    cursor = addMonths(cursor, 1)
  }
  return months
}

/** "YYYY-MM" -> "YYYY-MM-01", the Postgres `date` primary key used by `months`. */
export function toMonthDate(monthKey: string): string {
  return `${monthKey}-01`
}

/** "YYYY-MM-01" -> "YYYY-MM" */
export function fromMonthDate(monthDate: string): string {
  return monthDate.slice(0, 7)
}
