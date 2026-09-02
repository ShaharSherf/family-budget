-- Investment-style savings goals (ETF/money-market funds) move with the
-- market independent of what's deposited. Rather than trying to compute
-- market gain/loss in SQL (which needs "carry the last known actual balance
-- forward" logic that's awkward as a pure window function), this just
-- stores the raw reported balance per month; the app derives the market
-- effect and the resolved cumulative balance client-side, where the
-- goal-level data set (well under a few dozen rows per goal) makes that
-- straightforward.

alter table public.savings_contributions
  add column actual_balance_amount numeric(12, 2);

-- Superseded by client-side computation in features/savings-goals/utils.ts —
-- a pure running sum can't represent "this month's real reported balance
-- overrides the running total," which is exactly what actual_balance_amount
-- is for.
drop view if exists public.savings_goal_balances;
