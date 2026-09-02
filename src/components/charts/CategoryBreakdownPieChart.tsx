import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { categorical, chrome, formatAxisILS } from './chartTheme'
import type { ViewRow } from '@/lib/supabase/database.types'

const MAX_SLICES = 7 // categorical palette is 8 slots; the 8th is reserved for "Other" — never a generated 9th hue

export function CategoryBreakdownPieChart({ data }: { data: ViewRow<'category_actuals'>[] }) {
  const expenseRows = data
    .filter((row) => row.kind === 'expense' && (row.actual_total ?? 0) > 0)
    .sort((a, b) => (b.actual_total ?? 0) - (a.actual_total ?? 0))

  const top = expenseRows.slice(0, MAX_SLICES).map((row, i) => ({
    name: row.name_he,
    value: row.actual_total ?? 0,
    fill: categorical[i],
  }))
  const restTotal = expenseRows.slice(MAX_SLICES).reduce((sum, row) => sum + (row.actual_total ?? 0), 0)
  const chartData = restTotal > 0 ? [...top, { name: 'אחר', value: restTotal, fill: chrome.muted }] : top

  return (
    <div dir="ltr" className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} stroke={chrome.surface} strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: chrome.surface, border: `1px solid ${chrome.gridline}`, fontSize: 12 }}
            formatter={(value) => formatAxisILS(Number(value))}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
