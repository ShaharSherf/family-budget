import type { Category } from '@/lib/supabase/queries/categories'
import type { Detail } from '@/lib/supabase/queries/details'
import type { Tables } from '@/lib/supabase/database.types'

export type BudgetLinePayment = Tables<'budget_line_payments'>

/** A budget_lines row joined with its category/detail names and per-person payments. */
export interface BudgetLineWithRelations extends Tables<'budget_lines'> {
  category: Pick<Category, 'id' | 'name_he' | 'kind'>
  detail: Pick<Detail, 'id' | 'name_he'>
  payments: BudgetLinePayment[]
}
