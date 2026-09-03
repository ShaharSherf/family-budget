// Per-browser on/off preference for the decorative cat background (see
// CatBackground.tsx). Lives outside React state since the toggle button
// (in AppShell, only rendered once logged in) and the background layer
// itself (rendered once at the app root, shown on the login page too)
// aren't in a parent/child relationship — a tiny external store keeps
// them in sync without threading state through the router.
import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'family-budget:catBackgroundEnabled'
const listeners = new Set<() => void>()

function readStoredPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

let enabled = readStoredPreference()

function getSnapshot(): boolean {
  return enabled
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setCatBackgroundEnabled(next: boolean): void {
  enabled = next
  try {
    localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off')
  } catch {
    // Storage can be unavailable (private browsing, quota) — the toggle
    // still works for the rest of the session, just doesn't persist.
  }
  listeners.forEach((listener) => listener())
}

export function useCatBackgroundEnabled(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot)
}
