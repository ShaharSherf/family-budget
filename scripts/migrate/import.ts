// One-time data migration: run locally only, never in CI, never shipped.
//   npm run migrate
// Requires .env.local (gitignored) with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// EXCEL_FILE_PATH, and FAMILY_MEMBER_1_EMAIL / _2_ / _3_EMAIL (in the same
// column order as the sheet's person columns, i.e. C/D/E — the script prints
// the resolved names before writing anything, so you can confirm the mapping
// is right before it provisions real Supabase Auth accounts).
//
// Uses the service_role key, which bypasses RLS — appropriate for this
// trusted, one-shot, local run. Never bundle this key (or this script) into
// the deployed Vite app.

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../src/lib/supabase/database.types'
import {
  loadWorkbook,
  parseExpenseRows,
  parseIncomeRows,
  parsePersonNames,
  parseSavingsRows,
  type RawLineItem,
} from './parse-workbook'
import {
  ACTUALS_MONTH_KEY,
  ACTUALS_SHEET_NAME,
  LEGACY_PENSION_OPENING_BALANCE,
  PENSION_GOAL_NAME,
  SHEET_NAME_TO_MONTH,
} from './sheet-ranges'

const SUPABASE_URL = requireEnv('SUPABASE_URL')
const SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
const EXCEL_FILE_PATH = process.env.EXCEL_FILE_PATH
  ?? 'C:\\Users\\shahar.s\\Downloads\\תקציב_חודשי_משפחתי_גיליון_אחד (version 1).xlsx'
