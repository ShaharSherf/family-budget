import { formatILS } from '@/lib/format'
import { chrome } from '@/components/charts/chartTheme'
import { ContributionForm } from './ContributionForm'
import type { SavingsGoal, SavingsGoalBalance } from '@/lib/supabase/queries/savingsGoals'

function ProgressBar({ value, max }: { value: number; max: number | null }) {
  const pct = max && max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
      <div
        className="h-2 rounded-full"
        style={{ width: `${pct}%`, background: 'var(--series-1)', borderColor: chrome.gridline }}
      />
    </div>
  )
}

export function GoalCard({ goal, balances }: { goal: SavingsGoal; balances: SavingsGoalBalance[] }) {
  const latest = balances[balances.length - 1]
  const cumulativeBalance = latest?.cumulative_balance ?? 0
  const thisMonthContribution = balances[balances.length - 1]?.contributed_amount ?? 0

  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{goal.name}</h3>

      <div className="mt-3 flex flex-col gap-1">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>הפקדה חודשית</span>
          <span>
            {formatILS(thisMonthContribution)} / {formatILS(goal.monthly_target_amount)}
          </span>
        </div>
        <ProgressBar value={thisMonthContribution} max={goal.monthly_target_amount} />
      </div>

      <div className="mt-3 flex flex-col gap-1">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>יעד כללי</span>
          <span>
            {formatILS(cumulativeBalance)} / {formatILS(goal.lifetime_target_amount)}
          </span>
        </div>
        <ProgressBar value={cumulativeBalance} max={goal.lifetime_target_amount} />
      </div>

      {goal.notes && <p className="mt-2 text-xs text-gray-400">{goal.notes}</p>}

      <div className="mt-3">
        <ContributionForm goalId={goal.id} />
      </div>
    </div>
  )
}
