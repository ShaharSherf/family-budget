import { useState } from 'react'
import { NumberInput } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { currentMonthKey } from '@/lib/month'
import { useUpsertActualBalance, useUpsertContribution } from '../hooks/useSavingsGoals'

export function ContributionForm({ goalId }: { goalId: string }) {
  const [amount, setAmount] = useState('')
  const [actualBalance, setActualBalance] = useState('')
  const upsertContribution = useUpsertContribution()
  const upsertBalance = useUpsertActualBalance()

  return (
    <div className="flex flex-col gap-2">
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
            upsertContribution.mutate(
              { goalId, monthKey: currentMonthKey(), contributedAmount: n },
              { onSuccess: () => setAmount('') },
            )
          }}
        >
          שמירה
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <NumberInput
          placeholder="יתרה נוכחית בפועל (מהבנק/ברוקר)"
          value={actualBalance}
          onChange={(e) => setActualBalance(e.target.value)}
          className="w-40"
        />
        <Button
          variant="secondary"
          onClick={() => {
            const n = Number(actualBalance)
            if (!Number.isFinite(n)) return
            upsertBalance.mutate(
              { goalId, monthKey: currentMonthKey(), actualBalanceAmount: n },
              { onSuccess: () => setActualBalance('') },
            )
          }}
        >
          שמירה
        </Button>
      </div>
    </div>
  )
}
