-- Assistant Settings
create table if not exists public.assistant_settings (
  key text primary key,
  greeting text,
  voice_enabled boolean default true,
  max_results integer default 5,
  updated_at timestamptz default now()
);

-- Assistant Messages (Session Memory)
create table if not exists public.assistant_messages (
  id bigint generated always as identity primary key,
  session_id text not null,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- Indexes for faster retrieval
create index if not exists assistant_messages_session_idx on public.assistant_messages (session_id);
create index if not exists assistant_messages_created_idx on public.assistant_messages (created_at);

-- Optional: Enable RLS (service role bypasses RLS)
alter table public.assistant_settings enable row level security;
alter table public.assistant_messages enable row level security;

-- Policies (allow only service role by default; customize as needed)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'assistant_settings' and policyname = 'allow_service_role_all'
  ) then
    create policy allow_service_role_all on public.assistant_settings
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'assistant_messages' and policyname = 'allow_service_role_all'
  ) then
    create policy allow_service_role_all on public.assistant_messages
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end $$;
