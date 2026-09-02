import { useQuery } from '@tanstack/react-query'
import { getCategoryActualsRange, getMonthKpisRange } from '@/lib/supabase/queries/analytics'
import { getAllMonths } from '@/lib/supabase/queries/months'
import { fromMonthDate } from '@/lib/month'
import { queryKeys } from '@/lib/queryClient'

/** The full available month range, derived from the `months` table rather than hardcoded. */
export function useMonthRange() {
  return useQuery({
    queryKey: queryKeys.months,
    queryFn: async () => {
      const months = await getAllMonths()
      if (months.length === 0) return null
      return {
        from: fromMonthDate(months[0].month_key),
        to: fromMonthDate(months[months.length - 1].month_key),
      }
    },
  })
}

export function useMonthKpisRange(fromMonth: string | undefined, toMonth: string | undefined) {
  return useQuery({
    queryKey: queryKeys.analytics(fromMonth ?? '', toMonth ?? ''),
    queryFn: () => getMonthKpisRange(fromMonth!, toMonth!),
    enabled: !!fromMonth && !!toMonth,
  })
}

export function useCategoryActualsRange(fromMonth: string | undefined, toMonth: string | undefined) {
  return useQuery({
    queryKey: ['categoryActualsRange', fromMonth, toMonth],
    queryFn: () => getCategoryActualsRange(fromMonth!, toMonth!),
    enabled: !!fromMonth && !!toMonth,
  })
}
