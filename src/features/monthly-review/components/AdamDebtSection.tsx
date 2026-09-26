import { useState } from 'react'
import { formatILS } from '@/lib/format'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PlusIcon, TrashIcon } from '@/components/ui/icons'
import { useCreateDetail, useUpdateDetail } from '@/features/categories/useCategories'
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

export function AdamDebtSection({ items }: { items: AdamDebtDetailTotal[] }) {
  const createDetail = useCreateDetail()
  const updateDetail = useUpdateDetail()
  const [addingForCategoryId, setAddingForCategoryId] = useState<string | null>(null)
  const [newDetailName, setNewDetailName] = useState('')

  if (items.length === 0) return null

  const groups = groupByCategory(items)
  const total = items.reduce((sum, i) => sum + i.owed, 0)

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="px-2 py-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200">מה אדם חייב לנו</div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {groups.map((group) => (
          <div key={group.categoryId} className="p-2">
            <div className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
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
            </div>

            <table className="mt-1 w-full text-start">
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {group.items.map((item) => (
                  <tr key={item.detailId}>
                    <td className="py-1 text-sm text-gray-700 dark:text-gray-300">{item.detailName}</td>
                    <td className="py-1 text-sm text-gray-700 dark:text-gray-300">{formatILS(item.owed)}</td>
                    <td className="py-1 text-end">
                      <Button
                        variant="ghost"
                        title="הסרת תת-קטגוריה"
                        aria-label="הסרת תת-קטגוריה"
                        onClick={() => updateDetail.mutate({ id: item.detailId, patch: { is_active: false } })}
                      >
                        <TrashIcon />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {addingForCategoryId === group.categoryId && (
              <div className="mt-1.5 flex gap-2">
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
            )}
          </div>
        ))}

        <div className="flex justify-between px-2 py-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200">
          <span>סה"כ</span>
          <span>{formatILS(total)}</span>
        </div>
      </div>
    </div>
  )
}
