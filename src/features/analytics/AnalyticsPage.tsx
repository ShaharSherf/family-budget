import { useCategoryActualsRange, useMonthKpisRange, useMonthRange } from './hooks/useAnalyticsData'
import { useAllContributions, useSavingsGoals } from '@/features/savings-goals/hooks/useSavingsGoals'
import { ChartCard } from '@/components/charts/ChartCard'
import { IncomeExpenseNetChart } from './components/IncomeExpenseNetChart'
import { CategoryTrendChart } from './components/CategoryTrendChart'
import { GoalProgressChart } from './components/GoalProgressChart'
import { BudgetAdherenceHeatmap } from './components/BudgetAdherenceHeatmap'
import { YtdStatTiles } from './components/YtdStatTiles'

export function AnalyticsPage() {
  const { data: range } = useMonthRange()
  const { data: kpis = [], isLoading: kpisLoading } = useMonthKpisRange(range?.from, range?.to)
  const { data: categoryActuals = [], isLoading: categoryLoading } = useCategoryActualsRange(range?.from, range?.to)
  const { data: goals = [] } = useSavingsGoals()
  const { data: goalContributions = [] } = useAllContributions()

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">ניתוח ומגמות</h2>

      <YtdStatTiles data={kpis} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="הכנסות, הוצאות ונטו לאורך זמן" isLoading={kpisLoading} isEmpty={kpis.length === 0}>
          <IncomeExpenseNetChart data={kpis} />
        </ChartCard>

        <ChartCard title="מגמת הוצאות לפי קטגוריה" isLoading={categoryLoading} isEmpty={categoryActuals.length === 0}>
          <CategoryTrendChart data={categoryActuals} />
        </ChartCard>

        <ChartCard title="התקדמות יעדי חיסכון" isEmpty={goals.length === 0}>
          <GoalProgressChart goals={goals} contributions={goalContributions} />
        </ChartCard>
      </div>

      <ChartCard title="עמידה בתקציב לפי קטגוריה וחודש" isLoading={categoryLoading} isEmpty={categoryActuals.length === 0}>
        <BudgetAdherenceHeatmap data={categoryActuals} />
      </ChartCard>
    </div>
  )
}
