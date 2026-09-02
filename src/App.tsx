import { QueryClientProvider } from '@tanstack/react-query'
import { DirectionProvider } from '@radix-ui/react-direction'
import { HashRouter } from 'react-router-dom'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/lib/auth/AuthProvider'
import { AppRouter } from './router'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DirectionProvider dir="rtl">
        <AuthProvider>
          <HashRouter>
            <AppRouter />
          </HashRouter>
        </AuthProvider>
      </DirectionProvider>
    </QueryClientProvider>
  )
}
