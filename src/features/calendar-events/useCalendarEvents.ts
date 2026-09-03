import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
} from '@/lib/supabase/queries/calendarEvents'
import { queryKeys } from '@/lib/queryClient'
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types'

export function useCalendarEvents() {
  return useQuery({ queryKey: queryKeys.calendarEvents, queryFn: getCalendarEvents })
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TablesInsert<'calendar_events'>) => createCalendarEvent(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.calendarEvents }),
  })
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; patch: TablesUpdate<'calendar_events'> }) =>
      updateCalendarEvent(vars.id, vars.patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.calendarEvents }),
  })
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCalendarEvent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.calendarEvents }),
  })
}
