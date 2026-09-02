import { supabase } from '@/lib/supabase/client'
import { toMonthDate } from '@/lib/month'
import type { Tables, TablesInsert, TablesUpdate, ViewRow } from '@/lib/supabase/database.types'

export type SavingsGoal = Tables<'savings_goals'>
export type SavingsGoalBalance = ViewRow<'savings_goal_balances'>

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

export async function getSavingsGoalBalances(goalId: string): Promise<SavingsGoalBalance[]> {
  const { data, error } = await supabase
    .from('savings_goal_balances')
    .select('*')
    .eq('goal_id', goalId)
    .order('month_key', { ascending: true })
  if (error) throw error
  return data as unknown as SavingsGoalBalance[]
}

export async function getAllSavingsGoalBalances(): Promise<SavingsGoalBalance[]> {
  const { data, error } = await supabase
    .from('savings_goal_balances')
    .select('*')
    .order('month_key', { ascending: true })
  if (error) throw error
  return data as unknown as SavingsGoalBalance[]
}

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
