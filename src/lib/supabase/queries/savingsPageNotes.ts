import { supabase } from '@/lib/supabase/client'

export async function getSavingsPageNotes(): Promise<string | null> {
  const { data, error } = await supabase.from('savings_page_notes').select('notes').eq('id', true).single()
  if (error) throw error
  return data.notes
}

export async function updateSavingsPageNotes(notes: string | null): Promise<void> {
  const { error } = await supabase
    .from('savings_page_notes')
    .update({ notes, updated_at: new Date().toISOString() })
    .eq('id', true)
  if (error) throw error
}
