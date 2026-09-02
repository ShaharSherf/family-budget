import { formatILS } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { MonthTotals, SavingsTotals } from '../utils'

type TileMode =
  /** Neutral — never colored (e.g. a plain figure with no good/bad direction). */
  | 'neutral'
  /** Above target is good (green), below is bad (red), equal is neutral — spending less than planned. */
  | 'belowTargetGood'
  /** At/above target is good (green), below is bad (red), equal is neutral — income, savings. */
  | 'aboveTargetGood'
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

  const isGood = (mode === 'aboveTargetGood' && isOverTarget) || (mode === 'belowTargetGood' && isUnderTarget)
  const isWarning =
    (mode === 'belowTargetGood' && isOverTarget) ||
    (mode === 'aboveTargetGood' && isUnderTarget) ||
    (mode === 'net' && actual < 0)

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

export function BudgetActualSummary({ totals, savings }: { totals: MonthTotals; savings: SavingsTotals }) {
  // "Left over" accounts for money already committed to savings this month —
  // it's what's left after both expenses AND savings contributions.
  const netLeftover = totals.leftoverActual - savings.actual

  return (
    <div className="flex flex-wrap gap-3">
      <Tile
        label="הכנסות בפועל"
        actual={totals.incomeActual}
        target={totals.incomeTarget}
        mode="aboveTargetGood"
      />
      <Tile
        label="הוצאות בפועל"
        actual={totals.expenseActual}
        target={totals.expenseTarget}
        mode="belowTargetGood"
      />
      <Tile label="חיסכון החודש" actual={savings.actual} target={savings.target} mode="aboveTargetGood" />
      <Tile label="נותר בסוף החודש" actual={netLeftover} mode="net" />
    </div>
  )
}
