import { useState } from 'react'
import { useCategories, useCreateCategory, useCreateDetail, useDetails, useUpdateCategory, useUpdateDetail } from './useCategories'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Toggle } from '@/components/ui/Toggle'
import { PlusIcon } from '@/components/ui/icons'

export function CategoriesSettingsPage() {
  const { data: categories = [] } = useCategories()
  const { data: details = [] } = useDetails()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const createDetail = useCreateDetail()
  const updateDetail = useUpdateDetail()

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryKind, setNewCategoryKind] = useState<'income' | 'expense'>('expense')
  const [newDetailByCategory, setNewDetailByCategory] = useState<Record<string, string>>({})

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">קטגוריות ופירוטים</h2>

      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
        <Input placeholder="שם קטגוריה" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
        <Select
          value={newCategoryKind}
          onValueChange={(v) => setNewCategoryKind(v as 'income' | 'expense')}
          options={[
            { value: 'expense', label: 'הוצאה' },
            { value: 'income', label: 'הכנסה' },
          ]}
        />
        <Button
          title="הוספת קטגוריה"
          aria-label="הוספת קטגוריה"
          onClick={() => {
            if (!newCategoryName.trim()) return
            createCategory.mutate({ name_he: newCategoryName.trim(), kind: newCategoryKind })
            setNewCategoryName('')
          }}
        >
          <PlusIcon />
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {categories.map((category) => (
          <div key={category.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">{category.name_he}</span>
                <Badge tone={category.kind === 'income' ? 'success' : 'neutral'}>
                  {category.kind === 'income' ? 'הכנסה' : 'הוצאה'}
                </Badge>
                {!category.is_active && <Badge tone="warning">לא פעיל</Badge>}
              </div>
              <Toggle
                pressed={category.is_active}
                onPressedChange={(pressed) => updateCategory.mutate({ id: category.id, patch: { is_active: pressed } })}
                label={category.is_active ? 'פעיל — לחיצה להשבתה' : 'לא פעיל — לחיצה להפעלה'}
              />
            </div>

            <ul className="mt-2 flex flex-wrap gap-1.5">
              {details
                .filter((d) => d.category_id === category.id)
                .map((detail) => (
                  <li key={detail.id}>
                    <Badge tone={detail.is_active ? 'neutral' : 'warning'}>
                      <button
                        onClick={() => updateDetail.mutate({ id: detail.id, patch: { is_active: !detail.is_active } })}
                      >
                        {detail.name_he}
                      </button>
                    </Badge>
                  </li>
                ))}
            </ul>

            <div className="mt-2 flex gap-2">
              <Input
                placeholder="פירוט חדש"
                value={newDetailByCategory[category.id] ?? ''}
                onChange={(e) => setNewDetailByCategory((prev) => ({ ...prev, [category.id]: e.target.value }))}
              />
              <Button
                variant="secondary"
                title="הוספה"
                aria-label="הוספה"
                onClick={() => {
                  const name = newDetailByCategory[category.id]?.trim()
                  if (!name) return
                  createDetail.mutate({ category_id: category.id, name_he: name })
                  setNewDetailByCategory((prev) => ({ ...prev, [category.id]: '' }))
                }}
              >
                <PlusIcon />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
