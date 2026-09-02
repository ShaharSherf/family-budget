import { useState } from 'react'
import { NumberInput } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { currentMonthKey } from '@/lib/month'
import { useUpsertContribution } from '../hooks/useSavingsGoals'

export function ContributionForm({ goalId }: { goalId: string }) {
  const [amount, setAmount] = useState('')
  const upsert = useUpsertContribution()

  return (
    <div className="flex items-center gap-2">
      <NumberInput
        placeholder="הפקדה לחודש הנוכחי"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-40"
      />
      <Button
        variant="secondary"
        onClick={() => {
          const n = Number(amount)
          if (!Number.isFinite(n)) return
          upsert.mutate({ goalId, monthKey: currentMonthKey(), contributedAmount: n }, { onSuccess: () => setAmount('') })
        }}
      >
        שמירה
      </Button>
    </div>
  )
}
