import { useState } from 'react'
import { useDebouncedCallback } from '@/lib/useDebouncedCallback'
import { formatILS } from '@/lib/format'
import { cn } from '@/lib/cn'
import { NumberInput } from '@/components/ui/Input'
import {
  useMonthlySavingsContributions,
  useSavingsGoals,
  useUpsertActualBalance,
  useUpsertContribution,
} from '@/features/savings-goals/hooks/useSavingsGoals'
import type { SavingsGoal } from '@/lib/supabase/queries/savingsGoals'
import type { Tables } from '@/lib/supabase/database.types'

const HEADERS = ['יעד חיסכון', 'הפקדה', 'יתרה בפועל (מהבנק/ברוקר)', 'תקציב', 'פער']

function GoalRow({
  goal,
  contribution,
  monthKey,
  readOnly,
}: {
  goal: SavingsGoal
  contribution: Tables<'savings_contributions'> | undefined
  monthKey: string
  readOnly: boolean
}) {
  const upsertContribution = useUpsertContribution()
  const upsertBalance = useUpsertActualBalance()
  const [deposit, setDeposit] = useState(contribution?.contributed_amount?.toString() ?? '')
  const [balance, setBalance] = useState(contribution?.actual_balance_amount?.toString() ?? '')

  const commitDeposit = useDebouncedCallback((value: number) => {
    upsertContribution.mutate({ goalId: goal.id, monthKey, contributedAmount: value })
  }, 400)

  const commitBalance = useDebouncedCallback((value: string) => {
    const n = value === '' ? null : Number(value)
    if (n !== null && !Number.isFinite(n)) return
    upsertBalance.mutate({ goalId: goal.id, monthKey, actualBalanceAmount: n })
  }, 400)

  const depositAmount = contribution?.contributed_amount ?? 0
  const target = goal.monthly_target_amount
  const hasTarget = target !== null && target > 0
  const diff = hasTarget ? depositAmount - target : null
  const isGood = diff !== null && diff > 0
  const isWarning = diff !== null && diff < 0

  return (
    <tr>
      <td className="px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100">{goal.name}</td>
      <td className="px-2 py-1.5">
        <NumberInput
          className="w-24"
          value={deposit}
          disabled={readOnly}
          placeholder="0"
          onChange={(e) => {
            setDeposit(e.target.value)
            const n = Number(e.target.value)
            if (Number.isFinite(n)) commitDeposit(n)
          }}
        />
      </td>
      <td className="px-2 py-1.5">
        <NumberInput
          className="w-28"
          value={balance}
          disabled={readOnly}
          placeholder="יתרה בפועל"
          onChange={(e) => {
            setBalance(e.target.value)
            commitBalance(e.target.value)
          }}
        />
      </td>
      <td className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">{formatILS(target)}</td>
      <td
        className={cn(
          'px-2 py-1.5 text-sm font-medium',
          isWarning
            ? 'text-red-600 dark:text-red-400'
            : isGood
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-500 dark:text-gray-400',
        )}
      >
        {diff !== null ? formatILS(Math.abs(diff)) : '—'}
      </td>
    </tr>
  )
}

export function SavingsSection({ monthKey, readOnly }: { monthKey: string; readOnly: boolean }) {
  const { data: goals = [] } = useSavingsGoals()
  const { data: contributions = [] } = useMonthlySavingsContributions(monthKey)

  const activeGoals = goals.filter((g) => g.is_active)
  if (activeGoals.length === 0) return null

  const contributionByGoal = new Map(contributions.map((c) => [c.goal_id, c]))
  const depositTotal = activeGoals.reduce((sum, g) => sum + (contributionByGoal.get(g.id)?.contributed_amount ?? 0), 0)
  const targetTotal = activeGoals.reduce((sum, g) => sum + (g.monthly_target_amount ?? 0), 0)

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="w-full text-start">
        <thead>
          <tr>
            {HEADERS.map((h) => (
              <th
                key={h}
                className="sticky top-[57px] z-[5] bg-gray-50 px-2 py-1.5 text-start text-xs font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          <tr className="bg-gray-100 dark:bg-gray-800/60">
            <td className="px-2 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200">חיסכון</td>
            <td className="px-2 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
              {formatILS(depositTotal)}
            </td>
            <td className="px-2 py-1 text-sm text-gray-400 dark:text-gray-500">—</td>
            <td colSpan={2} className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
              מתוכנן: {formatILS(targetTotal)}
            </td>
          </tr>
          {activeGoals.map((goal) => (
            <GoalRow
              key={goal.id}
              goal={goal}
              contribution={contributionByGoal.get(goal.id)}
              monthKey={monthKey}
              readOnly={readOnly}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
