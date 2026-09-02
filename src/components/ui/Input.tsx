import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Input({ className, title, value, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  // If the value is longer than the box, hovering shows the full text via
  // the native tooltip — unless the caller passed its own title.
  const resolvedTitle = title ?? (typeof value === 'string' || typeof value === 'number' ? String(value) : undefined)

  return (
    <input
      className={cn(
        'rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
        className,
      )}
      title={resolvedTitle}
      value={value}
      {...props}
    />
  )
}

export function NumberInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      type="number"
      inputMode="decimal"
      dir="ltr"
      className={cn('text-end', className)}
      {...props}
    />
  )
}
