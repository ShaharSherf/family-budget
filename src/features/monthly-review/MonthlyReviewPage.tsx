import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { currentMonthKey } from '@/lib/month'
import { setLastViewedMonth } from '@/lib/lastViewedMonth'
import { useBudgetLines } from './hooks/useBudgetLines'
import { useMonth } from './hooks/useMonth'
import { computeSavingsTotals, computeTotals, groupByCategory } from './utils'
import { MonthPicker } from './components/MonthPicker'
import { BudgetActualSummary } from './components/BudgetActualSummary'
import { CloseMonthToggle } from './components/CloseMonthToggle'
import { MonthAnnotations } from './components/MonthAnnotations'
import { MonthlyTable } from './components/MonthlyTable'
import { SavingsSection } from './components/SavingsSection'
import { ChartCard } from '@/components/charts/ChartCard'
import { BudgetVsActualBarChart } from '@/components/charts/BudgetVsActualBarChart'
import { CategoryBreakdownPieChart } from '@/components/charts/CategoryBreakdownPieChart'
import { useQuery } from '@tanstack/react-query'
import { getCategoryActualsRange } from '@/lib/supabase/queries/analytics'
import { queryKeys } from '@/lib/queryClient'
import { useMonthlySavingsContributions, useSavingsGoals } from '@/features/savings-goals/hooks/useSavingsGoals'

export function MonthlyReviewPage() {
  const params = useParams<{ month: string }>()
  const monthKey = params.month ?? currentMonthKey()

  useEffect(() => {
    setLastViewedMonth(monthKey)
  }, [monthKey])

  const { data: rows = [], isLoading } = useBudgetLines(monthKey)
  const { data: month } = useMonth(monthKey)
  const { data: categoryActuals = [] } = useQuery({
    queryKey: queryKeys.categoryActuals(monthKey),
    queryFn: () => getCategoryActualsRange(monthKey, monthKey),
  })
  const { data: savingsGoals = [] } = useSavingsGoals()
  const { data: monthContributions = [] } = useMonthlySavingsContributions(monthKey)

  const totals = useMemo(() => computeTotals(rows), [rows])
  const savingsTotals = useMemo(
    () => computeSavingsTotals(savingsGoals, monthContributions),
    [savingsGoals, monthContributions],
  )
  const groups = useMemo(() => groupByCategory(rows), [rows])
  const incomeGroups = useMemo(() => groups.filter((g) => g.kind === 'income'), [groups])
  const expenseGroups = useMemo(() => groups.filter((g) => g.kind === 'expense'), [groups])
  const readOnly = month?.is_closed ?? false

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonthPicker monthKey={monthKey} />
        <CloseMonthToggle monthKey={monthKey} />
      </div>

      {month && <MonthAnnotations key={monthKey} monthKey={monthKey} notes={month.notes} readOnly={readOnly} />}

      <BudgetActualSummary totals={totals} savings={savingsTotals} />

      {isLoading ? (
        <p className="text-sm text-gray-400">טוען...</p>
      ) : (
        <>
          <MonthlyTable groups={incomeGroups} monthKey={monthKey} readOnly={readOnly} />
          <SavingsSection monthKey={monthKey} readOnly={readOnly} />
          <MonthlyTable groups={expenseGroups} monthKey={monthKey} readOnly={readOnly} />
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <ChartCard
          title="תקציב מול הוצאה בפועל"
          isEmpty={categoryActuals.every((r) => r.kind !== 'expense')}
        >
          <BudgetVsActualBarChart data={categoryActuals} />
        </ChartCard>
        <ChartCard title="פילוח הוצאות לפי קטגוריה" isEmpty={categoryActuals.every((r) => (r.actual_total ?? 0) <= 0)}>
          <CategoryBreakdownPieChart data={categoryActuals} />
        </ChartCard>
      </div>
    </div>
  )
}
