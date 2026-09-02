import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getBudgetLines } from '@/lib/supabase/queries/budgetLines'
import { createMonth } from '@/lib/supabase/queries/months'
import { queryKeys } from '@/lib/queryClient'

/**
 * Ensures the month row exists (idempotent) before fetching its budget
 * lines — safe to call on every page load.
 */
export function useBudgetLines(monthKey: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    createMonth(monthKey)
      .then(() => queryClient.invalidateQueries({ queryKey: queryKeys.budgetLines(monthKey) }))
      .catch((err) => console.error('Failed to create month', err))
  }, [monthKey, queryClient])

  return useQuery({
    queryKey: queryKeys.budgetLines(monthKey),
    queryFn: () => getBudgetLines(monthKey),
  })
}
