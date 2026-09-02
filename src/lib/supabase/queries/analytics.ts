import { supabase } from '@/lib/supabase/client'
import { toMonthDate } from '@/lib/month'
import type { ViewRow } from '@/lib/supabase/database.types'

export async function getMonthKpisRange(fromMonth: string, toMonth: string): Promise<ViewRow<'month_kpis'>[]> {
  const { data, error } = await supabase
    .from('month_kpis')
    .select('*')
    .gte('month_key', toMonthDate(fromMonth))
    .lte('month_key', toMonthDate(toMonth))
    .order('month_key', { ascending: true })
  if (error) throw error
  return data
}

export async function getCategoryActualsRange(
  fromMonth: string,
  toMonth: string,
): Promise<ViewRow<'category_actuals'>[]> {
  const { data, error } = await supabase
    .from('category_actuals')
    .select('*')
    .gte('month_key', toMonthDate(fromMonth))
    .lte('month_key', toMonthDate(toMonth))
    .order('month_key', { ascending: true })
  if (error) throw error
  return data
}
