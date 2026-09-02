import { useMemo, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useCategories, useDetails } from '@/features/categories/useCategories'
import { useCreateBudgetLine } from '../hooks/useBudgetLineMutations'
import { toMonthDate } from '@/lib/month'

export function AddLineDialog({ monthKey, open, onOpenChange }: { monthKey: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: categories = [] } = useCategories()
  const { data: details = [] } = useDetails()
  const create = useCreateBudgetLine(monthKey)

  const [categoryId, setCategoryId] = useState('')
  const [detailId, setDetailId] = useState('')

  const detailOptions = useMemo(
    () => details.filter((d) => d.category_id === categoryId && d.is_active).map((d) => ({ value: d.id, label: d.name_he })),
    [details, categoryId],
  )

  function handleAdd() {
    if (!categoryId || !detailId) return
    create.mutate(
      { month_key: toMonthDate(monthKey), category_id: categoryId, detail_id: detailId },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="הוספת שורה">
      <div className="flex flex-col gap-3">
        <Select
          value={categoryId}
          onValueChange={(v) => {
            setCategoryId(v)
            setDetailId('')
          }}
          placeholder="קטגוריה"
          options={categories.filter((c) => c.is_active).map((c) => ({ value: c.id, label: c.name_he }))}
        />
        <Select
          value={detailId}
          onValueChange={setDetailId}
          placeholder="פירוט"
          options={detailOptions}
        />
        <Button onClick={handleAdd} disabled={!categoryId || !detailId}>
          הוספה
        </Button>
      </div>
    </Dialog>
  )
}
