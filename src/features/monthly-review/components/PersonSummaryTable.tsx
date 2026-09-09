import { formatILS } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { PersonTotals } from '../utils'

export function PersonSummaryTable({ people }: { people: PersonTotals[] }) {
  if (people.length === 0) return null

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="w-full text-start text-sm">
        <thead>
          <tr className="text-xs font-medium text-gray-500 dark:text-gray-400">
            <th className="px-2 py-1.5 text-start">בן משפחה</th>
            <th className="px-2 py-1.5 text-start">הרוויח</th>
            <th className="px-2 py-1.5 text-start">שילם</th>
            <th className="px-2 py-1.5 text-start">נטו</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {people.map((person) => (
            <tr key={person.memberId}>
              <td className="px-2 py-1.5 text-gray-900 dark:text-gray-100">{person.name}</td>
              <td className="px-2 py-1.5 text-gray-700 dark:text-gray-300">{formatILS(person.earned)}</td>
              <td className="px-2 py-1.5 text-gray-700 dark:text-gray-300">{formatILS(person.spent)}</td>
              <td
                className={cn(
                  'px-2 py-1.5 font-medium',
                  person.net < 0
                    ? 'text-red-600 dark:text-red-400'
                    : person.net > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400',
                )}
              >
                {formatILS(person.net)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
