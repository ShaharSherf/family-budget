import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { formatILS, formatMonthLabel } from '@/lib/format'
import { fromMonthDate } from '@/lib/month'
import { chrome } from '@/components/charts/chartTheme'
import { useDebouncedCallback } from '@/lib/useDebouncedCallback'
import { Input, NumberInput } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useUpdateSavingsGoal } from '../hooks/useSavingsGoals'
import { computeGoalMonthBalances } from '../utils'
import type { SavingsGoal, SavingsContribution } from '@/lib/supabase/queries/savingsGoals'

function ProgressBar({ value, max }: { value: number; max: number | null }) {
  const rawPct = max && max > 0 ? (value / max) * 100 : 0
  const pct = Math.min(100, rawPct)
  return (
    <div
      className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800"
      title={`${Math.round(rawPct)}%`}
    >
      <div
        className="h-2 rounded-full"
        style={{ width: `${pct}%`, background: 'var(--series-1)', borderColor: chrome.gridline }}
      />
    </div>
  )
}

export function GoalCard({ goal, contributions }: { goal: SavingsGoal; contributions: SavingsContribution[] }) {
  const updateGoal = useUpdateSavingsGoal()
  const [name, setName] = useState(goal.name)
  const [monthlyTarget, setMonthlyTarget] = useState(goal.monthly_target_amount?.toString() ?? '')
  const [lifetimeTarget, setLifetimeTarget] = useState(goal.lifetime_target_amount?.toString() ?? '')

  const commitName = useDebouncedCallback((value: string) => {
    if (!value.trim() || value === goal.name) return
    updateGoal.mutate({ id: goal.id, patch: { name: value.trim() } })
  }, 500)

  const commitMonthlyTarget = useDebouncedCallback((value: string) => {
    const n = value === '' ? null : Number(value)
    if (n !== null && !Number.isFinite(n)) return
    updateGoal.mutate({ id: goal.id, patch: { monthly_target_amount: n } })
  }, 500)

  const commitLifetimeTarget = useDebouncedCallback((value: string) => {
    const n = value === '' ? null : Number(value)
    if (n !== null && !Number.isFinite(n)) return
    updateGoal.mutate({ id: goal.id, patch: { lifetime_target_amount: n } })
  }, 500)

  const monthBalances = useMemo(
    () => computeGoalMonthBalances(goal.opening_balance_amount, contributions),
    [goal.opening_balance_amount, contributions],
  )

  // The latest month with any data (deposit or reported balance) — falls
  // back to the opening balance for a goal with no monthly data at all yet.
  const latest = monthBalances[monthBalances.length - 1]
  const currentBalance = latest?.cumulativeBalance ?? goal.opening_balance_amount
  const remainingToGoal =
    goal.lifetime_target_amount !== null ? goal.lifetime_target_amount - currentBalance : null

  const history = [...monthBalances].reverse()

  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            commitName(e.target.value)
          }}
          className="font-semibold"
        />
        {!goal.is_active && <Badge tone="warning">לא פעיל</Badge>}
        <Button
          variant="ghost"
          onClick={() => updateGoal.mutate({ id: goal.id, patch: { is_active: !goal.is_active } })}
        >
          {goal.is_active ? 'השבתה' : 'הפעלה'}
        </Button>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>יעד חודשי</span>
        <NumberInput
          className="w-24"
          placeholder="יעד חודשי"
          value={monthlyTarget}
          onChange={(e) => {
            setMonthlyTarget(e.target.value)
            commitMonthlyTarget(e.target.value)
          }}
        />
      </div>

      <div className="mt-3 flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>יתרה נוכחית</span>
          <span className="flex items-center gap-1">
            {formatILS(currentBalance)} /
            <NumberInput
              className="w-24"
              placeholder="יעד כללי"
              value={lifetimeTarget}
              onChange={(e) => {
                setLifetimeTarget(e.target.value)
                commitLifetimeTarget(e.target.value)
              }}
            />
          </span>
        </div>
        <ProgressBar value={currentBalance} max={goal.lifetime_target_amount} />
        {remainingToGoal !== null && (
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {remainingToGoal <= 0 ? 'היעד הושג! 🎉' : `נותר להשלמת היעד: ${formatILS(remainingToGoal)}`}
          </div>
        )}
      </div>

      {goal.notes && <p className="mt-2 text-xs text-gray-400">{goal.notes}</p>}

      {history.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-gray-500 dark:text-gray-400">היסטוריה חודשית</summary>
          <table className="mt-2 w-full text-xs">
            <thead>
              <tr className="text-gray-400 dark:text-gray-500">
                <th className="py-1 text-start">חודש</th>
                <th className="py-1 text-start">הפקדה</th>
                <th className="py-1 text-start">תשואת שוק</th>
                <th className="py-1 text-start">יתרה</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {history.map((b) => (
                <tr key={b.monthKey}>
                  <td className="py-1 text-gray-500 dark:text-gray-400">{formatMonthLabel(fromMonthDate(b.monthKey))}</td>
                  <td className="py-1 text-gray-700 dark:text-gray-300">{formatILS(b.contributedAmount)}</td>
                  <td
                    className={cn(
                      'py-1',
                      b.marketReturnAmount === null
                        ? 'text-gray-400 dark:text-gray-500'
                        : b.marketReturnAmount > 0
                          ? 'text-green-600 dark:text-green-400'
                          : b.marketReturnAmount < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-500 dark:text-gray-400',
                    )}
                  >
                    {b.marketReturnAmount === null ? 'לא ידוע' : formatILS(b.marketReturnAmount)}
                  </td>
                  <td className="py-1 text-gray-400 dark:text-gray-500">{formatILS(b.cumulativeBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </div>
  )
}
