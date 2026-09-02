import { useState } from 'react'
import { useRecurringTemplates, useSetRecurringTemplateActive } from './hooks/useRecurringTemplates'
import { TemplateForm } from './components/TemplateForm'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatILS, formatPercent } from '@/lib/format'

export function RecurringTemplatesPage() {
  const { data: templates = [] } = useRecurringTemplates()
  const setActive = useSetRecurringTemplateActive()
  const [formOpen, setFormOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">הוצאות והכנסות קבועות</h2>
        <Button onClick={() => setFormOpen(true)}>+ תבנית חדשה</Button>
      </div>

      <div className="flex flex-col gap-2">
        {templates.map((template) => (
          <div
            key={template.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-800"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {template.category.name_he} · {template.detail.name_he}
                </span>
                {!template.is_active && <Badge tone="warning">מושבת</Badge>}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                בפועל: {formatILS(template.default_actual_amount)} · תקציב: {formatILS(template.default_target_amount)} ·{' '}
                {formatPercent(template.default_share_pct)}
              </div>
            </div>
            <Button
              variant={template.is_active ? 'secondary' : 'primary'}
              onClick={() => setActive.mutate({ id: template.id, isActive: !template.is_active })}
            >
              {template.is_active ? 'השבתה' : 'הפעלה מחדש'}
            </Button>
          </div>
        ))}
        {templates.length === 0 && <p className="text-sm text-gray-400">אין עדיין תבניות קבועות.</p>}
      </div>

      <TemplateForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
