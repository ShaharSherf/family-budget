import * as RadixDialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import { XIcon } from './icons'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
}

export function Dialog({ open, onOpenChange, title, children }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <RadixDialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between gap-2">
              <RadixDialog.Title className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </RadixDialog.Title>
              <RadixDialog.Close
                aria-label="סגירה"
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                <XIcon />
              </RadixDialog.Close>
            </div>
            {children}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
