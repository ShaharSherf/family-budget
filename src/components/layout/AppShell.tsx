import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { currentMonthKey } from '@/lib/month'
import { getLastViewedMonth } from '@/lib/lastViewedMonth'
import { cn } from '@/lib/cn'

const STATIC_NAV_ITEMS = [
  { to: '/analytics', label: 'ניתוח ומגמות', match: '/analytics' },
  { to: '/savings-goals', label: 'יעדי חיסכון', match: '/savings-goals' },
  { to: '/settings/recurring-templates', label: 'הוצאות קבועות', match: '/settings/recurring-templates' },
  { to: '/settings/categories', label: 'קטגוריות', match: '/settings/categories' },
  { to: '/settings/family-members', label: 'בני משפחה', match: '/settings/family-members' },
]

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">תקציב המשפחה</h1>
          <nav className="flex flex-wrap gap-1">
            <NavLink
              to="/monthly"
              onClick={(e) => {
                // Computed at the moment of the click, not at some earlier
                // render — a stale computed href here is exactly what sent
                // this back to the wrong month before.
                e.preventDefault()
                navigate(`/monthly/${getLastViewedMonth() ?? currentMonthKey()}`)
              }}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive || location.hash.includes('/monthly')
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
                )
              }
            >
              סקירה חודשית
            </NavLink>
            {STATIC_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.match}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive || location.hash.includes(item.match)
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            התנתקות
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  )
}
