import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addAdamDebtShare, deleteAdamDebtShare, getAdamDebtShares } from '@/lib/supabase/queries/adamDebt'
import { queryKeys } from '@/lib/queryClient'

export function useAdamDebtShares() {
  return useQuery({ queryKey: queryKeys.adamDebtShares, queryFn: getAdamDebtShares })
}

export function useAddAdamDebtShare() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { categoryId: string; percentage: number }) =>
      addAdamDebtShare(vars.categoryId, vars.percentage),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adamDebtShares }),
  })
}

export function useDeleteAdamDebtShare() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAdamDebtShare(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.adamDebtShares }),
  })
}
