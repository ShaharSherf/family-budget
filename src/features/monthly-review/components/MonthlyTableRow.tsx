import { useState } from 'react'
import { useDebouncedCallback } from '@/lib/useDebouncedCallback'
import { formatILS } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { NumberInput, Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CheckIcon } from '@/components/ui/icons'
import { useDeleteBudgetLine, useUpdateBudgetLine } from '../hooks/useBudgetLineMutations'
import { WhoPaidCell } from './WhoPaidCell'
import type { BudgetLineWithRelations } from '@/types/domain'
import type { TablesUpdate } from '@/lib/supabase/database.types'

export function MonthlyTableRow({
  row,
  monthKey,
  readOnly,
}: {
  row: BudgetLineWithRelations
  monthKey: string
  readOnly: boolean
}) {
  const update = useUpdateBudgetLine(monthKey)
  const remove = useDeleteBudgetLine(monthKey)

  const [actual, setActual] = useState(row.actual_amount?.toString() ?? '')
  const [target, setTarget] = useState(row.target_amount?.toString() ?? '')
  const [sharePct, setSharePct] = useState(row.share_pct.toString())
  const [notes, setNotes] = useState(row.notes ?? '')

  const commit = useDebouncedCallback((patch: TablesUpdate<'budget_lines'>) => {
    update.mutate({ id: row.id, patch: { ...patch, needs_review: false, is_template_override: row.template_id ? true : row.is_template_override } })
  }, 400)

  const hasComparison = row.target_amount !== null && row.family_actual_amount !== null
  const isIncome = row.category.kind === 'income'

  // Expenses: "remaining budget" (target - actual), red when over budget (negative).
  // Income: shown as a plain surplus/shortfall magnitude — never a signed negative
  // number, since "earned more than planned" is good news, not a deficit.
  const remaining = hasComparison ? row.target_amount! - row.family_actual_amount! : null
  const incomeDiff = hasComparison ? row.family_actual_amount! - row.target_amount! : null

  const remainingDisplay = remaining === null ? null : isIncome ? Math.abs(incomeDiff!) : remaining
  const remainingIsWarning = remaining !== null && (isIncome ? incomeDiff! < 0 : remaining < 0)
  const remainingIsGood = isIncome && incomeDiff !== null && incomeDiff >= 0

  return (
    <tr className={row.needs_review ? 'bg-amber-50 dark:bg-amber-950/30' : undefined}>
      <td className="px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100">
        <div className="flex items-center gap-1.5">
          {row.detail.name_he}
          {row.needs_review && <Badge tone="warning">לבדיקה</Badge>}
          {row.is_template_override && <Badge tone="neutral">שונה מהתבנית</Badge>}
        </div>
      </td>
      <td className="px-2 py-1.5">
        <NumberInput
          className="w-24"
          value={actual}
          disabled={readOnly}
          placeholder="0"
          onChange={(e) => {
            setActual(e.target.value)
            const n = Number(e.target.value)
            if (Number.isFinite(n)) commit({ actual_amount: n })
          }}
        />
      </td>
      <td className="px-2 py-1.5">
        <NumberInput
          className="w-24"
          value={target}
          disabled={readOnly}
          placeholder="0"
          onChange={(e) => {
            setTarget(e.target.value)
            const n = Number(e.target.value)
            if (Number.isFinite(n)) commit({ target_amount: n })
          }}
        />
      </td>
      <td className="px-2 py-1.5">
        <NumberInput
          className="w-16"
          value={sharePct}
          disabled={readOnly}
          onChange={(e) => {
            setSharePct(e.target.value)
            const n = Number(e.target.value)
            if (Number.isFinite(n)) commit({ share_pct: n })
          }}
        />
      </td>
      <td className="px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300">
        {formatILS(row.family_actual_amount)}
      </td>
      <td
        className={
          remainingIsWarning
            ? 'px-2 py-1.5 text-sm font-medium text-red-600 dark:text-red-400'
            : remainingIsGood
              ? 'px-2 py-1.5 text-sm font-medium text-green-600 dark:text-green-400'
              : 'px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400'
        }
      >
        {remainingDisplay !== null ? formatILS(remainingDisplay) : '—'}
      </td>
      <td className="px-2 py-1.5">
        <WhoPaidCell budgetLineId={row.id} payments={row.payments} monthKey={monthKey} readOnly={readOnly} />
      </td>
      <td className="px-2 py-1.5">
        <Input
          className="w-32"
          value={notes}
          disabled={readOnly}
          onChange={(e) => {
            setNotes(e.target.value)
            commit({ notes: e.target.value })
          }}
        />
      </td>
      <td className="flex gap-1 px-2 py-1.5">
        {row.needs_review && !readOnly && (
          <Button variant="ghost" onClick={() => update.mutate({ id: row.id, patch: { needs_review: false } })}>
            <CheckIcon />
          </Button>
        )}
        {!readOnly && !row.template_id && (
          <Button variant="ghost" onClick={() => remove.mutate(row.id)}>
            ✕
          </Button>
        )}
      </td>
    </tr>
  )
}
