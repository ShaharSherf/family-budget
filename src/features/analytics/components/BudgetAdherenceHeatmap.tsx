import { useMemo } from 'react'
import { formatMonthLabel, formatPercent } from '@/lib/format'
import { fromMonthDate } from '@/lib/month'
import { status } from '@/components/charts/chartTheme'
import type { ViewRow } from '@/lib/supabase/database.types'

function colorForPct(pct: number | null): string {
  if (pct === null) return 'transparent'
  if (pct < 80) return status.good
  if (pct <= 100) return status.warning
  return status.critical
}

export function BudgetAdherenceHeatmap({ data }: { data: ViewRow<'category_actuals'>[] }) {
  const { categories, months, cellByKey } = useMemo(() => {
    const expenseRows = data.filter((row) => row.kind === 'expense')
    const categorySet = new Set<string>()
    const monthSet = new Set<string>()
    const cells = new Map<string, number | null>()

    for (const row of expenseRows) {
      categorySet.add(row.name_he)
      monthSet.add(row.month_key)
      const pct = row.target_total && row.target_total > 0 ? ((row.actual_total ?? 0) / row.target_total) * 100 : null
      cells.set(`${row.name_he}|${row.month_key}`, pct)
    }

    return {
      categories: [...categorySet].sort((a, b) => a.localeCompare(b, 'he')),
      months: [...monthSet].sort(),
      cellByKey: cells,
    }
  }, [data])

  if (categories.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-xs">
        <thead>
          <tr>
            <th className="p-1 text-start text-gray-500 dark:text-gray-400"> </th>
            {months.map((m) => (
              <th key={m} className="p-1 text-center font-normal text-gray-500 dark:text-gray-400">
                {formatMonthLabel(fromMonthDate(m)).split(' ')[0]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category}>
              <td className="p-1 font-medium text-gray-700 dark:text-gray-300">{category}</td>
              {months.map((m) => {
                const pct = cellByKey.get(`${category}|${m}`) ?? null
                return (
                  <td key={m} className="p-0.5">
                    <div
                      title={pct !== null ? formatPercent(pct) : 'אין תקציב'}
                      className="flex h-7 w-14 items-center justify-center rounded text-[10px] font-medium text-white"
                      style={{ background: colorForPct(pct) }}
                    >
                      {pct !== null ? Math.round(pct) : ''}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex gap-3 text-[11px] text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: status.good }} /> מתחת לתקציב
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: status.warning }} /> קרוב לתקציב
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: status.critical }} /> חריגה
        </span>
      </div>
    </div>
  )
}
