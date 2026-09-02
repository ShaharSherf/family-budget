import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

export const queryKeys = {
  categories: ['categories'] as const,
  familyMembers: ['familyMembers'] as const,
  months: ['months'] as const,
  month: (monthKey: string) => ['months', monthKey] as const,
  budgetLines: (monthKey: string) => ['budgetLines', monthKey] as const,
  monthKpis: (monthKey: string) => ['monthKpis', monthKey] as const,
  categoryActuals: (monthKey: string) => ['categoryActuals', monthKey] as const,
  savingsGoals: ['savingsGoals'] as const,
  allSavingsContributions: ['savingsContributions'] as const,
  goalContributions: (goalId: string) => ['savingsContributions', 'goal', goalId] as const,
  monthSavingsContributions: (monthKey: string) => ['savingsContributions', 'month', monthKey] as const,
  analytics: (fromMonth: string, toMonth: string) => ['analytics', fromMonth, toMonth] as const,
}
