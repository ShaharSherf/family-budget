import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { categorical, chrome, formatAxisILS } from '@/components/charts/chartTheme'
import { formatMonthLabel } from '@/lib/format'
import type { ViewRow } from '@/lib/supabase/database.types'
import { fromMonthDate } from '@/lib/month'

export function IncomeExpenseNetChart({ data }: { data: ViewRow<'month_kpis'>[] }) {
  const chartData = data.map((row) => ({
    month: formatMonthLabel(fromMonthDate(row.month_key)),
    income: row.income_actual,
    expense: row.expense_actual,
    net: row.leftover_actual,
  }))

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
          <Line type="monotone" dataKey="income" name="הכנסות" stroke={categorical[0]} strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="expense" name="הוצאות" stroke={categorical[1]} strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="net" name="נטו" stroke={categorical[2]} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
