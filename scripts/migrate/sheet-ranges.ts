// Hardcoded cell ranges for the source workbook, verified by direct inspection
// (see conversation history — exact row/column addresses were confirmed
// against the "אוגוסט 26" sheet and spot-checked against "יולי 27").
//
// Deliberately NOT parsed from the sheet: the `B3` label cell on every month
// sheet (a copy-paste bug — every sheet, including July 2027, says "אוגוסט
// 2026"), the reflection-prompt rows (~69–74, unused feature, dropped), and
// the chart-feed rollup pivot (cols P–R, ~76–88 — confirmed buggy/incomplete
// in 2 of 12 categories, not authoritative).

/**
 * Sheet name -> "YYYY-MM" month key. Note the exact stray leading space on
 * the September sheet name — this is a real bug in the source file's tab
 * name (confirmed via JSON.stringify on the live workbook), not a typo here.
 */
export const SHEET_NAME_TO_MONTH: Record<string, string> = {
  'אוגוסט 26': '2026-08',
  ' ספטמבר 26': '2026-09',
  'אוקטובר 26': '2026-10',
  'נובמבר 26': '2026-11',
  'דצמבר 26': '2026-12',
  'ינואר 27': '2027-01',
  'פברואר 27': '2027-02',
  'מרץ 27': '2027-03',
  'אפריל 27': '2027-04',
  'מאי 27': '2027-05',
  'יוני 27': '2027-06',
  'יולי 27': '2027-07',
}

/** The one sheet with real actual transaction data (not just budget targets). */
export const ACTUALS_MONTH_KEY = '2026-08'
export const ACTUALS_SHEET_NAME = 'אוגוסט 26'

// Layout is identical across all 12 month sheets (verified by spot-checking
// "יולי 27" against "אוגוסט 26" — same header rows, same columns, same
// category/detail labels; only the values differ).

export const INCOME_TABLE = {
  headerRow: 14,
  firstDataRow: 15,
  lastDataRow: 19,
  cols: {
    category: 'A',
    detail: 'B',
    person1: 'C',
    person2: 'D',
    person3: 'E',
    total: 'F',
    sharePct: 'G',
    familyActual: 'H',
    target: 'I', // מתוכנן
    notes: 'K',
  },
} as const

export const EXPENSE_TABLE = {
  headerRow: 24,
  firstDataRow: 25,
  lastDataRow: 57,
  cols: {
    category: 'A',
    detail: 'B',
    person1: 'C',
    person2: 'D',
    person3: 'E',
    total: 'F', // סה"כ ששולם
    sharePct: 'G',
    familyActual: 'H', // הוצאה משפחתית
    target: 'I', // תקציב
    notes: 'K', // סוג / הערה
  },
} as const

/** Row -> savings goal name, on the savings-goals mini-table (header row 62). */
export const SAVINGS_TABLE = {
  headerRow: 62,
  rows: {
    'קרן סל': 63,
    'קרן כספית': 64,
    'קרן תינוק': 65,
  },
  cols: {
    person1: 'C',
    person2: 'D',
    person3: 'E',
    total: 'F',
    sharePct: 'G',
    familyActual: 'H',
    target: 'I',
    notes: 'K',
  },
} as const

/**
 * The מצטבר (cumulative summary) sheet hardcodes the pension figure as
 * `=SUM(4172,110749)` — completely disconnected from any monthly sheet.
 * We don't parse that formula; its evaluated result is baked in here once,
 * and turned into one clean opening-balance savings_contributions row
 * (see import.ts step 9) instead of perpetuating the disconnected hack.
 */
export const LEGACY_PENSION_OPENING_BALANCE = 114921
export const PENSION_GOAL_NAME = 'פנסיה'
