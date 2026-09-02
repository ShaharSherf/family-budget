import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { categorical, chrome, formatAxisILS } from './chartTheme'
import type { ViewRow } from '@/lib/supabase/database.types'

export function BudgetVsActualBarChart({ data }: { data: ViewRow<'category_actuals'>[] }) {
  const chartData = data.map((row) => ({
    name: row.name_he,
    actual: row.actual_total ?? 0,
    target: row.target_total ?? 0,
  }))

  return (
    <div dir="ltr" className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid stroke={chrome.gridline} vertical={false} />
          <XAxis dataKey="name" stroke={chrome.muted} fontSize={11} />
          <YAxis stroke={chrome.muted} fontSize={11} tickFormatter={formatAxisILS} width={70} />
          <Tooltip
            contentStyle={{ background: chrome.surface, border: `1px solid ${chrome.gridline}`, fontSize: 12 }}
            formatter={(value) => formatAxisILS(Number(value))}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="target" name="תקציב" fill={categorical[1]} radius={[4, 4, 0, 0]} />
          <Bar dataKey="actual" name="בפועל" fill={categorical[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
