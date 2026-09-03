import { useEffect, useMemo, useState } from 'react'
import {
  useCalendarEvents,
  useCreateCalendarEvent,
  useDeleteCalendarEvent,
  useUpdateCalendarEvent,
} from './useCalendarEvents'
import { addMonths, currentMonthKey } from '@/lib/month'
import { getLastViewedCalendarMonth, setLastViewedCalendarMonth } from '@/lib/lastViewedMonth'
import { formatMonthLabel, formatMonthOfYear } from '@/lib/format'
import { cn } from '@/lib/cn'
import { ChevronEnd, ChevronStart } from '@/components/ui/icons'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Dialog } from '@/components/ui/Dialog'
import { EVENT_COLORS, eventColorBadgeClasses } from './eventColors'
import type { CalendarEvent } from '@/lib/supabase/queries/calendarEvents'

const WEEKDAY_LABELS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: formatMonthOfYear(i + 1),
}))

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

// null entries pad the grid out to full weeks, before day 1 and after the last day.
function buildWeeks(year: number, month: number): (number | null)[][] {
  const total = daysInMonth(year, month)
  const startOffset = new Date(year, month - 1, 1).getDay()
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

type DialogState = { mode: 'create'; month: number; day: number } | { mode: 'edit'; event: CalendarEvent } | null

function EventDialog({ state, onClose }: { state: DialogState; onClose: () => void }) {
  const createEvent = useCreateCalendarEvent()
  const updateEvent = useUpdateCalendarEvent()
  const deleteEvent = useDeleteCalendarEvent()

  // The parent keys this component by the dialog target, so a fresh instance
  // (and fresh initial state below) mounts every time a different day/event is opened.
  const [title, setTitle] = useState(state?.mode === 'edit' ? state.event.title : '')
  const [notes, setNotes] = useState(state?.mode === 'edit' ? state.event.notes ?? '' : '')
  const [month, setMonth] = useState(String(state ? (state.mode === 'edit' ? state.event.month : state.month) : 1))
  const [day, setDay] = useState(String(state ? (state.mode === 'edit' ? state.event.day : state.day) : 1))
  const [color, setColor] = useState(state?.mode === 'edit' ? state.event.color : EVENT_COLORS[0].value)

  if (!state) return null
  const target = state

  function handleSave() {
    const dayNum = Number(day)
    const monthNum = Number(month)
    if (!title.trim() || !Number.isInteger(dayNum) || dayNum < 1 || dayNum > 31) return
    const patch = { title: title.trim(), month: monthNum, day: dayNum, color, notes: notes.trim() === '' ? null : notes }
    if (target.mode === 'create') {
      createEvent.mutate(patch, { onSuccess: onClose })
    } else {
      updateEvent.mutate({ id: target.event.id, patch }, { onSuccess: onClose })
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()} title={target.mode === 'create' ? 'אירוע חדש' : 'עריכת אירוע'}>
      <div className="flex flex-col gap-3">
        <Input placeholder="שם האירוע" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex gap-2">
          <Select
            value={month}
            onValueChange={setMonth}
            options={MONTH_OPTIONS}
            className="flex-1"
          />
          <Input
            className="w-16"
            type="number"
            min={1}
            max={31}
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
        </div>
        <Input placeholder="הערות" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex items-center gap-2">
          {EVENT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              aria-label={c.value}
              onClick={() => setColor(c.value)}
              className={cn(
                'h-6 w-6 rounded-full',
                c.swatch,
                color === c.value && 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900',
              )}
            />
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          {target.mode === 'edit' ? (
            <Button
              variant="danger"
              onClick={() => deleteEvent.mutate(target.event.id, { onSuccess: onClose })}
            >
              מחיקה
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={handleSave} disabled={!title.trim()}>
            שמירה
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export function CalendarEventsPage() {
  const { data: events = [] } = useCalendarEvents()
  const [viewMonthKey, setViewMonthKey] = useState(getLastViewedCalendarMonth() ?? currentMonthKey())
  const [dialogState, setDialogState] = useState<DialogState>(null)

  useEffect(() => {
    setLastViewedCalendarMonth(viewMonthKey)
  }, [viewMonthKey])

  const [year, month] = viewMonthKey.split('-').map(Number)
  const weeks = useMemo(() => buildWeeks(year, month), [year, month])

  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>()
    for (const event of events) {
      if (event.month !== month) continue
      const list = map.get(event.day) ?? []
      list.push(event)
      map.set(event.day, list)
    }
    return map
  }, [events, month])

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">אירועים חשובים</h2>
        <div className="flex items-center gap-2">
          <button
            aria-label="חודש קודם"
            onClick={() => setViewMonthKey(addMonths(viewMonthKey, -1))}
            className="rounded-md p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronStart className="rtl:scale-x-[-1]" />
          </button>
          <h3 className="min-w-36 text-center text-base font-medium text-gray-900 dark:text-gray-100">
            {formatMonthLabel(viewMonthKey)}
          </h3>
          <button
            aria-label="חודש הבא"
            onClick={() => setViewMonthKey(addMonths(viewMonthKey, 1))}
            className="rounded-md p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronEnd className="rtl:scale-x-[-1]" />
          </button>
          <Button variant="secondary" onClick={() => setViewMonthKey(currentMonthKey())}>
            היום
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="border-b border-gray-200 bg-gray-50 py-1.5 text-center text-xs font-medium text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400"
          >
            {label}
          </div>
        ))}

        {weeks.map((week, weekIdx) =>
          week.map((day, dayIdx) => {
            const dayEvents = day ? eventsByDay.get(day) ?? [] : []
            const isToday = isCurrentMonth && day === today.getDate()
            return (
              <div
                key={`${weekIdx}-${dayIdx}`}
                onClick={() => day && setDialogState({ mode: 'create', month, day })}
                className={cn(
                  'flex min-h-20 flex-col gap-1 border-b border-e border-gray-200 p-1 dark:border-gray-800',
                  day ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-950',
                )}
              >
                {day && (
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full text-xs',
                      isToday
                        ? 'bg-blue-600 font-semibold text-white'
                        : 'text-gray-500 dark:text-gray-400',
                    )}
                  >
                    {day}
                  </span>
                )}
                {dayEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      setDialogState({ mode: 'edit', event })
                    }}
                    className={cn('truncate rounded px-1 py-0.5 text-start text-xs hover:opacity-80', eventColorBadgeClasses(event.color))}
                    title={event.title}
                  >
                    {event.title}
                  </button>
                ))}
              </div>
            )
          }),
        )}
      </div>

      <EventDialog key={dialogState ? JSON.stringify(dialogState) : 'none'} state={dialogState} onClose={() => setDialogState(null)} />
    </div>
  )
}
