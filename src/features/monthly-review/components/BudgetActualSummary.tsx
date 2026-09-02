import { formatILS } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { MonthTotals } from '../utils'

type TileMode =
  /** Neutral — never colored (e.g. a plain figure with no good/bad direction). */
  | 'neutral'
  /** Exceeding target is bad — expenses. */
  | 'expense'
  /** At/above target is good (green), below is bad (red) — income. */
  | 'income'
  /** Negative is bad (red), non-negative is neutral. */
  | 'net'

function Tile({
  label,
  actual,
  target,
  mode = 'neutral',
}: {
  label: string
  actual: number
  target?: number
  mode?: TileMode
}) {
  const isOverTarget = target !== undefined && target > 0 && actual > target
  const isUnderTarget = target !== undefined && target > 0 && actual < target

  const isGood = mode === 'income' && isOverTarget
  const isWarning =
    (mode === 'expense' && isOverTarget) || (mode === 'income' && isUnderTarget) || (mode === 'net' && actual < 0)

  return (
    <div className="flex-1 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div
        className={cn(
          'text-lg font-bold',
          isWarning
            ? 'text-red-600 dark:text-red-400'
            : isGood
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-900 dark:text-gray-100',
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
      <Tile label="הכנסות בפועל" actual={totals.incomeActual} target={totals.incomeTarget} mode="income" />
      <Tile label="הוצאות בפועל" actual={totals.expenseActual} target={totals.expenseTarget} mode="expense" />
      <Tile label="נותר בסוף החודש" actual={totals.leftoverActual} mode="net" />
    </div>
  )
}
