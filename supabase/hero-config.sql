-- Hero configuration for 3D model + typewriter
-- Run in Supabase after schema.sql

create table if not exists public.hero_config (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  default_mode text default 'laptop', -- laptop | donut | scatter | logo
  logo_text text,
  headline_words text[]
);

alter table public.hero_config enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='hero_config' and policyname='Public read hero_config'
  ) then
    create policy "Public read hero_config" on public.hero_config for select to anon, authenticated using (true);
  end if;
end $$;

-- Seed one row (safe if exists)
insert into public.hero_config (default_mode, logo_text, headline_words)
values ('laptop','EDWIN • DEV • DATA', array['Professional Coder.','Full Stack Developer.','UI Designer.'])
on conflict do nothing;

