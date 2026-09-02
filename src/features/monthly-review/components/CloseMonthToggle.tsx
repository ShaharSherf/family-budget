import { useMonth, useSetMonthClosed } from '../hooks/useMonth'
import { Toggle } from '@/components/ui/Toggle'

export function CloseMonthToggle({ monthKey }: { monthKey: string }) {
  const { data: month } = useMonth(monthKey)
  const setClosed = useSetMonthClosed(monthKey)

  if (!month) return null

  return (
    <Toggle
      pressed={month.is_closed}
      onPressedChange={(pressed) => setClosed.mutate(pressed)}
      label={month.is_closed ? 'החודש נעול — פתיחה' : 'נעילת החודש'}
    />
  )
}
