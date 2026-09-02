import { supabase } from '@/lib/supabase/client'
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/database.types'

export type Detail = Tables<'details'>

export async function getDetails(): Promise<Detail[]> {
  const { data, error } = await supabase.from('details').select('*').order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

export async function createDetail(input: TablesInsert<'details'>): Promise<Detail> {
  const { data, error } = await supabase.from('details').insert(input).select().single()
  if (error) throw error
  return data
}

export async function updateDetail(id: string, patch: TablesUpdate<'details'>): Promise<Detail> {
  const { data, error } = await supabase.from('details').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}
