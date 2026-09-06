-- Some goals (e.g. index/money-market funds) don't have a real final target
-- — the point is just to keep growing. "interval" mode replaces the fixed
-- lifetime_target_amount with a step size: the effective target is always
-- the next unreached multiple of that step above the current balance, so
-- the goal card quietly re-targets itself once each milestone is passed
-- instead of showing a wall of future milestones.

alter table public.savings_goals
  add column target_mode text not null default 'fixed'
    check (target_mode in ('fixed', 'interval')),
  add column interval_step_amount numeric(12, 2)
    check (interval_step_amount is null or interval_step_amount > 0);
