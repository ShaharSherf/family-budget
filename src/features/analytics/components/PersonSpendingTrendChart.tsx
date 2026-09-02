import { useMemo } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { categorical, chrome, formatAxisILS } from '@/components/charts/chartTheme'
import { formatMonthLabel } from '@/lib/format'
import { fromMonthDate } from '@/lib/month'
import type { FamilyMember } from '@/lib/supabase/queries/familyMembers'

interface PersonSpendingRow {
  paid_amount: number
  family_member_id: string
  budget_lines: { month_key: string; categories: { kind: 'income' | 'expense' } } | null
}

export function PersonSpendingTrendChart({
  data,
  familyMembers,
}: {
  data: PersonSpendingRow[]
  familyMembers: FamilyMember[]
}) {
  const nameById = useMemo(() => new Map(familyMembers.map((m) => [m.id, m.display_name])), [familyMembers])

  const chartData = useMemo(() => {
    const byMonth = new Map<string, Record<string, number>>()
    for (const row of data) {
      if (!row.budget_lines || row.budget_lines.categories.kind !== 'expense') continue
      const monthLabel = formatMonthLabel(fromMonthDate(row.budget_lines.month_key))
      const bucket = byMonth.get(monthLabel) ?? {}
      const name = nameById.get(row.family_member_id) ?? row.family_member_id
      bucket[name] = (bucket[name] ?? 0) + row.paid_amount
      byMonth.set(monthLabel, bucket)
    }
    return [...byMonth.entries()].map(([month, values]) => ({ month, ...values }))
  }, [data, nameById])

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
          {familyMembers.map((member, i) => (
            <Line
              key={member.id}
              type="monotone"
              dataKey={member.display_name}
              name={member.display_name}
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
