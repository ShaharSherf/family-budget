-- Savings goals can have money already saved before monthly tracking began
-- (the spreadsheet's מצטבר sheet tracked this separately as "ראשוני" per
-- goal). This was previously only handled as a one-off hack for the pension
-- goal (an opening-balance contribution row); this adds a real column so
-- every goal can carry a pre-tracking balance without needing a synthetic
-- month or a contribution row that isn't really "this month's deposit".

alter table public.savings_goals
  add column opening_balance_amount numeric(12, 2) not null default 0
    check (opening_balance_amount >= 0);

create or replace view public.savings_goal_balances
  with (security_invoker = true) as
select
  sc.goal_id,
  sc.month_key,
  sc.contributed_amount,
  sg.opening_balance_amount + sum(sc.contributed_amount) over (
    partition by sc.goal_id order by sc.month_key
  ) as cumulative_balance
from public.savings_contributions sc
join public.savings_goals sg on sg.id = sc.goal_id;
