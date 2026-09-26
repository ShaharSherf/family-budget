import { useState } from 'react'
import { formatILS } from '@/lib/format'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { PlusIcon } from '@/components/ui/icons'
import { useCategories, useCreateDetail, useDetails, useUpdateDetail } from '@/features/categories/useCategories'
import type { AdamDebtDetailTotal } from '../utils'

export function AdamDebtSection({ items }: { items: AdamDebtDetailTotal[] }) {
  const { data: categories = [] } = useCategories()
  const { data: details = [] } = useDetails()
  const createDetail = useCreateDetail()
  const updateDetail = useUpdateDetail()

  const [categoryId, setCategoryId] = useState('')
  const [detailName, setDetailName] = useState('')

  const total = items.reduce((sum, i) => sum + i.owed, 0)
  const activeDetails = details
    .filter((d) => d.is_active)
    .map((d) => ({ ...d, categoryName: categories.find((c) => c.id === d.category_id)?.name_he ?? '—' }))

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="px-2 py-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200">מה אדם חייב לנו</div>

      {items.length > 0 && (
        <table className="w-full text-start">
          <thead>
            <tr>
              <th className="px-2 py-1.5 text-start text-xs font-medium text-gray-500 dark:text-gray-400">קטגוריה</th>
              <th className="px-2 py-1.5 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
                תת-קטגוריה
              </th>
              <th className="px-2 py-1.5 text-start text-xs font-medium text-gray-500 dark:text-gray-400">
                אדם חייב
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((item) => (
              <tr key={item.detailId}>
                <td className="px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100">{item.categoryName}</td>
                <td className="px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300">{item.detailName}</td>
                <td className="px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300">{formatILS(item.owed)}</td>
              </tr>
            ))}
            <tr className="bg-gray-100 dark:bg-gray-800/60">
              <td colSpan={2} className="px-2 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                סה"כ
              </td>
              <td className="px-2 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{formatILS(total)}</td>
            </tr>
          </tbody>
        </table>
      )}

      <div className="border-t border-gray-100 p-2 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400">תתי-קטגוריות</div>

        <ul className="mt-1.5 flex flex-wrap gap-1.5">
          {activeDetails.map((detail) => (
            <li key={detail.id}>
              <Badge tone="neutral">
                <button onClick={() => updateDetail.mutate({ id: detail.id, patch: { is_active: false } })}>
                  {detail.categoryName}: {detail.name_he} ✕
                </button>
              </Badge>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex flex-wrap items-end gap-2">
          <Select
            className="w-32"
            placeholder="קטגוריה"
            value={categoryId}
            onValueChange={setCategoryId}
            options={categories.filter((c) => c.is_active).map((c) => ({ value: c.id, label: c.name_he }))}
          />
          <Input
            className="w-32"
            placeholder="תת-קטגוריה חדשה"
            value={detailName}
            onChange={(e) => setDetailName(e.target.value)}
          />
          <Button
            title="הוספה"
            aria-label="הוספה"
            onClick={() => {
              if (!categoryId || !detailName.trim()) return
              createDetail.mutate({ category_id: categoryId, name_he: detailName.trim() })
              setDetailName('')
            }}
          >
            <PlusIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}
