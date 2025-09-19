-- Admin (authenticated) write access for portfolio tables
-- Run this in the Supabase SQL editor after creating tables.

-- Education
alter table if exists public.education enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='education' and policyname='Auth write education') then
    create policy "Auth write education" on public.education for all to authenticated using (true) with check (true);
  end if;
end $$;

-- Profile
alter table if exists public.profile enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profile' and policyname='Auth write profile') then
    create policy "Auth write profile" on public.profile for all to authenticated using (true) with check (true);
  end if;
end $$;

-- Hero config
alter table if exists public.hero_config enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='hero_config' and policyname='Auth write hero_config') then
    create policy "Auth write hero_config" on public.hero_config for all to authenticated using (true) with check (true);
  end if;
end $$;

-- Experience
alter table if exists public.experience enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='experience' and policyname='Auth write experience') then
    create policy "Auth write experience" on public.experience for all to authenticated using (true) with check (true);
  end if;
end $$;

-- Service
alter table if exists public.service enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='service' and policyname='Auth write service') then
    create policy "Auth write service" on public.service for all to authenticated using (true) with check (true);
  end if;
end $$;

-- Technology
alter table if exists public.technology enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='technology' and policyname='Auth write technology') then
    create policy "Auth write technology" on public.technology for all to authenticated using (true) with check (true);
  end if;
end $$;

-- Project
alter table if exists public.project enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='project' and policyname='Auth write project') then
    create policy "Auth write project" on public.project for all to authenticated using (true) with check (true);
  end if;
end $$;

-- Post (blog)
alter table if exists public.post enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='post' and policyname='Auth write post') then
    create policy "Auth write post" on public.post for all to authenticated using (true) with check (true);
  end if;
end $$;

-- Tag
alter table if exists public.tag enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='tag' and policyname='Auth write tag') then
    create policy "Auth write tag" on public.tag for all to authenticated using (true) with check (true);
  end if;
end $$;

-- Project_tag mapping
alter table if exists public.project_tag enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='project_tag' and policyname='Auth write project_tag') then
    create policy "Auth write project_tag" on public.project_tag for all to authenticated using (true) with check (true);
  end if;
end $$;

-- Nav links
alter table if exists public.nav_link enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='nav_link' and policyname='Auth write nav_link') then
    create policy "Auth write nav_link" on public.nav_link for all to authenticated using (true) with check (true);
  end if;
end $$;

-- Settings
alter table if exists public.settings enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='settings' and policyname='Admins manage settings') then
    create policy "Admins manage settings" on public.settings
      for all to authenticated
      using (public.is_portfolio_admin())
      with check (public.is_portfolio_admin());
  end if;
end $$;
