import { supabase } from '@/lib/supabase/client'
import { toMonthDate } from '@/lib/month'
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/database.types'

export type SavingsGoal = Tables<'savings_goals'>
export type SavingsContribution = Tables<'savings_contributions'>

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  const { data, error } = await supabase.from('savings_goals').select('*').order('name', { ascending: true })
  if (error) throw error
  return data
}

export async function createSavingsGoal(input: TablesInsert<'savings_goals'>): Promise<SavingsGoal> {
  const { data, error } = await supabase.from('savings_goals').insert(input).select().single()
  if (error) throw error
  return data
}

export async function updateSavingsGoal(id: string, patch: TablesUpdate<'savings_goals'>): Promise<SavingsGoal> {
  const { data, error } = await supabase.from('savings_goals').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function getContributionsForGoal(goalId: string): Promise<SavingsContribution[]> {
  const { data, error } = await supabase
    .from('savings_contributions')
    .select('*')
    .eq('goal_id', goalId)
    .order('month_key', { ascending: true })
  if (error) throw error
  return data
}

export async function getAllContributions(): Promise<SavingsContribution[]> {
  const { data, error } = await supabase
    .from('savings_contributions')
    .select('*')
    .order('month_key', { ascending: true })
  if (error) throw error
  return data
}

export async function getContributionsForMonth(monthKey: string): Promise<SavingsContribution[]> {
  const { data, error } = await supabase
    .from('savings_contributions')
    .select('*')
    .eq('month_key', toMonthDate(monthKey))
  if (error) throw error
  return data
}

/** Only touches contributed_amount — leaves that month's actual_balance_amount (if any) untouched. */
export async function upsertContribution(
  goalId: string,
  monthKey: string,
  contributedAmount: number,
  notes?: string,
): Promise<void> {
  const { error } = await supabase
    .from('savings_contributions')
    .upsert(
      { goal_id: goalId, month_key: toMonthDate(monthKey), contributed_amount: contributedAmount, notes },
      { onConflict: 'goal_id,month_key' },
    )
  if (error) throw error
}

/** Only touches actual_balance_amount — leaves that month's contributed_amount (if any) untouched. */
export async function upsertActualBalance(
  goalId: string,
  monthKey: string,
  actualBalanceAmount: number | null,
): Promise<void> {
  const { error } = await supabase
    .from('savings_contributions')
    .upsert(
      { goal_id: goalId, month_key: toMonthDate(monthKey), actual_balance_amount: actualBalanceAmount },
      { onConflict: 'goal_id,month_key' },
    )
  if (error) throw error
}
