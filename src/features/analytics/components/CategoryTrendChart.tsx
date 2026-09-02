import { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { categorical, chrome, formatAxisILS } from '@/components/charts/chartTheme'
import { formatMonthLabel } from '@/lib/format'
import { fromMonthDate } from '@/lib/month'
import type { ViewRow } from '@/lib/supabase/database.types'

const MAX_SERIES = 7 // fold anything past the 8-slot categorical palette into "Other" — never a generated 9th hue

export function CategoryTrendChart({ data }: { data: ViewRow<'category_actuals'>[] }) {
  const { chartData, seriesNames } = useMemo(() => {
    const expenseRows = data.filter((row) => row.kind === 'expense')

    const totalByCategory = new Map<string, number>()
    for (const row of expenseRows) {
      totalByCategory.set(row.name_he, (totalByCategory.get(row.name_he) ?? 0) + (row.actual_total ?? 0))
    }
    const topCategories = [...totalByCategory.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_SERIES)
      .map(([name]) => name)
    const topSet = new Set(topCategories)

    const byMonth = new Map<string, Record<string, number>>()
    for (const row of expenseRows) {
      const monthLabel = formatMonthLabel(fromMonthDate(row.month_key))
      const bucket = byMonth.get(monthLabel) ?? {}
      const seriesKey = topSet.has(row.name_he) ? row.name_he : 'אחר'
      bucket[seriesKey] = (bucket[seriesKey] ?? 0) + (row.actual_total ?? 0)
      byMonth.set(monthLabel, bucket)
    }

    const hasOther = expenseRows.some((row) => !topSet.has(row.name_he))
    const names = hasOther ? [...topCategories, 'אחר'] : topCategories

    return {
      chartData: [...byMonth.entries()].map(([month, values]) => ({ month, ...values })),
      seriesNames: names,
    }
  }, [data])

  return (
    <div dir="ltr" className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid stroke={chrome.gridline} vertical={false} />
          <XAxis dataKey="month" stroke={chrome.muted} fontSize={11} />
          <YAxis stroke={chrome.muted} fontSize={11} tickFormatter={formatAxisILS} width={70} />
          <Tooltip
            contentStyle={{ background: chrome.surface, border: `1px solid ${chrome.gridline}`, fontSize: 12 }}
            formatter={(value) => formatAxisILS(Number(value))}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {seriesNames.map((name, i) => (
            <Area
              key={name}
              type="monotone"
              dataKey={name}
              name={name}
              stackId="1"
              stroke={name === 'אחר' ? chrome.muted : categorical[i]}
              fill={name === 'אחר' ? chrome.muted : categorical[i]}
              fillOpacity={0.5}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
