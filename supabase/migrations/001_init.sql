-- Enable extensions
create extension if not exists "pgcrypto";

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  username text
);

-- Budgets table
create table if not exists public."Budgets" (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  budget_name text not null,
  budget_number numeric not null,
  user_id uuid not null references public.profiles(id) on delete cascade
);

create index if not exists budgets_user_id_idx on public."Budgets" (user_id);

-- Transactions table
create table if not exists public."Transactions" (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  category text not null,
  amount numeric not null,
  type text not null check (type in ('income','expense')),
  notes text,
  date date not null,
  user_id uuid not null references public.profiles(id) on delete cascade
);

create index if not exists transactions_user_id_idx on public."Transactions" (user_id);
create index if not exists transactions_date_idx on public."Transactions" (date);

-- RLS
alter table public.profiles enable row level security;
alter table public."Budgets" enable row level security;
alter table public."Transactions" enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "budgets_select_own" on public."Budgets"
  for select using (auth.uid() = user_id);

create policy "budgets_insert_own" on public."Budgets"
  for insert with check (auth.uid() = user_id);

create policy "budgets_update_own" on public."Budgets"
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transactions_select_own" on public."Transactions"
  for select using (auth.uid() = user_id);

create policy "transactions_insert_own" on public."Transactions"
  for insert with check (auth.uid() = user_id);

create policy "transactions_update_own" on public."Transactions"
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Trigger to auto-create profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
