import { useState, type ChangeEvent, type InputHTMLAttributes } from 'react'
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

// Inserts thousand separators into the integer part only (e.g. "1234.5" -> "1,234.5").
function formatThousands(raw: string): string {
  if (raw === '' || raw === '-') return raw
  const negative = raw.startsWith('-')
  const [intPart, decPart] = (negative ? raw.slice(1) : raw).split('.')
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const sign = negative ? '-' : ''
  return decPart !== undefined ? `${sign}${withCommas}.${decPart}` : `${sign}${withCommas}`
}

export function NumberInput({ className, value, onFocus, onBlur, onChange, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [isFocused, setIsFocused] = useState(false)
  const rawValue = value == null ? '' : String(value)
  // While focused, show the raw digits so typing/editing isn't fought by
  // live reformatting; format with commas only once the field is blurred.
  const displayValue = isFocused ? rawValue : formatThousands(rawValue)

  return (
    <Input
      type="text"
      inputMode="decimal"
      dir="ltr"
      className={cn('text-end', className)}
      value={displayValue}
      onFocus={(e) => {
        setIsFocused(true)
        onFocus?.(e)
      }}
      onBlur={(e) => {
        setIsFocused(false)
        onBlur?.(e)
      }}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        // Strip any commas before forwarding, so every existing consumer's
        // `Number(e.target.value)` parsing keeps working unchanged.
        e.target.value = e.target.value.replace(/,/g, '')
        onChange?.(e)
      }}
      {...props}
    />
  )
}
