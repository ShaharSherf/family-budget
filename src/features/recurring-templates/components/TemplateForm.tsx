import { useMemo, useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Select } from '@/components/ui/Select'
import { NumberInput } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useCategories, useDetails } from '@/features/categories/useCategories'
import { useCreateRecurringTemplate } from '../hooks/useRecurringTemplates'
import { currentMonthKey, toMonthDate } from '@/lib/month'

export function TemplateForm({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: categories = [] } = useCategories()
  const { data: details = [] } = useDetails()
  const create = useCreateRecurringTemplate()

  const [categoryId, setCategoryId] = useState('')
  const [detailId, setDetailId] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [actualAmount, setActualAmount] = useState('')
  const [sharePct, setSharePct] = useState('100')

  const detailOptions = useMemo(
    () => details.filter((d) => d.category_id === categoryId && d.is_active).map((d) => ({ value: d.id, label: d.name_he })),
    [details, categoryId],
  )

  function handleCreate() {
    if (!categoryId || !detailId) return
    create.mutate(
      {
        category_id: categoryId,
        detail_id: detailId,
        default_target_amount: targetAmount ? Number(targetAmount) : null,
        default_actual_amount: actualAmount ? Number(actualAmount) : null,
        default_share_pct: Number(sharePct) || 100,
        effective_from: toMonthDate(currentMonthKey()),
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          setCategoryId('')
          setDetailId('')
          setTargetAmount('')
          setActualAmount('')
          setSharePct('100')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="הוצאה קבועה חדשה">
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
        <Select value={detailId} onValueChange={setDetailId} placeholder="פירוט" options={detailOptions} />
        <div className="flex gap-2">
          <NumberInput placeholder="סכום בפועל קבוע" value={actualAmount} onChange={(e) => setActualAmount(e.target.value)} />
          <NumberInput placeholder="תקציב" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
          <NumberInput placeholder="% עלינו" value={sharePct} onChange={(e) => setSharePct(e.target.value)} />
        </div>
        <p className="text-xs text-gray-400">
          יופיע החל מהחודש הנוכחי ואילך. שינוי בתבנית משפיע רק על חודשים עתידיים.
        </p>
        <Button onClick={handleCreate} disabled={!categoryId || !detailId}>
          יצירה
        </Button>
      </div>
    </Dialog>
  )
}
