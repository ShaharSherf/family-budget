import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    // shouldCreateUser: false — invite-only, no public self-signup even if
    // this client call were somehow bypassed (the DB-level "Before User
    // Created" auth hook is the real backstop, see supabase/migrations).
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + import.meta.env.BASE_URL,
        shouldCreateUser: false,
      },
    })
    // Generic response regardless of whether the email matches a real
    // account, to avoid account enumeration.
    setStatus('sent')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="mb-1 text-xl font-bold text-gray-900 dark:text-gray-100">תקציב המשפחה</h1>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">התחברות באמצעות קישור למייל</p>

        {status === 'sent' ? (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            בדקו את תיבת המייל שלכם — שלחנו קישור התחברות אם הכתובת מוכרת למערכת.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              type="email"
              dir="ltr"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'שולח...' : 'שלח קישור התחברות'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
