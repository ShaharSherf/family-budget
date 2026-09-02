import { Fragment, useState } from 'react'
import { formatILS } from '@/lib/format'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { MonthlyTableRow } from './MonthlyTableRow'
import { AddLineDialog } from './AddLineDialog'
import type { CategoryGroup } from '../utils'

function groupTotalColor(group: CategoryGroup): string {
  if (group.targetTotal <= 0) return 'text-gray-800 dark:text-gray-200'
  const isGood = group.kind === 'income' ? group.actualTotal > group.targetTotal : group.actualTotal < group.targetTotal
  const isWarning = group.kind === 'income' ? group.actualTotal < group.targetTotal : group.actualTotal > group.targetTotal
  if (isWarning) return 'text-red-600 dark:text-red-400'
  if (isGood) return 'text-green-600 dark:text-green-400'
  return 'text-gray-800 dark:text-gray-200'
}

const HEADERS = ['פירוט', 'בפועל', 'תקציב', '% עלינו', 'משפחתי', 'נותר', 'מי שילם', 'הערות', '']

export function MonthlyTable({
  groups,
  monthKey,
  readOnly,
}: {
  groups: CategoryGroup[]
  monthKey: string
  readOnly: boolean
}) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  return (
    <div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full text-start">
          <thead>
            <tr>
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className="sticky top-[57px] z-[5] bg-gray-50 px-2 py-1.5 text-start text-xs font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {groups.map((group) => (
              <Fragment key={group.categoryId}>
                <tr className="bg-gray-100 dark:bg-gray-800/60">
                  <td colSpan={4} className="px-2 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {group.categoryName}
                  </td>
                  <td className={cn('px-2 py-1 text-sm font-semibold', groupTotalColor(group))}>
                    {formatILS(group.actualTotal)}
                  </td>
                  <td
                    colSpan={4}
                    className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400"
                  >
                    מתוכנן: {formatILS(group.targetTotal)}
                  </td>
                </tr>
                {group.rows.map((row) => (
                  <MonthlyTableRow key={row.id} row={row} monthKey={monthKey} readOnly={readOnly} />
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {!readOnly && (
        <Button variant="secondary" className="mt-3" onClick={() => setAddDialogOpen(true)}>
          + הוספת שורה
        </Button>
      )}
      <AddLineDialog monthKey={monthKey} open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  )
}
