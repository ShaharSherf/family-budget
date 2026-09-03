// Remembers which month the user was last looking at (per-browser, via
// localStorage) so navigating away to another tab and back — or reopening
// the app — returns to that month instead of always snapping to today's.

function getStored(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function setStored(key: string, monthKey: string): void {
  try {
    localStorage.setItem(key, monthKey)
  } catch {
    // Storage can be unavailable (private browsing, quota) — losing this
    // preference isn't worth failing over.
  }
}

const MONTHLY_REVIEW_KEY = 'family-budget:lastViewedMonth'

export function getLastViewedMonth(): string | null {
  return getStored(MONTHLY_REVIEW_KEY)
}

export function setLastViewedMonth(monthKey: string): void {
  setStored(MONTHLY_REVIEW_KEY, monthKey)
}

const CALENDAR_KEY = 'family-budget:lastViewedCalendarMonth'

export function getLastViewedCalendarMonth(): string | null {
  return getStored(CALENDAR_KEY)
}

export function setLastViewedCalendarMonth(monthKey: string): void {
  setStored(CALENDAR_KEY, monthKey)
}
