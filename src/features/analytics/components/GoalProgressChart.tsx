import { useMemo } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { categorical, chrome, formatAxisILS } from '@/components/charts/chartTheme'
import { formatMonthLabel } from '@/lib/format'
import { fromMonthDate } from '@/lib/month'
import { computeGoalMonthBalances } from '@/features/savings-goals/utils'
import type { SavingsContribution, SavingsGoal } from '@/lib/supabase/queries/savingsGoals'

export function GoalProgressChart({
  goals,
  contributions,
}: {
  goals: SavingsGoal[]
  contributions: SavingsContribution[]
}) {
  const chartData = useMemo(() => {
    // Keyed by the sortable "YYYY-MM" monthKey, not the Hebrew label — labels
    // don't sort chronologically, so formatting happens only at the end.
    const byMonth = new Map<string, Record<string, number>>()
    for (const goal of goals) {
      const goalContributions = contributions.filter((c) => c.goal_id === goal.id)
      const monthBalances = computeGoalMonthBalances(goal.opening_balance_amount, goalContributions)
      for (const balance of monthBalances) {
        const bucket = byMonth.get(balance.monthKey) ?? {}
        bucket[goal.name] = balance.cumulativeBalance
        byMonth.set(balance.monthKey, bucket)
      }
    }
    return [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, values]) => ({ month: formatMonthLabel(fromMonthDate(monthKey)), ...values }))
  }, [goals, contributions])

  return (
    <div dir="ltr" className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid stroke={chrome.gridline} vertical={false} />
          <XAxis dataKey="month" stroke={chrome.muted} fontSize={11} />
          <YAxis stroke={chrome.muted} fontSize={11} tickFormatter={formatAxisILS} width={70} />
          <Tooltip
            contentStyle={{ background: chrome.surface, border: `1px solid ${chrome.gridline}`, fontSize: 12 }}
            formatter={(value) => formatAxisILS(Number(value))}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {goals.map((goal, i) => (
            <Line
              key={goal.id}
              type="monotone"
              dataKey={goal.name}
              name={goal.name}
              stroke={categorical[i % categorical.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
