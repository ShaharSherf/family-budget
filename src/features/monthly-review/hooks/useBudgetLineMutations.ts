import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createBudgetLine,
  deleteBudgetLine,
  setBudgetLinePayment,
  updateBudgetLine,
} from '@/lib/supabase/queries/budgetLines'
import { queryKeys } from '@/lib/queryClient'
import type { BudgetLineWithRelations } from '@/types/domain'
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types'

export function useUpdateBudgetLine(monthKey: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; patch: TablesUpdate<'budget_lines'> }) =>
      updateBudgetLine(vars.id, vars.patch),
    onMutate: async (vars) => {
      const key = queryKeys.budgetLines(monthKey)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<BudgetLineWithRelations[]>(key)
      queryClient.setQueryData<BudgetLineWithRelations[]>(key, (old) =>
        old?.map((row) => (row.id === vars.id ? { ...row, ...vars.patch } : row)),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.budgetLines(monthKey), context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetLines(monthKey) })
      queryClient.invalidateQueries({ queryKey: queryKeys.monthKpis(monthKey) })
      queryClient.invalidateQueries({ queryKey: queryKeys.categoryActuals(monthKey) })
    },
  })
}

export function useCreateBudgetLine(monthKey: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TablesInsert<'budget_lines'>) => createBudgetLine(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetLines(monthKey) })
    },
  })
}

export function useDeleteBudgetLine(monthKey: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBudgetLine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetLines(monthKey) })
    },
  })
}

export function useSetBudgetLinePayment(monthKey: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { budgetLineId: string; familyMemberId: string; paidAmount: number }) =>
      setBudgetLinePayment(vars.budgetLineId, vars.familyMemberId, vars.paidAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetLines(monthKey) })
    },
  })
}
