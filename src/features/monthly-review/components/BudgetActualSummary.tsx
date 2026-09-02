import { formatILS } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { MonthTotals } from '../utils'

function Tile({
  label,
  actual,
  target,
  warnIfOverTarget = false,
  warnIfNegative = false,
}: {
  label: string
  actual: number
  target?: number
  /** Exceeding target is bad — use for expenses, never for income (exceeding an income target is good). */
  warnIfOverTarget?: boolean
  /** Being negative is bad — use for a net/leftover figure. */
  warnIfNegative?: boolean
}) {
  const isWarning =
    (warnIfOverTarget && target !== undefined && target > 0 && actual > target) ||
    (warnIfNegative && actual < 0)

  return (
    <div className="flex-1 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div
        className={cn(
          'text-lg font-bold',
          isWarning ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100',
        )}
      >
        {formatILS(actual)}
      </div>
      {target !== undefined && (
        <div className="text-xs text-gray-400 dark:text-gray-500">מתוכנן: {formatILS(target)}</div>
      )}
    </div>
  )
}

export function BudgetActualSummary({ totals }: { totals: MonthTotals }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Tile label="הכנסות בפועל" actual={totals.incomeActual} target={totals.incomeTarget} />
      <Tile
        label="הוצאות בפועל"
        actual={totals.expenseActual}
        target={totals.expenseTarget}
        warnIfOverTarget
      />
      <Tile label="נותר בסוף החודש" actual={totals.leftoverActual} warnIfNegative />
    </div>
  )
}
