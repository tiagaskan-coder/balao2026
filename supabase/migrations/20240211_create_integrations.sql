-- Create table for storing third-party integrations (Instagram, etc.)
create table if not exists integrations (
  id uuid default gen_random_uuid() primary key,
  service text not null unique, -- 'instagram'
  access_token text,
  user_id text,
  username text,
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table integrations enable row level security;

-- Create policy to allow public access (simplified for this use case, or restrict to admin)
create policy "Allow all access for authenticated users" on integrations
  for all using (true) with check (true);
