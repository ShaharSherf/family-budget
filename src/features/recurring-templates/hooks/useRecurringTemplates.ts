import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createRecurringTemplate,
  getRecurringTemplates,
  setRecurringTemplateActive,
  setRecurringTemplateDefaultPayment,
  updateRecurringTemplate,
} from '@/lib/supabase/queries/recurringTemplates'
import { queryKeys } from '@/lib/queryClient'
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types'

export function useRecurringTemplates() {
  return useQuery({ queryKey: queryKeys.templates, queryFn: getRecurringTemplates })
}

export function useCreateRecurringTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TablesInsert<'recurring_templates'>) => createRecurringTemplate(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.templates }),
  })
}

/** Applies to future months only — see updateRecurringTemplate's doc comment. */
export function useUpdateRecurringTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; patch: TablesUpdate<'recurring_templates'> }) =>
      updateRecurringTemplate(vars.id, vars.patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.templates }),
  })
}

/** Pausing (isActive=false) stops future generation but keeps history intact. */
export function useSetRecurringTemplateActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; isActive: boolean }) =>
      setRecurringTemplateActive(vars.id, vars.isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.templates }),
  })
}

export function useSetRecurringTemplateDefaultPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { templateId: string; familyMemberId: string; defaultPaidAmount: number }) =>
      setRecurringTemplateDefaultPayment(vars.templateId, vars.familyMemberId, vars.defaultPaidAmount),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.templates }),
  })
}
