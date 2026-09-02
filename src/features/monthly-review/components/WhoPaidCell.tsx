import { useState } from 'react'
import { useFamilyMembers } from '@/features/family-members/useFamilyMembers'
import { useSetBudgetLinePayment } from '../hooks/useBudgetLineMutations'
import { useDebouncedCallback } from '@/lib/useDebouncedCallback'
import { NumberInput } from '@/components/ui/Input'
import type { BudgetLinePayment } from '@/types/domain'

/**
 * Per-person "who paid" breakdown — plain reference data for visibility
 * only (e.g. so the family can review who bought what), not used for any
 * automatic settle-up calculation.
 */
export function WhoPaidCell({
  budgetLineId,
  payments,
  monthKey,
  readOnly,
}: {
  budgetLineId: string
  payments: BudgetLinePayment[]
  monthKey: string
  readOnly: boolean
}) {
  const { data: members = [] } = useFamilyMembers()
  const setPayment = useSetBudgetLinePayment(monthKey)
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const commit = useDebouncedCallback((familyMemberId: string, amount: number) => {
    setPayment.mutate({ budgetLineId, familyMemberId, paidAmount: amount })
  }, 400)

  return (
    <div className="flex gap-1">
      {members
        .filter((m) => m.is_active)
        .map((member) => {
          const existing = payments.find((p) => p.family_member_id === member.id)
          const value = drafts[member.id] ?? (existing?.paid_amount ? String(existing.paid_amount) : '')
          return (
            <div key={member.id} className="flex flex-col items-center">
              <span className="text-[10px] text-gray-400">{member.display_name}</span>
              <NumberInput
                className="w-16"
                value={value}
                disabled={readOnly}
                placeholder="0"
                onChange={(e) => {
                  const raw = e.target.value
                  setDrafts((d) => ({ ...d, [member.id]: raw }))
                  const amount = Number(raw)
                  if (Number.isFinite(amount)) commit(member.id, amount)
                }}
              />
            </div>
          )
        })}
    </div>
  )
}
