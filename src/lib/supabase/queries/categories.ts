import { supabase } from '@/lib/supabase/client'
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/database.types'

export type Category = Tables<'categories'>

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('kind', { ascending: false })
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

export async function createCategory(input: TablesInsert<'categories'>): Promise<Category> {
  const { data, error } = await supabase.from('categories').insert(input).select().single()
  if (error) throw error
  return data
}

export async function updateCategory(id: string, patch: TablesUpdate<'categories'>): Promise<Category> {
  const { data, error } = await supabase.from('categories').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}
