import type { ReactNode } from 'react'

export function ChartCard({
  title,
  subtitle,
  isLoading,
  isEmpty,
  children,
}: {
  title: string
  subtitle?: string
  isLoading?: boolean
  isEmpty?: boolean
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {subtitle && <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
      <div className="mt-2">
        {isLoading ? (
          <div className="flex h-56 items-center justify-center text-sm text-gray-400">טוען...</div>
        ) : isEmpty ? (
          <div className="flex h-56 items-center justify-center text-sm text-gray-400">אין מידע להצגה</div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
