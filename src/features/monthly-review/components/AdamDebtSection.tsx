import { useState } from 'react'
import { formatILS } from '@/lib/format'
import { NumberInput } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { TrashIcon, PlusIcon } from '@/components/ui/icons'
import { useCategories } from '@/features/categories/useCategories'
import { useAddAdamDebtShare, useAdamDebtShares, useDeleteAdamDebtShare } from '../hooks/useAdamDebt'
import type { CategoryGroup } from '../utils'

export function AdamDebtSection({ groups }: { groups: CategoryGroup[] }) {
  const { data: categories = [] } = useCategories()
  const { data: shares = [] } = useAdamDebtShares()
  const addShare = useAddAdamDebtShare()
  const deleteShare = useDeleteAdamDebtShare()
  const [newCategoryId, setNewCategoryId] = useState('')
  const [newPercentage, setNewPercentage] = useState('')

  const actualByCategory = new Map(groups.map((g) => [g.categoryId, g.actualTotal]))
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name_he]))
  const availableCategories = categories.filter((c) => c.is_active && !shares.some((s) => s.category_id === c.id))

  const rows = shares.map((share) => {
    const actual = actualByCategory.get(share.category_id) ?? 0
    const owed = (actual * share.percentage) / 100
    return { share, categoryName: categoryNameById.get(share.category_id) ?? '—', actual, owed }
  })
  const total = rows.reduce((sum, r) => sum + r.owed, 0)

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="px-2 py-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200">מה אדם חייב לנו</div>
      {rows.length > 0 && (
        <table className="w-full text-start">
          <thead>
            <tr>
              <th className="px-2 py-1.5 text-start text-xs font-medium text-gray-500 dark:text-gray-400">קטגוריה</th>
              <th className="px-2 py-1.5 text-start text-xs font-medium text-gray-500 dark:text-gray-400">אחוז</th>
              <th className="px-2 py-1.5 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
                הוצאה בפועל החודש
              </th>
              <th className="px-2 py-1.5 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
                אדם חייב
              </th>
              <th className="px-2 py-1.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map(({ share, categoryName, actual, owed }) => (
              <tr key={share.id}>
                <td className="px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100">{categoryName}</td>
                <td className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">{share.percentage}%</td>
                <td className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">{formatILS(actual)}</td>
                <td className="px-2 py-1.5 text-sm font-medium text-gray-900 dark:text-gray-100">{formatILS(owed)}</td>
                <td className="px-2 py-1.5 text-end">
                  <Button
                    variant="ghost"
                    title="הסרת שיוך"
                    aria-label="הסרת שיוך"
                    onClick={() => deleteShare.mutate(share.id)}
                  >
                    <TrashIcon />
                  </Button>
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100 dark:bg-gray-800/60">
              <td colSpan={3} className="px-2 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                סה"כ
              </td>
              <td className="px-2 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{formatILS(total)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      )}

      {availableCategories.length > 0 && (
        <div className="flex flex-wrap items-end gap-2 border-t border-gray-100 p-2 dark:border-gray-800">
          <Select
            className="w-40"
            placeholder="קטגוריה"
            value={newCategoryId}
            onValueChange={setNewCategoryId}
            options={availableCategories.map((c) => ({ value: c.id, label: c.name_he }))}
          />
          <NumberInput
            className="w-20"
            placeholder="אחוז"
            value={newPercentage}
            onChange={(e) => setNewPercentage(e.target.value)}
          />
          <Button
            title="הוספה"
            aria-label="הוספה"
            onClick={() => {
              const n = Number(newPercentage)
              if (!newCategoryId || newPercentage === '' || !Number.isFinite(n) || n <= 0 || n > 100) return
              addShare.mutate({ categoryId: newCategoryId, percentage: n })
              setNewCategoryId('')
              setNewPercentage('')
            }}
          >
            <PlusIcon />
          </Button>
        </div>
      )}
    </div>
  )
}
