import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCategory, getCategories, updateCategory } from '@/lib/supabase/queries/categories'
import { createDetail, getDetails, updateDetail } from '@/lib/supabase/queries/details'
import { queryKeys } from '@/lib/queryClient'
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types'

export function useCategories() {
  return useQuery({ queryKey: queryKeys.categories, queryFn: getCategories })
}

export function useDetails() {
  return useQuery({ queryKey: ['details'], queryFn: getDetails })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TablesInsert<'categories'>) => createCategory(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; patch: TablesUpdate<'categories'> }) => updateCategory(vars.id, vars.patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}

export function useCreateDetail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TablesInsert<'details'>) => createDetail(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['details'] }),
  })
}

export function useUpdateDetail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; patch: TablesUpdate<'details'> }) => updateDetail(vars.id, vars.patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['details'] }),
  })
}
