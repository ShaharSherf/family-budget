-- Functions & triggers: category/detail consistency, month immutability,
-- month generation from templates, month-lock enforcement, household membership.

-- A detail must belong to the category it's paired with on the same row.
create or replace function public.check_category_detail_match()
returns trigger language plpgsql as $$
declare v_cat uuid;
begin
  select category_id into v_cat from public.details where id = new.detail_id;
  if v_cat is distinct from new.category_id then
    raise exception 'detail % does not belong to category %', new.detail_id, new.category_id;
  end if;
  return new;
end;
$$;

create trigger trg_template_cat_detail
before insert or update on public.recurring_templates
for each row execute function public.check_category_detail_match();

create trigger trg_budget_line_cat_detail
before insert or update on public.budget_lines
for each row execute function public.check_category_detail_match();

-- A budget line can't be moved to a different month after creation.
create or replace function public.forbid_month_move()
returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' and old.month_key is distinct from new.month_key then
    raise exception 'cannot move a budget line to a different month';
  end if;
  return new;
end;
$$;

create trigger trg_budget_line_no_move
before update on public.budget_lines
for each row execute function public.forbid_month_move();

-- Month-lock audit trail.
create or replace function public.set_month_lock_audit()
returns trigger language plpgsql as $$
begin
  if new.is_closed and (old.is_closed is distinct from true) then
    new.closed_at := now();
    new.closed_by := auth.uid();
  elsif (not new.is_closed) and old.is_closed then
    new.closed_at := null;
    new.closed_by := null;
    new.last_unlocked_at := now();
    new.last_unlocked_by := auth.uid();
  end if;
  return new;
end;
$$;

create trigger trg_month_lock_audit
before update on public.months
for each row execute function public.set_month_lock_audit();

-- Month-lock enforcement, DB-level (not just UI): reject writes into a closed month
-- even via a direct PostgREST call that bypasses the app's client-side disable.
create or replace function public.enforce_month_not_locked()
returns trigger language plpgsql as $$
declare
  v_month_key date;
  v_closed boolean;
begin
  if tg_table_name = 'budget_line_payments' then
    select bl.month_key into v_month_key
    from public.budget_lines bl
    where bl.id = coalesce(new.budget_line_id, old.budget_line_id);
  else
    v_month_key := coalesce(new.month_key, old.month_key);
  end if;

  select is_closed into v_closed from public.months where month_key = v_month_key;

  if v_closed then
    raise exception 'Month % is closed; unlock it before editing.', v_month_key;
  end if;

  return coalesce(new, old);
end;
$$;

create trigger trg_lock_budget_lines
before insert or update or delete on public.budget_lines
for each row execute function public.enforce_month_not_locked();

create trigger trg_lock_budget_line_payments
before insert or update or delete on public.budget_line_payments
for each row execute function public.enforce_month_not_locked();

create trigger trg_lock_savings_contributions
before insert or update or delete on public.savings_contributions
for each row execute function public.enforce_month_not_locked();

-- Household membership check, used by every RLS policy.
create or replace function public.is_household_member()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.family_members fm
    where fm.auth_user_id = auth.uid() and fm.is_active
  );
$$;
revoke all on function public.is_household_member() from public, anon;
grant execute on function public.is_household_member() to authenticated;

-- Generates this month's budget_lines from active recurring templates.
-- Explicit client call (supabase.rpc), not a trigger/cron — see plan for rationale.
-- Idempotent: safe to call on every page load of a month.
create or replace function public.create_month(p_month_key date)
returns void language plpgsql
security invoker
as $$
declare
  v_month_key date := date_trunc('month', p_month_key)::date;
  v_template  record;
  v_line_id   uuid;
begin
  insert into public.months (month_key)
  values (v_month_key)
  on conflict (month_key) do nothing;

  for v_template in
    select * from public.recurring_templates
    where is_active
      and effective_from <= v_month_key
      and (effective_until is null or effective_until >= v_month_key)
  loop
    v_line_id := null;

    insert into public.budget_lines (
      month_key, category_id, detail_id,
      target_amount, actual_amount, share_pct, notes, template_id, needs_review
    ) values (
      v_month_key, v_template.category_id, v_template.detail_id,
      v_template.default_target_amount, v_template.default_actual_amount,
      v_template.default_share_pct, v_template.default_notes, v_template.id, true
    )
    on conflict (month_key, detail_id) do nothing
    returning id into v_line_id;

    if v_line_id is not null then
      insert into public.budget_line_payments (budget_line_id, family_member_id, paid_amount)
      select v_line_id, rtdp.family_member_id, rtdp.default_paid_amount
      from public.recurring_template_default_payments rtdp
      where rtdp.template_id = v_template.id;
    end if;
  end loop;
end;
$$;

revoke all on function public.create_month(date) from public, anon;
grant execute on function public.create_month(date) to authenticated;

-- Invite-only signup backstop: Supabase Auth "Before User Created" hook.
-- Enforced by GoTrue itself, server-side — survives any client-side bug.
create or replace function public.check_allowed_signup(event jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_email text := lower(event -> 'claims' ->> 'email');
begin
  if not exists (select 1 from public.allowed_signup_emails where email = v_email) then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Signups are invite-only for this household budget app.'
      )
    );
  end if;
  return jsonb_build_object();
end;
$$;
