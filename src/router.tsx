import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { LoginPage } from '@/features/auth/LoginPage'
import { MonthlyReviewPage } from '@/features/monthly-review/MonthlyReviewPage'
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage'
import { SavingsGoalsPage } from '@/features/savings-goals/SavingsGoalsPage'
import { CategoriesSettingsPage } from '@/features/categories/CategoriesSettingsPage'
import { FamilyMembersSettingsPage } from '@/features/family-members/FamilyMembersSettingsPage'
import { RecurringTemplatesPage } from '@/features/recurring-templates/RecurringTemplatesPage'
import { currentMonthKey } from '@/lib/month'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to={`/monthly/${currentMonthKey()}`} replace />} />
        <Route path="/monthly/:month" element={<MonthlyReviewPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/savings-goals" element={<SavingsGoalsPage />} />
        <Route path="/settings/categories" element={<CategoriesSettingsPage />} />
        <Route path="/settings/family-members" element={<FamilyMembersSettingsPage />} />
        <Route path="/settings/recurring-templates" element={<RecurringTemplatesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
