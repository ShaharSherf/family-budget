import { supabase } from '@/lib/supabase/client'
import { toMonthDate } from '@/lib/month'
import type { Tables } from '@/lib/supabase/database.types'

export type AdamDebtItem = Tables<'adam_debt_items'>

export async function getAdamDebtItems(monthKey: string): Promise<AdamDebtItem[]> {
  const { data, error } = await supabase
    .from('adam_debt_items')
    .select('*')
    .eq('month_key', toMonthDate(monthKey))
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function addAdamDebtItem(input: {
  monthKey: string
  category: string
  amount: number
  notes?: string | null
}): Promise<AdamDebtItem> {
  const { data, error } = await supabase
    .from('adam_debt_items')
    .insert({
      month_key: toMonthDate(input.monthKey),
      category: input.category,
      amount: input.amount,
      notes: input.notes ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAdamDebtItem(id: string): Promise<void> {
  const { error } = await supabase.from('adam_debt_items').delete().eq('id', id)
  if (error) throw error
}
