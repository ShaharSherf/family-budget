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

/** Per-person spending trend needs the raw lines joined to payments + month, not a rollup view. */
export async function getPersonSpendingRange(fromMonth: string, toMonth: string) {
  const { data, error } = await supabase
    .from('budget_line_payments')
    .select('paid_amount, family_member_id, budget_lines!inner(month_key, category_id, categories!inner(kind))')
    .gte('budget_lines.month_key', toMonthDate(fromMonth))
    .lte('budget_lines.month_key', toMonthDate(toMonth))
  if (error) throw error
  return data
}
