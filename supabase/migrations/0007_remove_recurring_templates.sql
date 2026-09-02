-- The recurring-templates feature is removed (never actually used - no
-- template rows were ever created). Drop the columns/tables that only
-- existed to serve it, and simplify create_month() to just ensure the
-- month row exists.

alter table public.budget_lines drop column if exists template_id;
alter table public.budget_lines drop column if exists is_template_override;
alter table public.budget_lines drop column if exists needs_review;

drop table if exists public.recurring_template_default_payments;
drop table if exists public.recurring_templates;

create or replace function public.create_month(p_month_key date)
returns void language plpgsql
security invoker
as $$
begin
  insert into public.months (month_key)
  values (date_trunc('month', p_month_key)::date)
  on conflict (month_key) do nothing;
end;
$$;
