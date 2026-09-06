import type { Tables } from '@/lib/supabase/database.types'

export interface GoalMonthBalance {
  monthKey: string
  contributedAmount: number
  /** The fund's actual reported balance that month, if entered. */
  actualBalanceAmount: number | null
  /** Resolved balance for the month: the actual reported figure when known, otherwise carried forward from the previous month plus this month's deposit. */
  cumulativeBalance: number
  /**
   * This month's gain/loss not explained by the deposit — only known for
   * months where an actual balance was entered (otherwise we have no way
   * to tell deposit and market movement apart, so it's null, not zero).
   */
  marketReturnAmount: number | null
}

/**
 * Resolves each month's true balance and implied market return from raw
 * (deposit, actual-balance-if-known) entries. A month's actual reported
 * balance is ground truth and overrides the running total; without one,
 * the balance is just carried forward (previous + this month's deposit),
 * with market return left unknown for that month rather than assumed zero.
 */
/**
 * A "nice" round step size derived from the balance's own order of
 * magnitude (the 1-2-5-10 ladder used for chart tick spacing) — e.g. ~213k
 * gets 200k steps, ~1.3M gets 1M steps. Scales itself up as the balance
 * grows, so a "just keep growing" goal never needs a manually-chosen step.
 */
function niceStep(value: number): number {
  if (value <= 0) return 100_000
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const niceMultiplier = normalized < 2 ? 1 : normalized < 5 ? 2 : 5
  return niceMultiplier * magnitude
}

/** The next unreached milestone above `currentBalance`, on an auto-scaling round-number ladder. */
export function nextIntervalMilestone(currentBalance: number): number {
  const step = niceStep(Math.max(currentBalance, 1))
  return (Math.floor(currentBalance / step) + 1) * step
}

export function computeGoalMonthBalances(
  openingBalance: number,
  contributions: Tables<'savings_contributions'>[],
): GoalMonthBalance[] {
  const sorted = [...contributions].sort((a, b) => a.month_key.localeCompare(b.month_key))

  let running = openingBalance
  return sorted.map((c) => {
    const carriedForward = running + c.contributed_amount
    const cumulativeBalance = c.actual_balance_amount ?? carriedForward
    const marketReturnAmount = c.actual_balance_amount !== null ? c.actual_balance_amount - carriedForward : null
    running = cumulativeBalance
    return {
      monthKey: c.month_key,
      contributedAmount: c.contributed_amount,
      actualBalanceAmount: c.actual_balance_amount,
      cumulativeBalance,
      marketReturnAmount,
    }
  })
}
