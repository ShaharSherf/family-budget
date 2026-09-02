import { useMemo } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { categorical, chrome, formatAxisILS } from '@/components/charts/chartTheme'
import { formatMonthLabel } from '@/lib/format'
import { fromMonthDate } from '@/lib/month'
import type { SavingsGoal, SavingsGoalBalance } from '@/lib/supabase/queries/savingsGoals'

export function GoalProgressChart({ goals, balances }: { goals: SavingsGoal[]; balances: SavingsGoalBalance[] }) {
  const goalNameById = useMemo(() => new Map(goals.map((g) => [g.id, g.name])), [goals])

  const chartData = useMemo(() => {
    const byMonth = new Map<string, Record<string, number>>()
    for (const balance of balances) {
      const monthLabel = formatMonthLabel(fromMonthDate(balance.month_key))
      const bucket = byMonth.get(monthLabel) ?? {}
      const goalName = goalNameById.get(balance.goal_id) ?? balance.goal_id
      bucket[goalName] = balance.cumulative_balance
      byMonth.set(monthLabel, bucket)
    }
    return [...byMonth.entries()].map(([month, values]) => ({ month, ...values }))
  }, [balances, goalNameById])

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
