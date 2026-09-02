import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSavingsGoal,
  getAllSavingsGoalBalances,
  getSavingsGoals,
  updateSavingsGoal,
  upsertContribution,
} from '@/lib/supabase/queries/savingsGoals'
import { queryKeys } from '@/lib/queryClient'
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types'

export function useSavingsGoals() {
  return useQuery({ queryKey: queryKeys.savingsGoals, queryFn: getSavingsGoals })
}

export function useAllSavingsGoalBalances() {
  return useQuery({ queryKey: queryKeys.savingsGoalBalances, queryFn: getAllSavingsGoalBalances })
}

export function useCreateSavingsGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TablesInsert<'savings_goals'>) => createSavingsGoal(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals }),
  })
}

export function useUpdateSavingsGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; patch: TablesUpdate<'savings_goals'> }) =>
      updateSavingsGoal(vars.id, vars.patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals }),
  })
}

export function useUpsertContribution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { goalId: string; monthKey: string; contributedAmount: number; notes?: string }) =>
      upsertContribution(vars.goalId, vars.monthKey, vars.contributedAmount, vars.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoalBalances })
    },
  })
}
