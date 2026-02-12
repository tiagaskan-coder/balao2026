-- Ranking de Vendas Gamificado - Supabase Schema
-- Tabelas principais
create table if not exists public.sellers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo text,
  hired_at date not null,
  created_at timestamptz default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  value numeric not null check (value >= 0),
  created_at timestamptz default now()
);

create table if not exists public.google_reviews (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  bonus_value numeric not null default 50,
  created_at timestamptz default now()
);

create type goal_type as enum ('day','week','month');

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  type goal_type not null,
  target numeric not null check (target >= 0),
  prize text not null,
  updated_at timestamptz default now()
);

-- View de performance agregada por período (mês)
create view public.seller_monthly_stats as
select
  s.id as seller_id,
  date_trunc('month', coalesce(sa.created_at, gr.created_at, now())) as month,
  coalesce(sum(sa.value), 0) + coalesce(sum(gr.bonus_value), 0) as total_with_bonus
from sellers s
left join sales sa on sa.seller_id = s.id
left join google_reviews gr on gr.seller_id = s.id
group by s.id, date_trunc('month', coalesce(sa.created_at, gr.created_at, now()));

-- RLS (exemplo simples - ajuste conforme necessidade do projeto)
alter table public.sellers enable row level security;
alter table public.sales enable row level security;
alter table public.google_reviews enable row level security;
alter table public.goals enable row level security;

create policy "read_all_public_tables" on public.sellers for select using (true);
create policy "read_all_public_tables_sales" on public.sales for select using (true);
create policy "read_all_public_tables_reviews" on public.google_reviews for select using (true);
create policy "read_all_public_tables_goals" on public.goals for select using (true);

-- O service_role (via backend) pode inserir/atualizar sem restrição
