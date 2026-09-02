import type { BudgetLineWithRelations } from '@/types/domain'
import type { SavingsGoal } from '@/lib/supabase/queries/savingsGoals'
import type { Tables } from '@/lib/supabase/database.types'

export interface MonthTotals {
  incomeActual: number
  incomeTarget: number
  expenseActual: number
  expenseTarget: number
  leftoverActual: number
}

export function computeTotals(rows: BudgetLineWithRelations[]): MonthTotals {
  let incomeActual = 0
  let incomeTarget = 0
  let expenseActual = 0
  let expenseTarget = 0

  for (const row of rows) {
    const actual = row.family_actual_amount ?? 0
    const target = row.target_amount ?? 0
    if (row.category.kind === 'income') {
      incomeActual += actual
      incomeTarget += target
    } else {
      expenseActual += actual
      expenseTarget += target
    }
  }

  return {
    incomeActual,
    incomeTarget,
    expenseActual,
    expenseTarget,
    leftoverActual: incomeActual - expenseActual,
  }
}

export interface SavingsTotals {
  actual: number
  target: number
}

/**
 * Only counts goals that have a monthly target (e.g. not the pension goal,
 * which tracks a one-off legacy opening balance rather than a monthly plan)
 * — both the target and actual sums are scoped to that same set of goals,
 * so an untargeted goal's contribution never inflates "actual" either.
 */
export function computeSavingsTotals(
  goals: SavingsGoal[],
  contributions: Tables<'savings_contributions'>[],
): SavingsTotals {
  const targetableGoalIds = new Set(
    goals.filter((g) => g.monthly_target_amount !== null).map((g) => g.id),
  )
  const target = goals.reduce((sum, g) => sum + (g.monthly_target_amount ?? 0), 0)
  const actual = contributions
    .filter((c) => targetableGoalIds.has(c.goal_id))
    .reduce((sum, c) => sum + c.contributed_amount, 0)
  return { actual, target }
}

export interface CategoryGroup {
  categoryId: string
  categoryName: string
  kind: 'income' | 'expense'
  rows: BudgetLineWithRelations[]
  actualTotal: number
  targetTotal: number
}

export function groupByCategory(rows: BudgetLineWithRelations[]): CategoryGroup[] {
  const groups = new Map<string, CategoryGroup>()

  for (const row of rows) {
    let group = groups.get(row.category_id)
    if (!group) {
      group = {
        categoryId: row.category_id,
        categoryName: row.category.name_he,
        kind: row.category.kind,
        rows: [],
        actualTotal: 0,
        targetTotal: 0,
      }
      groups.set(row.category_id, group)
    }
    group.rows.push(row)
    group.actualTotal += row.family_actual_amount ?? 0
    group.targetTotal += row.target_amount ?? 0
  }

  return Array.from(groups.values()).sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'income' ? -1 : 1
    return a.categoryName.localeCompare(b.categoryName, 'he')
  })
}
