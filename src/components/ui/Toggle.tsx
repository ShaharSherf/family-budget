import * as RadixToggle from '@radix-ui/react-toggle'
import { LockIcon } from './icons'
import { cn } from '@/lib/cn'

interface ToggleProps {
  pressed: boolean
  onPressedChange: (pressed: boolean) => void
  label: string
  className?: string
}

export function Toggle({ pressed, onPressedChange, label, className }: ToggleProps) {
  return (
    <RadixToggle.Root
      pressed={pressed}
      onPressedChange={onPressedChange}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm font-medium transition-colors',
        pressed
          ? 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300',
        className,
      )}
    >
      {pressed && <LockIcon />}
      {label}
    </RadixToggle.Root>
  )
}
