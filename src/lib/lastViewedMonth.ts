// Remembers which month the user was last looking at (per-browser, via
// localStorage) so navigating away to another tab and back — or reopening
// the app — returns to that month instead of always snapping to today's.

const STORAGE_KEY = 'family-budget:lastViewedMonth'

export function getLastViewedMonth(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function setLastViewedMonth(monthKey: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, monthKey)
  } catch {
    // Storage can be unavailable (private browsing, quota) — losing this
    // preference isn't worth failing over.
  }
}
