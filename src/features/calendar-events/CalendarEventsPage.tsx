import { useState } from 'react'
import {
  useCalendarEvents,
  useCreateCalendarEvent,
  useDeleteCalendarEvent,
  useUpdateCalendarEvent,
} from './useCalendarEvents'
import { useDebouncedCallback } from '@/lib/useDebouncedCallback'
import { formatMonthOfYear } from '@/lib/format'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import type { CalendarEvent } from '@/lib/supabase/queries/calendarEvents'

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: formatMonthOfYear(i + 1),
}))

// Events carry only month+day (no year) — they repeat every year, so "next
// occurrence" rolls over to next year once this year's date has passed.
function daysUntilNextOccurrence(month: number, day: number): number {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let next = new Date(today.getFullYear(), month - 1, day)
  if (next < today) next = new Date(today.getFullYear() + 1, month - 1, day)
  return Math.round((next.getTime() - today.getTime()) / 86_400_000)
}

function EventRow({ event }: { event: CalendarEvent }) {
  const updateEvent = useUpdateCalendarEvent()
  const deleteEvent = useDeleteCalendarEvent()
  const [title, setTitle] = useState(event.title)
  const [notes, setNotes] = useState(event.notes ?? '')

  const commitTitle = useDebouncedCallback((value: string) => {
    if (!value.trim() || value === event.title) return
    updateEvent.mutate({ id: event.id, patch: { title: value.trim() } })
  }, 500)

  const commitNotes = useDebouncedCallback((value: string) => {
    updateEvent.mutate({ id: event.id, patch: { notes: value.trim() === '' ? null : value } })
  }, 500)

  const daysUntil = daysUntilNextOccurrence(event.month, event.day)

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
      <span className="w-28 shrink-0 text-sm text-gray-500 dark:text-gray-400">
        {event.day} ב{formatMonthOfYear(event.month)}
      </span>
      <Input
        className="w-40"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value)
          commitTitle(e.target.value)
        }}
      />
      <Input
        className="min-w-40 flex-1"
        placeholder="הערות"
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value)
          commitNotes(e.target.value)
        }}
      />
      <span className="whitespace-nowrap text-xs text-gray-400 dark:text-gray-500">
        {daysUntil === 0 ? 'היום!' : `בעוד ${daysUntil} ימים`}
      </span>
      <Button variant="ghost" onClick={() => deleteEvent.mutate(event.id)}>
        מחיקה
      </Button>
    </div>
  )
}

export function CalendarEventsPage() {
  const { data: events = [] } = useCalendarEvents()
  const createEvent = useCreateCalendarEvent()
  const [newTitle, setNewTitle] = useState('')
  const [newMonth, setNewMonth] = useState('1')
  const [newDay, setNewDay] = useState('')

  const sorted = [...events].sort(
    (a, b) => daysUntilNextOccurrence(a.month, a.day) - daysUntilNextOccurrence(b.month, b.day),
  )

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">אירועים חשובים</h2>

      <div className="flex flex-col gap-2">
        {sorted.map((event) => (
          <EventRow key={event.id} event={event} />
        ))}
        {sorted.length === 0 && <p className="text-sm text-gray-400">אין אירועים עדיין</p>}
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
        <Input placeholder="שם האירוע" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        <Select value={newMonth} onValueChange={setNewMonth} options={MONTH_OPTIONS} />
        <Input
          className="w-16"
          type="number"
          min={1}
          max={31}
          placeholder="יום"
          value={newDay}
          onChange={(e) => setNewDay(e.target.value)}
        />
        <Button
          onClick={() => {
            const day = Number(newDay)
            if (!newTitle.trim() || !Number.isInteger(day) || day < 1 || day > 31) return
            createEvent.mutate({ title: newTitle.trim(), month: Number(newMonth), day })
            setNewTitle('')
            setNewDay('')
          }}
        >
          הוספה
        </Button>
      </div>
    </div>
  )
}
