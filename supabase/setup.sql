-- Tabela para imagens do carrossel
create table if not exists public.carousel_images (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    image_url text not null,
    title text,
    description text,
    link text,
    display_order integer default 0,
    active boolean default true,
    metadata jsonb default '{}'::jsonb
);

-- Habilitar RLS (Row Level Security)
alter table public.carousel_images enable row level security;

-- Políticas de acesso
-- Permitir leitura pública (necessário para o frontend exibir as imagens)
create policy "Public can view active carousel images"
    on public.carousel_images
    for select
    using (true);

-- Permitir que usuários autenticados gerenciem imagens
create policy "Authenticated users can manage carousel images"
    on public.carousel_images
    for all
    using (auth.role() = 'authenticated');


-- Tabela para histórico de importação (caso não exista)
create table if not exists public.import_history (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    product_count integer default 0,
    price_percentage numeric,
    applied_category text,
    applied_scope text
);

alter table public.import_history enable row level security;

create policy "Authenticated users can view import history"
    on public.import_history
    for select
    using (auth.role() = 'authenticated');

create policy "Authenticated users can insert import history"
    on public.import_history
    for insert
    with check (auth.role() = 'authenticated');

alter table public.sellers add column if not exists badge_key text;

create table if not exists public.flash_challenges (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text not null,
    prize_value numeric default 0,
    active boolean default true
);

alter table public.flash_challenges enable row level security;

create policy "Authenticated users can manage flash challenges"
    on public.flash_challenges
    for all
    using (auth.role() = 'authenticated');

create policy "Public can view active flash challenges"
    on public.flash_challenges
    for select
    using (active = true);
