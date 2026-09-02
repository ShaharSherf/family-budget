import { useState } from 'react'
import { useDebouncedCallback } from '@/lib/useDebouncedCallback'
import { formatILS } from '@/lib/format'
import { NumberInput, Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
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
    update.mutate({ id: row.id, patch })
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
  // Income: earning more than planned is good. Expenses: spending less than
  // budgeted (a positive remaining balance) is good; spending exactly the
  // budget is neutral, not a "win".
  const remainingIsGood = remaining !== null && (isIncome ? incomeDiff! > 0 : remaining > 0)

  return (
    <tr>
      <td className="px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100">{row.detail.name_he}</td>
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
      <td className="px-2 py-1.5">
        {!readOnly && (
          <Button variant="ghost" onClick={() => remove.mutate(row.id)}>
            ✕
          </Button>
        )}
      </td>
    </tr>
  )
}
