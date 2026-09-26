import { formatILS } from '@/lib/format'
import type { AdamDebtCategoryTotal } from '../utils'

export function AdamDebtSection({ items }: { items: AdamDebtCategoryTotal[] }) {
  if (items.length === 0) return null
  const total = items.reduce((sum, i) => sum + i.owed, 0)

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="px-2 py-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200">מה אדם חייב לנו</div>
      <table className="w-full text-start">
        <thead>
          <tr>
            <th className="px-2 py-1.5 text-start text-xs font-medium text-gray-500 dark:text-gray-400">קטגוריה</th>
            <th className="px-2 py-1.5 text-start text-xs font-medium text-gray-500 dark:text-gray-400">אדם חייב</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {items.map((item) => (
            <tr key={item.categoryId}>
              <td className="px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100">{item.categoryName}</td>
              <td className="px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300">{formatILS(item.owed)}</td>
            </tr>
          ))}
          <tr className="bg-gray-100 dark:bg-gray-800/60">
            <td className="px-2 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200">סה"כ</td>
            <td className="px-2 py-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{formatILS(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
