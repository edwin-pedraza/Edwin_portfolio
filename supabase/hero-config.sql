create table if not exists public.hero_config (
  id bigint generated always as identity primary key,
  default_mode text not null default 'workspace',
  logo_text text null,
  headline_words text[] null,
  created_at timestamptz not null default now()
);

alter table public.hero_config enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='hero_config' and policyname='Public read hero_config'
  ) then
    create policy "Public read hero_config" on public.hero_config for select using (true);
  end if;
end $$;
