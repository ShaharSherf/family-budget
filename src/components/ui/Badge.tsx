import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface BadgeProps {
  children: ReactNode
  tone?: 'neutral' | 'warning' | 'danger' | 'success'
  className?: string
}

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', toneClasses[tone], className)}>
      {children}
    </span>
  )
}
