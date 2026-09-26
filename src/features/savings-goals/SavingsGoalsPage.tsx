import { useState } from 'react'
import { useDebouncedCallback } from '@/lib/useDebouncedCallback'
import {
  useAllContributions,
  useCreateSavingsGoal,
  useSavingsGoals,
  useSavingsPageNotes,
  useUpdateSavingsPageNotes,
} from './hooks/useSavingsGoals'
import { GoalCard } from './components/GoalCard'
import { Input, NumberInput } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PlusIcon } from '@/components/ui/icons'

function PageNotes({ initialNotes }: { initialNotes: string | null }) {
  const updateNotes = useUpdateSavingsPageNotes()
  const [notes, setNotes] = useState(initialNotes ?? '')

  const commitNotes = useDebouncedCallback((value: string) => {
    updateNotes.mutate(value === '' ? null : value)
  }, 500)

  return (
    <textarea
      className="min-h-24 w-full resize-y rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      placeholder="הערות כלליות — מקום לשמור דברים חשובים"
      value={notes}
      onChange={(e) => {
        setNotes(e.target.value)
        commitNotes(e.target.value)
      }}
    />
  )
}

export function SavingsGoalsPage() {
  const { data: goals = [] } = useSavingsGoals()
  const { data: contributions = [] } = useAllContributions()
  const { data: pageNotes } = useSavingsPageNotes()
  const create = useCreateSavingsGoal()

  const [name, setName] = useState('')
  const [monthlyTarget, setMonthlyTarget] = useState('')
  const [lifetimeTarget, setLifetimeTarget] = useState('')

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">יעדי חיסכון</h2>

      {pageNotes !== undefined && <PageNotes initialNotes={pageNotes} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} contributions={contributions.filter((c) => c.goal_id === goal.id)} />
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
        <Input placeholder="שם היעד" value={name} onChange={(e) => setName(e.target.value)} />
        <NumberInput placeholder="יעד חודשי" value={monthlyTarget} onChange={(e) => setMonthlyTarget(e.target.value)} />
        <NumberInput placeholder="יעד כללי" value={lifetimeTarget} onChange={(e) => setLifetimeTarget(e.target.value)} />
        <Button
          title="הוספת יעד"
          aria-label="הוספת יעד"
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
          <PlusIcon />
        </Button>
      </div>
    </div>
  )
}
