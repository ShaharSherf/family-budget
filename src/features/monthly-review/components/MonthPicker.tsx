import { useNavigate } from 'react-router-dom'
import { addMonths } from '@/lib/month'
import { formatMonthLabel } from '@/lib/format'
import { ChevronEnd, ChevronStart } from '@/components/ui/icons'

export function MonthPicker({ monthKey }: { monthKey: string }) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-2">
      <button
        aria-label="חודש קודם"
        onClick={() => navigate(`/monthly/${addMonths(monthKey, -1)}`)}
        className="rounded-md p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <ChevronStart className="rtl:scale-x-[-1]" />
      </button>
      <h2 className="min-w-40 text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
        {formatMonthLabel(monthKey)}
      </h2>
      <button
        aria-label="חודש הבא"
        onClick={() => navigate(`/monthly/${addMonths(monthKey, 1)}`)}
        className="rounded-md p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <ChevronEnd className="rtl:scale-x-[-1]" />
      </button>
    </div>
  )
}
