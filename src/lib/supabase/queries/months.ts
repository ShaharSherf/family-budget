import { supabase } from '@/lib/supabase/client'
import { toMonthDate } from '@/lib/month'
import type { Tables } from '@/lib/supabase/database.types'

export type Month = Tables<'months'>

/** Idempotent — safe to call on every page load of a month. */
export async function createMonth(monthKey: string): Promise<void> {
  const { error } = await supabase.rpc('create_month', { p_month_key: toMonthDate(monthKey) })
  if (error) throw error
}

export async function getAllMonths(): Promise<Month[]> {
  const { data, error } = await supabase.from('months').select('*').order('month_key', { ascending: true })
  if (error) throw error
  return data
}

export async function getMonth(monthKey: string): Promise<Month | null> {
  const { data, error } = await supabase
    .from('months')
    .select('*')
    .eq('month_key', toMonthDate(monthKey))
    .maybeSingle()
  if (error) throw error
  return data
}

export async function setMonthClosed(monthKey: string, isClosed: boolean): Promise<Month> {
  const { data, error } = await supabase
    .from('months')
    .update({ is_closed: isClosed })
    .eq('month_key', toMonthDate(monthKey))
    .select()
    .single()
  if (error) throw error
  return data
}
