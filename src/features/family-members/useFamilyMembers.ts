import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFamilyMember, getFamilyMembers, updateFamilyMember } from '@/lib/supabase/queries/familyMembers'
import { queryKeys } from '@/lib/queryClient'
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types'

export function useFamilyMembers() {
  return useQuery({ queryKey: queryKeys.familyMembers, queryFn: getFamilyMembers })
}

export function useCreateFamilyMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TablesInsert<'family_members'>) => createFamilyMember(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.familyMembers }),
  })
}

export function useUpdateFamilyMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; patch: TablesUpdate<'family_members'> }) =>
      updateFamilyMember(vars.id, vars.patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.familyMembers }),
  })
}