const MEMBER_EMAILS = [
  requireEnv('FAMILY_MEMBER_1_EMAIL'),
  requireEnv('FAMILY_MEMBER_2_EMAIL'),
  requireEnv('FAMILY_MEMBER_3_EMAIL'),
]

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env var ${name} (set it in .env.local)`)
  return v
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY)

function toMonthDate(monthKey: string): string {
  return `${monthKey}-01`
}

function pctFractionToScale100(fraction: number | null): number {
  if (fraction === null) return 100
  return Math.round(fraction * 100 * 100) / 100
}

async function main() {
  const wb = loadWorkbook(EXCEL_FILE_PATH)
  const augustSheet = wb.Sheets[ACTUALS_SHEET_NAME]
  if (!augustSheet) throw new Error(`Sheet "${ACTUALS_SHEET_NAME}" not found in workbook`)

  const personNames = parsePersonNames(augustSheet)
  console.log('Resolved family member names from sheet header:', personNames)
  console.log('Mapped to emails (in the same order):', MEMBER_EMAILS)

  const augustIncome = parseIncomeRows(augustSheet)
  const augustExpense = parseExpenseRows(augustSheet)
  const augustSavings = parseSavingsRows(augustSheet)

  // ── Step 1+2: categories & details, derived from August's own cell text ──
  // (not hand-typed, to avoid transcribing Hebrew punctuation like geresh/
  // gershayim incorrectly). Layout — including category/detail labels — is
  // identical across all 12 month sheets (verified by spot-check), so
  // August's rows already represent the full canonical set.

  type CategoryKind = 'income' | 'expense'
  const categorySeen = new Map<string, CategoryKind>()
  const detailSeen = new Map<string, Set<string>>() // category -> set of detail names

  for (const row of augustIncome) {
    categorySeen.set(row.categoryRaw, 'income')
    if (!detailSeen.has(row.categoryRaw)) detailSeen.set(row.categoryRaw, new Set())
    detailSeen.get(row.categoryRaw)!.add(row.detailRaw)
  }
  for (const row of augustExpense) {
    categorySeen.set(row.categoryRaw, 'expense')
    if (!detailSeen.has(row.categoryRaw)) detailSeen.set(row.categoryRaw, new Set())
    detailSeen.get(row.categoryRaw)!.add(row.detailRaw)
  }

  const categoryIdByName = new Map<string, string>()
  let sortOrder = 0
  for (const [name, kind] of categorySeen) {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name_he: name, kind, sort_order: sortOrder++ })
      .select('id')
      .single()
    if (error) throw error
    categoryIdByName.set(name, data.id)
  }
  console.log(`Inserted ${categoryIdByName.size} categories.`)

  const detailIdByKey = new Map<string, string>() // `${category}|${detail}` -> id
  for (const [category, details] of detailSeen) {
    const categoryId = categoryIdByName.get(category)!
    let detailSortOrder = 0
    for (const detail of details) {
      const { data, error } = await supabase
        .from('details')
        .insert({ category_id: categoryId, name_he: detail, sort_order: detailSortOrder++ })
        .select('id')
        .single()
      if (error) throw error
      detailIdByKey.set(`${category}|${detail}`, data.id)
    }
  }
  console.log(`Inserted ${detailIdByKey.size} details.`)

  // ── Step 3+4: family members + their Supabase Auth accounts ──────────────

  const familyMemberIds: string[] = []
  for (let i = 0; i < 3; i++) {
    const { data: member, error: memberError } = await supabase
      .from('family_members')
      .insert({ display_name: personNames[i] })
      .select('id')
      .single()
    if (memberError) throw memberError

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: MEMBER_EMAILS[i],
      email_confirm: true,
    })
    if (authError) throw authError

    const { error: linkError } = await supabase
      .from('family_members')
      .update({ auth_user_id: authUser.user.id })
      .eq('id', member.id)
    if (linkError) throw linkError

    const { error: allowError } = await supabase
      .from('allowed_signup_emails')
      .insert({ email: MEMBER_EMAILS[i].toLowerCase() })
    if (allowError) throw allowError

    familyMemberIds.push(member.id)
  }
  console.log('Created 3 family members with linked auth accounts.')

  // ── Step 5: all 12 months, inserted directly (no templates exist yet) ────

  const allMonthKeys: string[] = Object.values(SHEET_NAME_TO_MONTH)
  const { error: monthsError } = await supabase
    .from('months')
    .insert(allMonthKeys.map((mk) => ({ month_key: toMonthDate(mk) })))
  if (monthsError) throw monthsError
  console.log(`Inserted ${allMonthKeys.length} months.`)

  // ── Step 6: August actuals (33 expense + 5 income rows) ──────────────────

  async function importActualRow(row: {
    categoryRaw: string
    detailRaw: string
    person1: number | null
    person2: number | null
    person3: number | null
    total: number | null
    sharePctFraction: number | null
    target: number | null
    notes: string | null
  }) {
    const categoryId = categoryIdByName.get(row.categoryRaw)!
    const detailId = detailIdByKey.get(`${row.categoryRaw}|${row.detailRaw}`)!

    const recomputedActual = (row.person1 ?? 0) + (row.person2 ?? 0) + (row.person3 ?? 0)
    if (row.total !== null && Math.abs(recomputedActual - row.total) > 0.01) {
      console.warn(
        `Mismatch on ${row.categoryRaw}/${row.detailRaw}: sum(person cols)=${recomputedActual} vs sheet total=${row.total}`,
      )
    }

    const { data: line, error: lineError } = await supabase
      .from('budget_lines')
      .insert({
        month_key: toMonthDate(ACTUALS_MONTH_KEY),
        category_id: categoryId,
        detail_id: detailId,
        target_amount: row.target,
        actual_amount: recomputedActual,
        share_pct: pctFractionToScale100(row.sharePctFraction),
        notes: row.notes,
      })
      .select('id')
      .single()
    if (lineError) throw lineError

    const personAmounts = [row.person1, row.person2, row.person3]
    const payments = personAmounts
      .map((amount, i) => ({ familyMemberId: familyMemberIds[i], amount }))
      .filter((p) => p.amount !== null && p.amount > 0)
    if (payments.length > 0) {
      const { error: paymentsError } = await supabase.from('budget_line_payments').insert(
        payments.map((p) => ({
          budget_line_id: line.id,
          family_member_id: p.familyMemberId,
          paid_amount: p.amount!,
        })),
      )
      if (paymentsError) throw paymentsError
    }
  }

  for (const row of [...augustIncome, ...augustExpense]) {
    await importActualRow(row)
  }
  console.log(`Imported ${augustIncome.length + augustExpense.length} August actual lines.`)

  // ── Step 7: budget targets for the other 11 months (actuals left NULL) ──

  for (const [sheetName, monthKey] of Object.entries(SHEET_NAME_TO_MONTH) as [string, string][]) {
    if (monthKey === ACTUALS_MONTH_KEY) continue
    const sheet = wb.Sheets[sheetName]
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found`)

    const income = parseIncomeRows(sheet)
    const expense = parseExpenseRows(sheet)

    const targetRows = [...income, ...expense].map((row) => ({
      month_key: toMonthDate(monthKey),
      category_id: categoryIdByName.get(row.categoryRaw)!,
      detail_id: detailIdByKey.get(`${row.categoryRaw}|${row.detailRaw}`)!,
      target_amount: row.target,
      actual_amount: null,
      share_pct: pctFractionToScale100(row.sharePctFraction),
      notes: row.notes,
    }))

    const { error } = await supabase.from('budget_lines').insert(targetRows)
    if (error) throw error
  }
  console.log('Imported budget targets for the remaining 11 months.')

  // ── Step 8: deliberately skipped — see sheet-ranges.ts header comment ───
  // (B3 stale label, blank reflection rows, the buggy chart-feed pivot).

  // ── Step 9: the orphaned hardcoded pension formula -> a real goal ───────

  const { data: pensionGoal, error: pensionGoalError } = await supabase
    .from('savings_goals')
    .insert({
      name: PENSION_GOAL_NAME,
      notes: 'Opening balance carried over from the legacy spreadsheet, where it was previously a hardcoded formula disconnected from any monthly sheet.',
    })
    .select('id')
    .single()
  if (pensionGoalError) throw pensionGoalError

  const { error: pensionContributionError } = await supabase.from('savings_contributions').insert({
    goal_id: pensionGoal.id,
    month_key: toMonthDate(ACTUALS_MONTH_KEY),
    contributed_amount: LEGACY_PENSION_OPENING_BALANCE,
    notes: 'Legacy opening balance (see goal notes).',
  })
  if (pensionContributionError) throw pensionContributionError
  console.log('Migrated pension into a proper savings_goals row.')

  // ── Step 10: the other 3 savings goals, with August targets/actuals ─────

  for (const goalRow of augustSavings) {
    const { data: goal, error: goalError } = await supabase
      .from('savings_goals')
      .insert({ name: goalRow.name, monthly_target_amount: goalRow.target })
      .select('id')
      .single()
    if (goalError) throw goalError

    const contributed = (goalRow.person1 ?? 0) + (goalRow.person2 ?? 0) + (goalRow.person3 ?? 0)
    if (contributed > 0) {
      const { error: contribError } = await supabase.from('savings_contributions').insert({
        goal_id: goal.id,
        month_key: toMonthDate(ACTUALS_MONTH_KEY),
        contributed_amount: contributed,
      })
      if (contribError) throw contribError
    }
  }
  console.log(`Migrated ${augustSavings.length} savings goals with August contributions.`)

  // ── Step 11: verification — recomputed sums vs the month_kpis view ──────

  const recomputedIncome = augustIncome.reduce(
    (sum: number, r: RawLineItem) => sum + (((r.person1 ?? 0) + (r.person2 ?? 0) + (r.person3 ?? 0)) * pctFractionToScale100(r.sharePctFraction)) / 100,
    0,
  )
  const recomputedExpense = augustExpense.reduce(
    (sum: number, r: RawLineItem) => sum + (((r.person1 ?? 0) + (r.person2 ?? 0) + (r.person3 ?? 0)) * pctFractionToScale100(r.sharePctFraction)) / 100,
    0,
  )

  const { data: kpis, error: kpisError } = await supabase
    .from('month_kpis')
    .select('*')
    .eq('month_key', toMonthDate(ACTUALS_MONTH_KEY))
    .single()
  if (kpisError) throw kpisError

  console.log('Verification for August 2026:')
  console.log(`  income:  recomputed=${recomputedIncome.toFixed(2)}  view=${kpis.income_actual}`)
  console.log(`  expense: recomputed=${recomputedExpense.toFixed(2)}  view=${kpis.expense_actual}`)
  if (Math.abs(recomputedIncome - kpis.income_actual) > 0.5 || Math.abs(recomputedExpense - kpis.expense_actual) > 0.5) {
    console.warn('  MISMATCH — investigate before trusting this migration.')
  } else {
    console.log('  OK — matches.')
  }

  console.log('\nMigration complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
