import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addAdamDebtItem, deleteAdamDebtItem, getAdamDebtItems } from '@/lib/supabase/queries/adamDebt'
import { queryKeys } from '@/lib/queryClient'

export function useAdamDebtItems(monthKey: string) {
  return useQuery({ queryKey: queryKeys.adamDebtItems(monthKey), queryFn: () => getAdamDebtItems(monthKey) })
}

export function useAddAdamDebtItem(monthKey: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { category: string; amount: number; notes?: string | null }) =>
      addAdamDebtItem({ monthKey, ...input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adamDebtItems(monthKey) }),
  })
}

export function useDeleteAdamDebtItem(monthKey: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAdamDebtItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adamDebtItems(monthKey) }),
  })
}
