import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMonth, setMonthClosed } from '@/lib/supabase/queries/months'
import { queryKeys } from '@/lib/queryClient'

export function useMonth(monthKey: string) {
  return useQuery({
    queryKey: queryKeys.month(monthKey),
    queryFn: () => getMonth(monthKey),
  })
}

export function useSetMonthClosed(monthKey: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (isClosed: boolean) => setMonthClosed(monthKey, isClosed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.month(monthKey) })
    },
  })
}
