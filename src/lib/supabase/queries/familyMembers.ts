import { supabase } from '@/lib/supabase/client'
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/database.types'

export type FamilyMember = Tables<'family_members'>

export async function getFamilyMembers(): Promise<FamilyMember[]> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .order('display_name', { ascending: true })
  if (error) throw error
  return data
}

export async function createFamilyMember(input: TablesInsert<'family_members'>): Promise<FamilyMember> {
  const { data, error } = await supabase.from('family_members').insert(input).select().single()
  if (error) throw error
  return data
}

export async function updateFamilyMember(
  id: string,
  patch: TablesUpdate<'family_members'>,
): Promise<FamilyMember> {
  const { data, error } = await supabase.from('family_members').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}
