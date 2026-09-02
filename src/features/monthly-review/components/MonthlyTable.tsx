import { Fragment, useState } from 'react'
import { formatILS } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { MonthlyTableRow } from './MonthlyTableRow'
import { AddLineDialog } from './AddLineDialog'
import type { CategoryGroup } from '../utils'

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
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full text-start">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {HEADERS.map((h) => (
                <th key={h} className="px-2 py-1.5 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
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
                  <td className="px-2 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
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
