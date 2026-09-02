import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { currentMonthKey } from '@/lib/month'
import { getLastViewedMonth } from '@/lib/lastViewedMonth'
import { cn } from '@/lib/cn'

export function AppShell({ children }: { children: ReactNode }) {
  // Computed per render (not module-level) so it reflects whichever month
  // was last viewed, not just whatever month it was when the app loaded.
  const navItems = [
    { to: `/monthly/${getLastViewedMonth() ?? currentMonthKey()}`, label: 'סקירה חודשית', match: '/monthly' },
    { to: '/analytics', label: 'ניתוח ומגמות', match: '/analytics' },
    { to: '/savings-goals', label: 'יעדי חיסכון', match: '/savings-goals' },
    { to: '/settings/recurring-templates', label: 'הוצאות קבועות', match: '/settings/recurring-templates' },
    { to: '/settings/categories', label: 'קטגוריות', match: '/settings/categories' },
    { to: '/settings/family-members', label: 'בני משפחה', match: '/settings/family-members' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">תקציב המשפחה</h1>
          <nav className="flex flex-wrap gap-1">
            {navItems.map((item) => (
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
