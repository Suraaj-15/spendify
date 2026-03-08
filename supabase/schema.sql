create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  age int,
  gender text,
  base_currency text not null default 'INR',
  theme text not null default 'dark',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists age int;
alter table public.profiles add column if not exists gender text;

create table if not exists public.categories (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  name text not null,
  icon text not null default '',
  color text not null default '#64748b',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.expenses (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_original numeric(12,2) not null,
  currency text not null default 'INR',
  fx_rate numeric(12,6) not null default 1,
  amount_base numeric(12,2) not null,
  category_id text not null,
  txn_date date not null,
  description text,
  merchant text,
  method text not null default 'Card',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expenses_category_fk foreign key (user_id, category_id) references public.categories(user_id, id) on update cascade
);

create index if not exists expenses_user_date_idx on public.expenses(user_id, txn_date desc);
create index if not exists expenses_user_category_idx on public.expenses(user_id, category_id);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id text not null,
  month text not null,
  limit_amount numeric(12,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category_id, month),
  constraint budgets_category_fk foreign key (user_id, category_id) references public.categories(user_id, id) on update cascade
);

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, title)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  text_content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_context (
  session_id uuid primary key references public.chat_sessions(id) on delete cascade,
  last_expense_id bigint,
  last_query_signature text,
  last_result_set_ids bigint[] default '{}',
  pending_confirmation_action jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.merchant_category_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  merchant_pattern text not null,
  category_id text not null,
  confidence numeric(5,2) not null default 0.8,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, merchant_pattern),
  constraint merchant_rule_category_fk foreign key (user_id, category_id) references public.categories(user_id, id) on update cascade
);

create table if not exists public.fx_rates_cache (
  base_currency text not null,
  rate_date date not null,
  rates jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (base_currency, rate_date)
);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.expenses enable row level security;
alter table public.budgets enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_context enable row level security;
alter table public.merchant_category_rules enable row level security;
alter table public.fx_rates_cache enable row level security;

drop policy if exists profiles_owner on public.profiles;
drop policy if exists categories_owner on public.categories;
drop policy if exists expenses_owner on public.expenses;
drop policy if exists budgets_owner on public.budgets;
drop policy if exists sessions_owner on public.chat_sessions;
drop policy if exists merchant_rules_owner on public.merchant_category_rules;
drop policy if exists fx_cache_read_all on public.fx_rates_cache;
drop policy if exists fx_cache_write_owner on public.fx_rates_cache;
drop policy if exists fx_cache_update_owner on public.fx_rates_cache;
drop policy if exists messages_owner on public.chat_messages;
drop policy if exists context_owner on public.chat_context;

create policy profiles_owner on public.profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy categories_owner on public.categories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy expenses_owner on public.expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy budgets_owner on public.budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy sessions_owner on public.chat_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy merchant_rules_owner on public.merchant_category_rules for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy fx_cache_read_all on public.fx_rates_cache for select using (true);
create policy fx_cache_write_owner on public.fx_rates_cache for insert with check (auth.uid() is not null);
create policy fx_cache_update_owner on public.fx_rates_cache for update using (auth.uid() is not null) with check (auth.uid() is not null);

create policy messages_owner on public.chat_messages
for all
using (
  exists (
    select 1 from public.chat_sessions s
    where s.id = chat_messages.session_id and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.chat_sessions s
    where s.id = chat_messages.session_id and s.user_id = auth.uid()
  )
);

create policy context_owner on public.chat_context
for all
using (
  exists (
    select 1 from public.chat_sessions s
    where s.id = chat_context.session_id and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.chat_sessions s
    where s.id = chat_context.session_id and s.user_id = auth.uid()
  )
);

