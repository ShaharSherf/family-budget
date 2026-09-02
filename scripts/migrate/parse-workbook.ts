import XLSX from 'xlsx'
import { EXPENSE_TABLE, INCOME_TABLE, SAVINGS_TABLE } from './sheet-ranges'

export interface RawLineItem {
  row: number
  categoryRaw: string
  detailRaw: string
  person1: number | null
  person2: number | null
  person3: number | null
  total: number | null
  /** Decimal fraction as stored (1 = 100%), not yet scaled to 0-100. */
  sharePctFraction: number | null
  familyActual: number | null
  target: number | null
  notes: string | null
}

export interface RawSavingsRow {
  name: string
  row: number
  person1: number | null
  person2: number | null
  person3: number | null
  total: number | null
  sharePctFraction: number | null
  familyActual: number | null
  target: number | null
  notes: string | null
}

function cellNum(sheet: XLSX.WorkSheet, addr: string): number | null {
  const cell = sheet[addr]
  if (!cell || cell.v === undefined || cell.v === null || cell.v === '') return null
  const n = Number(cell.v)
  return Number.isFinite(n) ? n : null
}

function cellStr(sheet: XLSX.WorkSheet, addr: string): string {
  const cell = sheet[addr]
  if (!cell || cell.v === undefined || cell.v === null) return ''
  return String(cell.v).trim()
}

export function loadWorkbook(filePath: string): XLSX.WorkBook {
  return XLSX.readFile(filePath)
}

/** Person display names, read from the sheet's own header cells (not hand-typed, to avoid transcribing Hebrew punctuation wrong). */
export function parsePersonNames(sheet: XLSX.WorkSheet): [string, string, string] {
  const { headerRow, cols } = INCOME_TABLE
  return [
    cellStr(sheet, `${cols.person1}${headerRow}`),
    cellStr(sheet, `${cols.person2}${headerRow}`),
    cellStr(sheet, `${cols.person3}${headerRow}`),
  ]
}

function parseRows(
  sheet: XLSX.WorkSheet,
  table: typeof INCOME_TABLE | typeof EXPENSE_TABLE,
): RawLineItem[] {
  const rows: RawLineItem[] = []
  for (let r = table.firstDataRow; r <= table.lastDataRow; r++) {
    rows.push({
      row: r,
      categoryRaw: cellStr(sheet, `${table.cols.category}${r}`),
      detailRaw: cellStr(sheet, `${table.cols.detail}${r}`),
      person1: cellNum(sheet, `${table.cols.person1}${r}`),
      person2: cellNum(sheet, `${table.cols.person2}${r}`),
      person3: cellNum(sheet, `${table.cols.person3}${r}`),
      total: cellNum(sheet, `${table.cols.total}${r}`),
      sharePctFraction: cellNum(sheet, `${table.cols.sharePct}${r}`),
      familyActual: cellNum(sheet, `${table.cols.familyActual}${r}`),
      target: cellNum(sheet, `${table.cols.target}${r}`),
      notes: cellStr(sheet, `${table.cols.notes}${r}`) || null,
    })
  }
  return rows
}

export function parseIncomeRows(sheet: XLSX.WorkSheet): RawLineItem[] {
  return parseRows(sheet, INCOME_TABLE)
}

export function parseExpenseRows(sheet: XLSX.WorkSheet): RawLineItem[] {
  return parseRows(sheet, EXPENSE_TABLE)
}

export function parseSavingsRows(sheet: XLSX.WorkSheet): RawSavingsRow[] {
  const { cols, rows } = SAVINGS_TABLE
  return (Object.entries(rows) as [string, number][]).map(([name, row]) => ({
    name,
    row,
    person1: cellNum(sheet, `${cols.person1}${row}`),
    person2: cellNum(sheet, `${cols.person2}${row}`),
    person3: cellNum(sheet, `${cols.person3}${row}`),
    total: cellNum(sheet, `${cols.total}${row}`),
    sharePctFraction: cellNum(sheet, `${cols.sharePct}${row}`),
    familyActual: cellNum(sheet, `${cols.familyActual}${row}`),
    target: cellNum(sheet, `${cols.target}${row}`),
    notes: cellStr(sheet, `${cols.notes}${row}`) || null,
  }))
}
