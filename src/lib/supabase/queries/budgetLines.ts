import { supabase } from '@/lib/supabase/client'
import { toMonthDate } from '@/lib/month'
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types'
import type { BudgetLineWithRelations } from '@/types/domain'

const SELECT_WITH_RELATIONS = `
  *,
  category:categories!budget_lines_category_id_fkey ( id, name_he, kind ),
  detail:details!budget_lines_detail_id_fkey ( id, name_he ),
  payments:budget_line_payments ( * )
`

export async function getBudgetLines(monthKey: string): Promise<BudgetLineWithRelations[]> {
  const { data, error } = await supabase
    .from('budget_lines')
    .select(SELECT_WITH_RELATIONS)
    .eq('month_key', toMonthDate(monthKey))
  if (error) throw error
  return data as unknown as BudgetLineWithRelations[]
}

export async function createBudgetLine(
  input: TablesInsert<'budget_lines'>,
): Promise<BudgetLineWithRelations> {
  const { data, error } = await supabase
    .from('budget_lines')
    .insert(input)
    .select(SELECT_WITH_RELATIONS)
    .single()
  if (error) throw error
  return data as unknown as BudgetLineWithRelations
}

export async function updateBudgetLine(
  id: string,
  patch: TablesUpdate<'budget_lines'>,
): Promise<BudgetLineWithRelations> {
  const { data, error } = await supabase
    .from('budget_lines')
    .update(patch)
    .eq('id', id)
    .select(SELECT_WITH_RELATIONS)
    .single()
  if (error) throw error
  return data as unknown as BudgetLineWithRelations
}

export async function deleteBudgetLine(id: string): Promise<void> {
  const { error } = await supabase.from('budget_lines').delete().eq('id', id)
  if (error) throw error
}

export async function setBudgetLinePayment(
  budgetLineId: string,
  familyMemberId: string,
  paidAmount: number,
): Promise<void> {
  const { error } = await supabase
    .from('budget_line_payments')
    .upsert(
      { budget_line_id: budgetLineId, family_member_id: familyMemberId, paid_amount: paidAmount },
      { onConflict: 'budget_line_id,family_member_id' },
    )
  if (error) throw error
}
