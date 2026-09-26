import { useState } from 'react'
import { formatILS } from '@/lib/format'
import { Input, NumberInput } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { TrashIcon, PlusIcon } from '@/components/ui/icons'
import { useAddAdamDebtItem, useAdamDebtItems, useDeleteAdamDebtItem } from '../hooks/useAdamDebt'

export function AdamDebtSection({ monthKey, readOnly }: { monthKey: string; readOnly: boolean }) {
  const { data: items = [] } = useAdamDebtItems(monthKey)
  const addItem = useAddAdamDebtItem(monthKey)
  const deleteItem = useDeleteAdamDebtItem(monthKey)
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')

  const byCategory = new Map<string, number>()
  for (const item of items) byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + item.amount)
  const total = items.reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="px-2 py-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200">מה עדם חייב לנו</div>
      <table className="w-full text-start">
        <thead>
          <tr>
            <th className="px-2 py-1.5 text-start text-xs font-medium text-gray-500 dark:text-gray-400">קטגוריה</th>
            <th className="px-2 py-1.5 text-start text-xs font-medium text-gray-500 dark:text-gray-400">סכום</th>
            <th className="px-2 py-1.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100">{item.category}</td>
              <td className="px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300">{formatILS(item.amount)}</td>
              <td className="px-2 py-1.5 text-end">
                <Button
                  variant="ghost"
                  disabled={readOnly}
                  title="מחיקה"
                  aria-label="מחיקה"
                  onClick={() => deleteItem.mutate(item.id)}
                >
                  <TrashIcon />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {byCategory.size > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-gray-100 px-2 py-1.5 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
          {[...byCategory.entries()].map(([cat, sum]) => (
            <span key={cat}>
              {cat}: {formatILS(sum)}
            </span>
          ))}
          <span className="font-semibold text-gray-700 dark:text-gray-300">סה"כ: {formatILS(total)}</span>
        </div>
      )}

      {!readOnly && (
        <div className="flex flex-wrap items-end gap-2 border-t border-gray-100 p-2 dark:border-gray-800">
          <Input className="w-32" placeholder="קטגוריה" value={category} onChange={(e) => setCategory(e.target.value)} />
          <NumberInput className="w-24" placeholder="סכום" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button
            title="הוספה"
            aria-label="הוספה"
            onClick={() => {
              const n = Number(amount)
              if (!category.trim() || amount === '' || !Number.isFinite(n)) return
              addItem.mutate({ category: category.trim(), amount: n })
              setCategory('')
              setAmount('')
            }}
          >
            <PlusIcon />
          </Button>
        </div>
      )}
    </div>
  )
}
