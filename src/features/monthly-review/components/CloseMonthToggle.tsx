import { useMonth, useSetMonthClosed } from '../hooks/useMonth'
import { Toggle } from '@/components/ui/Toggle'
import { LockIcon } from '@/components/ui/icons'

export function CloseMonthToggle({ monthKey }: { monthKey: string }) {
  const { data: month } = useMonth(monthKey)
  const setClosed = useSetMonthClosed(monthKey)

  if (!month) return null

  return (
    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
      {month.is_closed && <LockIcon />}
      <span>{month.is_closed ? 'החודש נעול' : 'נעילת החודש'}</span>
      <Toggle
        pressed={month.is_closed}
        onPressedChange={(pressed) => setClosed.mutate(pressed)}
        label={month.is_closed ? 'החודש נעול — לחיצה לפתיחה' : 'לחיצה לנעילת החודש'}
      />
    </div>
  )
}
