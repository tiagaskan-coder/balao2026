-- Create site_settings table for global configuration (e.g., theme)
create table if not exists site_settings (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table site_settings enable row level security;

-- Policies
create policy "Site settings are viewable by everyone" on site_settings
  for select using (true);

create policy "Admins can insert site settings" on site_settings
  for insert with check (true);

create policy "Admins can update site settings" on site_settings
  for update using (true);

create policy "Admins can delete site settings" on site_settings
  for delete using (true);
