import { supabase } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/database.types'

export type AdamDebtShare = Tables<'adam_debt_shares'>

export async function getAdamDebtShares(): Promise<AdamDebtShare[]> {
  const { data, error } = await supabase.from('adam_debt_shares').select('*')
  if (error) throw error
  return data
}

export async function addAdamDebtShare(categoryId: string, percentage: number): Promise<AdamDebtShare> {
  const { data, error } = await supabase
    .from('adam_debt_shares')
    .insert({ category_id: categoryId, percentage })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAdamDebtShare(id: string): Promise<void> {
  const { error } = await supabase.from('adam_debt_shares').delete().eq('id', id)
  if (error) throw error
}
