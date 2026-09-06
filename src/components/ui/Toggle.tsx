import * as RadixToggle from '@radix-ui/react-toggle'
import { cn } from '@/lib/cn'

interface ToggleProps {
  pressed: boolean
  onPressedChange: (pressed: boolean) => void
  /** Accessible name and hover tooltip — this is a bare switch with no visible text of its own; pair it with your own label if one should show. */
  label: string
  className?: string
}

/** A real sliding switch track. justify-start/end (not left/right) is what
 * keeps the knob on the correct side in RTL without any transform hacks. */
export function Toggle({ pressed, onPressedChange, label, className }: ToggleProps) {
  return (
    <RadixToggle.Root
      pressed={pressed}
      onPressedChange={onPressedChange}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors',
        pressed ? 'justify-end bg-green-600' : 'justify-start bg-red-500 dark:bg-red-600',
        className,
      )}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow" />
    </RadixToggle.Root>
  )
}
