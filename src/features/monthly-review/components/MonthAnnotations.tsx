import { useState } from 'react'
import { useFamilyMembers } from '@/features/family-members/useFamilyMembers'
import { useDebouncedCallback } from '@/lib/useDebouncedCallback'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useSetMonthNotes } from '../hooks/useMonth'

export function MonthAnnotations({
  monthKey,
  notes: initialNotes,
  readOnly,
}: {
  monthKey: string
  notes: string | null
  readOnly: boolean
}) {
  const { data: members = [] } = useFamilyMembers()
  const setNotes = useSetMonthNotes(monthKey)
  const [notes, setNotesState] = useState(initialNotes ?? '')

  const commitNotes = useDebouncedCallback((value: string) => {
    setNotes.mutate(value)
  }, 500)

  const monthOfYear = Number(monthKey.split('-')[1])
  const birthdays = members.filter((m) => m.is_active && m.birthday_month === monthOfYear)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {birthdays.map((member) => (
        <Badge key={member.id} tone="success">
          🎂 יומולדת {member.display_name}
        </Badge>
      ))}
      <Input
        className="min-w-56 flex-1"
        placeholder="הערות לחודש (ESPP, שינוי אחוז וכו׳)"
        value={notes}
        disabled={readOnly}
        onChange={(e) => {
          setNotesState(e.target.value)
          commitNotes(e.target.value)
        }}
      />
    </div>
  )
}
