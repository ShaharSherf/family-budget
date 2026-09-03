import { supabase } from '@/lib/supabase/client'
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/database.types'

export type CalendarEvent = Tables<'calendar_events'>

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .order('month', { ascending: true })
    .order('day', { ascending: true })
  if (error) throw error
  return data
}

export async function createCalendarEvent(input: TablesInsert<'calendar_events'>): Promise<CalendarEvent> {
  const { data, error } = await supabase.from('calendar_events').insert(input).select().single()
  if (error) throw error
  return data
}

export async function updateCalendarEvent(
  id: string,
  patch: TablesUpdate<'calendar_events'>,
): Promise<CalendarEvent> {
  const { data, error } = await supabase.from('calendar_events').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const { error } = await supabase.from('calendar_events').delete().eq('id', id)
  if (error) throw error
}
