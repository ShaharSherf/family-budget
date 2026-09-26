import { Fragment, useState } from 'react'
import { formatILS } from '@/lib/format'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PlusIcon, TrashIcon } from '@/components/ui/icons'
import { useCreateDetail } from '@/features/categories/useCategories'
import { useUpdateBudgetLine } from '../hooks/useBudgetLineMutations'
import type { AdamDebtDetailTotal } from '../utils'

interface CategoryGroup {
  categoryId: string
  categoryName: string
  items: AdamDebtDetailTotal[]
}

function groupByCategory(items: AdamDebtDetailTotal[]): CategoryGroup[] {
  const groups = new Map<string, CategoryGroup>()
  for (const item of items) {
    let group = groups.get(item.categoryId)
    if (!group) {
      group = { categoryId: item.categoryId, categoryName: item.categoryName, items: [] }
      groups.set(item.categoryId, group)
    }
    group.items.push(item)
  }
  return Array.from(groups.values())
}

export function AdamDebtSection({ items, monthKey }: { items: AdamDebtDetailTotal[]; monthKey: string }) {
  const createDetail = useCreateDetail()
  const updateBudgetLine = useUpdateBudgetLine(monthKey)
  const [addingForCategoryId, setAddingForCategoryId] = useState<string | null>(null)
  const [newDetailName, setNewDetailName] = useState('')

  if (items.length === 0) return null

  const groups = groupByCategory(items)
  const total = items.reduce((sum, i) => sum + i.owed, 0)

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="px-2 py-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200">מה אדם חייב לנו</div>

      <table className="w-full text-start">
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {groups.map((group) => (
            <Fragment key={group.categoryId}>
              <tr className="bg-gray-50 dark:bg-gray-900/40">
                <td colSpan={3} className="px-2 py-1">
                  <span className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {group.categoryName}
                    <Button
                      variant="ghost"
                      title="הוספת תת-קטגוריה"
                      aria-label="הוספת תת-קטגוריה"
                      onClick={() => {
                        setAddingForCategoryId(group.categoryId)
                        setNewDetailName('')
                      }}
                    >
                      <PlusIcon />
                    </Button>
                  </span>
                </td>
              </tr>

              {group.items.map((item) => (
                <tr key={item.detailId}>
                  <td className="px-2 py-1 text-sm text-gray-700 dark:text-gray-300">{item.detailName}</td>
                  <td className="px-2 py-1 text-sm text-gray-700 dark:text-gray-300">{formatILS(item.owed)}</td>
                  <td className="px-2 py-1 text-end">
                    <Button
                      variant="ghost"
                      title="הסרה מהחוב של אדם החודש (חוזר ל-100% עלינו)"
                      aria-label="הסרה מהחוב של אדם החודש"
                      onClick={() => updateBudgetLine.mutate({ id: item.budgetLineId, patch: { share_pct: 100 } })}
                    >
                      <TrashIcon />
                    </Button>
                  </td>
                </tr>
              ))}

              {addingForCategoryId === group.categoryId && (
                <tr>
                  <td colSpan={3} className="px-2 py-1.5">
                    <div className="flex gap-2">
                      <Input
                        className="flex-1"
                        placeholder="תת-קטגוריה חדשה"
                        value={newDetailName}
                        onChange={(e) => setNewDetailName(e.target.value)}
                      />
                      <Button
                        title="אישור"
                        aria-label="אישור"
                        onClick={() => {
                          if (!newDetailName.trim()) return
                          createDetail.mutate({ category_id: group.categoryId, name_he: newDetailName.trim() })
                          setAddingForCategoryId(null)
                        }}
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}

          <tr className="bg-gray-100 dark:bg-gray-800/60">
            <td className="px-2 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200">סה"כ</td>
            <td className="px-2 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{formatILS(total)}</td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  )
}
