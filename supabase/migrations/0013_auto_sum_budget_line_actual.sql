-- Filling in each person's share in budget_line_payments should compute the
-- line's actual_amount by itself, instead of also having to type the total
-- separately. Safe to fire on every payments change: budget_line_payments
-- rows only ever exist because a person actually typed an amount there (no
-- auto-generated default-payment rows since the recurring-templates feature
-- was removed in 0007), so this never clobbers a manually-typed total on a
-- line nobody has broken down per-person.

create or replace function public.sync_budget_line_actual_from_payments()
returns trigger language plpgsql as $$
declare
  v_budget_line_id uuid := coalesce(new.budget_line_id, old.budget_line_id);
  v_total numeric(12, 2);
begin
  select coalesce(sum(paid_amount), 0) into v_total
  from public.budget_line_payments
  where budget_line_id = v_budget_line_id;

  update public.budget_lines
  set actual_amount = v_total
  where id = v_budget_line_id;

  return coalesce(new, old);
end;
$$;

create trigger trg_sync_budget_line_actual
after insert or update or delete on public.budget_line_payments
for each row execute function public.sync_budget_line_actual_from_payments();
