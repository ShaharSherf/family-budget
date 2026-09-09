import { formatILS } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { ViewRow } from '@/lib/supabase/database.types'

export function YtdStatTiles({ data }: { data: ViewRow<'month_kpis'>[] }) {
  const incomeTotal = data.reduce((sum, r) => sum + r.income_actual, 0)
  const expenseTotal = data.reduce((sum, r) => sum + r.expense_actual, 0)
  const netTotal = incomeTotal - expenseTotal

  const tiles = [
    { label: 'הכנסות (סה"כ)', value: incomeTotal, color: 'text-green-600 dark:text-green-400' },
    { label: 'הוצאות (סה"כ)', value: expenseTotal, color: 'text-gray-900 dark:text-gray-100' },
    { label: 'נטו (סה"כ)', value: netTotal, color: 'text-blue-600 dark:text-blue-400' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-xs text-gray-500 dark:text-gray-400">{tile.label}</div>
          <div className={cn('text-xl font-bold', tile.color)}>{formatILS(tile.value)}</div>
        </div>
      ))}
    </div>
  )
}
