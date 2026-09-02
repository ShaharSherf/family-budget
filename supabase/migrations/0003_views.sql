-- Rollup views: replace the spreadsheet's buggy chart-feed pivot and the
-- orphaned hardcoded pension formula. No triggers/edge functions — the
-- monthly review and analytics pages read these directly, and over/under
-- budget coloring is computed client-side off them (visual-only, no
-- notification infrastructure).

create view public.category_actuals as
select
  bl.month_key,
  c.id as category_id,
  c.name_he,
  c.kind,
  sum(bl.family_actual_amount) as actual_total,
  sum(bl.target_amount)        as target_total
from public.budget_lines bl
join public.categories c on c.id = bl.category_id
group by bl.month_key, c.id, c.name_he, c.kind;

create view public.month_kpis as
select
  m.month_key,
  coalesce(sum(bl.family_actual_amount) filter (where c.kind = 'income'), 0)  as income_actual,
  coalesce(sum(bl.target_amount)        filter (where c.kind = 'income'), 0)  as income_target,
  coalesce(sum(bl.family_actual_amount) filter (where c.kind = 'expense'), 0) as expense_actual,
  coalesce(sum(bl.target_amount)        filter (where c.kind = 'expense'), 0) as expense_target,
  (coalesce(sum(bl.family_actual_amount) filter (where c.kind = 'income'), 0)
   - coalesce(sum(bl.family_actual_amount) filter (where c.kind = 'expense'), 0)) as leftover_actual
from public.months m
left join public.budget_lines bl on bl.month_key = m.month_key
left join public.categories c on c.id = bl.category_id
group by m.month_key;

-- Running balance as a view, never a mutable stored total — can't drift.
create view public.savings_goal_balances as
select
  sc.goal_id,
  sc.month_key,
  sc.contributed_amount,
  sum(sc.contributed_amount) over (
    partition by sc.goal_id order by sc.month_key
  ) as cumulative_balance
from public.savings_contributions sc;

alter view public.category_actuals set (security_invoker = true);
alter view public.month_kpis set (security_invoker = true);
alter view public.savings_goal_balances set (security_invoker = true);
