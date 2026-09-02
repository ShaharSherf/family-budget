import type { BudgetLineWithRelations } from '@/types/domain'

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
