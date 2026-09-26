import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { MonthlyReviewPage } from '@/features/monthly-review/MonthlyReviewPage'
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage'
import { SavingsGoalsPage } from '@/features/savings-goals/SavingsGoalsPage'
import { CategoriesSettingsPage } from '@/features/categories/CategoriesSettingsPage'
import { FamilyMembersSettingsPage } from '@/features/family-members/FamilyMembersSettingsPage'
import { CalendarEventsPage } from '@/features/calendar-events/CalendarEventsPage'
import { currentMonthKey } from '@/lib/month'
import { getLastViewedMonth } from '@/lib/lastViewedMonth'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell><Outlet /></AppShell>}>
        <Route
          path="/"
          element={<Navigate to={`/monthly/${getLastViewedMonth() ?? currentMonthKey()}`} replace />}
        />
        <Route path="/monthly/:month" element={<MonthlyReviewPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/savings-goals" element={<SavingsGoalsPage />} />
        <Route path="/calendar" element={<CalendarEventsPage />} />
        <Route path="/settings/categories" element={<CategoriesSettingsPage />} />
        <Route path="/settings/family-members" element={<FamilyMembersSettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
