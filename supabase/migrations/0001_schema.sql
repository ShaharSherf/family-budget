-- Family budget app schema.
-- One row per (month, category, detail) — a lump-sum monthly review, not an itemized ledger.

create extension if not exists pgcrypto;

-- ── Reference tables ────────────────────────────────────────────────────────

create table public.family_members (
  id           uuid primary key default gen_random_uuid(),
  display_name text not null,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  name_he    text not null unique,
  name_en    text,
  kind       text not null check (kind in ('income', 'expense')),
  sort_order int not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.details (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name_he     text not null,
  name_en     text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (category_id, name_he)
);
create index details_category_id_idx on public.details (category_id);

create table public.months (
  month_key        date primary key
                     check (date_trunc('month', month_key)::date = month_key),
  is_closed        boolean not null default false,
  closed_at        timestamptz,
  closed_by        uuid references auth.users(id),
  last_unlocked_at timestamptz,
  last_unlocked_by uuid references auth.users(id),
  created_at       timestamptz not null default now()
);

-- ── Recurring templates ─────────────────────────────────────────────────────

create table public.recurring_templates (
  id                    uuid primary key default gen_random_uuid(),
  category_id           uuid not null references public.categories(id) on delete restrict,
  detail_id             uuid not null references public.details(id) on delete restrict,
  default_target_amount numeric(12, 2) check (default_target_amount is null or default_target_amount >= 0),
  default_actual_amount numeric(12, 2) check (default_actual_amount is null or default_actual_amount >= 0),
  default_share_pct     numeric(5, 2) not null default 100 check (default_share_pct between 0 and 100),
  default_notes         text,
  is_active             boolean not null default true,
  effective_from        date not null check (date_trunc('month', effective_from)::date = effective_from),
  effective_until       date check (effective_until is null or date_trunc('month', effective_until)::date = effective_until),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index recurring_templates_category_id_idx on public.recurring_templates (category_id);
create index recurring_templates_detail_id_idx on public.recurring_templates (detail_id);

create table public.recurring_template_default_payments (
  id                  uuid primary key default gen_random_uuid(),
  template_id         uuid not null references public.recurring_templates(id) on delete cascade,
  family_member_id    uuid not null references public.family_members(id) on delete restrict,
  default_paid_amount numeric(12, 2) not null default 0,
  unique (template_id, family_member_id)
);

-- ── Budget lines (income + expense) ─────────────────────────────────────────

create table public.budget_lines (
  id                   uuid primary key default gen_random_uuid(),
  month_key            date not null references public.months(month_key) on delete restrict,
  category_id          uuid not null references public.categories(id) on delete restrict,
  detail_id            uuid not null references public.details(id) on delete restrict,
  target_amount        numeric(12, 2) check (target_amount is null or target_amount >= 0),
  actual_amount        numeric(12, 2) check (actual_amount is null or actual_amount >= 0),
  share_pct            numeric(5, 2) not null default 100 check (share_pct between 0 and 100),
  family_actual_amount numeric(12, 2) generated always as (
    case when actual_amount is null then null
         else round(actual_amount * share_pct / 100.0, 2) end
  ) stored,
  notes                text,
  template_id          uuid references public.recurring_templates(id) on delete restrict,
  is_template_override boolean not null default false,
  needs_review          boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (month_key, detail_id)
);
create index budget_lines_month_key_idx on public.budget_lines (month_key);
create index budget_lines_category_id_idx on public.budget_lines (category_id);
create index budget_lines_template_id_idx on public.budget_lines (template_id);

create table public.budget_line_payments (
  id               uuid primary key default gen_random_uuid(),
  budget_line_id   uuid not null references public.budget_lines(id) on delete cascade,
  family_member_id uuid not null references public.family_members(id) on delete restrict,
  paid_amount      numeric(12, 2) not null default 0 check (paid_amount >= 0),
  unique (budget_line_id, family_member_id)
);
create index budget_line_payments_budget_line_id_idx on public.budget_line_payments (budget_line_id);

-- ── Savings goals ────────────────────────────────────────────────────────────

create table public.savings_goals (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null unique,
  monthly_target_amount  numeric(12, 2) check (monthly_target_amount is null or monthly_target_amount >= 0),
  lifetime_target_amount numeric(12, 2) check (lifetime_target_amount is null or lifetime_target_amount >= 0),
  is_active              boolean not null default true,
  notes                  text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table public.savings_contributions (
  id                 uuid primary key default gen_random_uuid(),
  goal_id            uuid not null references public.savings_goals(id) on delete restrict,
  month_key          date not null references public.months(month_key) on delete restrict,
  contributed_amount numeric(12, 2) not null default 0,
  notes              text,
  created_at         timestamptz not null default now(),
  unique (goal_id, month_key)
);
create index savings_contributions_goal_id_idx on public.savings_contributions (goal_id);
create index savings_contributions_month_key_idx on public.savings_contributions (month_key);

-- ── Invite-only signup allowlist (no client access at all; see 0004) ───────

create table public.allowed_signup_emails (
  email text primary key
);
