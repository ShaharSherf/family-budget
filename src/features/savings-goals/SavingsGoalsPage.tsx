import { useState } from 'react'
import { useAllSavingsGoalBalances, useCreateSavingsGoal, useSavingsGoals } from './hooks/useSavingsGoals'
import { GoalCard } from './components/GoalCard'
import { Input, NumberInput } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function SavingsGoalsPage() {
  const { data: goals = [] } = useSavingsGoals()
  const { data: balances = [] } = useAllSavingsGoalBalances()
  const create = useCreateSavingsGoal()

  const [name, setName] = useState('')
  const [monthlyTarget, setMonthlyTarget] = useState('')
  const [lifetimeTarget, setLifetimeTarget] = useState('')

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">יעדי חיסכון</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} balances={balances.filter((b) => b.goal_id === goal.id)} />
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
        <Input placeholder="שם היעד" value={name} onChange={(e) => setName(e.target.value)} />
        <NumberInput placeholder="יעד חודשי" value={monthlyTarget} onChange={(e) => setMonthlyTarget(e.target.value)} />
        <NumberInput placeholder="יעד כללי" value={lifetimeTarget} onChange={(e) => setLifetimeTarget(e.target.value)} />
        <Button
          onClick={() => {
            if (!name.trim()) return
            create.mutate({
              name: name.trim(),
              monthly_target_amount: monthlyTarget ? Number(monthlyTarget) : null,
              lifetime_target_amount: lifetimeTarget ? Number(lifetimeTarget) : null,
            })
            setName('')
            setMonthlyTarget('')
            setLifetimeTarget('')
          }}
        >
          הוספת יעד
        </Button>
      </div>
    </div>
  )
}
