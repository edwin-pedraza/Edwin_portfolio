-- Supabase schema for portfolio + blog
-- Paste into Supabase SQL editor and run.

-- 0) Extensions
create extension if not exists "pgcrypto";

-- 1) Profile (aligns with existing table)
-- Keeps your current columns; adds fields used by the app.
create table if not exists public.profile (
  id uuid primary key default gen_random_uuid()
);

alter table if exists public.profile
  add column if not exists full_name text,
  add column if not exists github_url text,
  add column if not exists linkedin_url text,
  add column if not exists created_at timestamptz default now();

-- If you already have name column, copy it into full_name once
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='profile' and column_name='name'
  ) then
    update public.profile set full_name = coalesce(full_name, name) where full_name is null;
  end if;
end $$;

alter table public.profile enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profile' and policyname = 'Public read profile'
  ) then
    create policy "Public read profile"
      on public.profile for select
      to anon, authenticated
      using (true);
  end if;
end
$$;

-- 2) Education (Resume)
create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  "order" int,
  title text not null,
  company_name text,
  icon_url text,
  icon_bg text default '#383E56',
  date text,
  achievement_subtitle text default 'Achievements',
  achievement_points jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.education enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'education' and policyname = 'Public read education'
  ) then
    create policy "Public read education"
      on public.education for select
      to anon, authenticated
      using (true);
  end if;
end
$$;

-- 3) Experience (Resume)
create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  "order" int,
  title text not null,
  company_name text,
  icon_url text,
  icon_bg text default '#383E56',
  date text,
  achievement_subtitle text default 'Achievements',
  achievement_points jsonb default '[]'::jsonb,
  respon_subtitle text default 'Responsibilities',
  respon_points jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.experience enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'experience' and policyname = 'Public read experience'
  ) then
    create policy "Public read experience"
      on public.experience for select
      to anon, authenticated
      using (true);
  end if;
end
$$;

-- 4) Blog posts
create table if not exists public.post (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  excerpt text,
  content text,
  tag text,
  cover_url text,
  project_url text,
  gallery_urls jsonb default '[]'::jsonb,
  author_id uuid references public.profile(id) on delete set null,
  published_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table if exists public.post
  add column if not exists project_url text,
  add column if not exists gallery_urls jsonb default '[]'::jsonb;

alter table public.post enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'post' and policyname = 'Public read posts'
  ) then
    create policy "Public read posts"
      on public.post for select
      to anon, authenticated
      using (true);
  end if;
end
$$;

-- Create bucket via INSERT-if-not-exists (compatible across Storage versions)
insert into storage.buckets (id, name, public)
select 'Postimg', 'Postimg', true
where not exists (select 1 from storage.buckets where id = 'Postimg');

-- Public read access for objects in Postimg
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read Postimg'
  ) then
    create policy "Public read Postimg"
      on storage.objects for select
      to anon, authenticated
      using (bucket_id = 'Postimg');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated upload Postimg'
  ) then
    create policy "Authenticated upload Postimg"
      on storage.objects for insert
      to authenticated
      with check (bucket_id = 'Postimg');
  end if;
end
$$;

-- Optional: sample inserts (uncomment to seed)
insert into public.profile (full_name, github_url, linkedin_url)
values ('Edwin Pedraza','https://github.com/edwin-pedraza','https://www.linkedin.com/in/edwin-y-pedraza-b-/');

insert into public.education ("order", title, company_name, icon_url, date, achievement_points)
values (1,'Certificate IV in Information Technology','Upskilled Pty Ltd','https://.../icon.png','2023 - Currently', '["Developed templates","Developed UAT","Documented UAT"]');

insert into public.experience ("order", title, company_name, icon_url, date, achievement_points, respon_points)
values (1,'System Test Analyst','Choucair Testing','https://.../icon.png','2015 - 2016','["Templates","UAT","Docs"]','["Identify tasks","Design tests","Automate tests"]');

insert into public.post (slug, title, excerpt, content, tag)
values ('hello-world','Hello World','First post','Longer content here...','React');


-- Extra profile fields used by About/Hero
alter table if exists public.profile
  add column if not exists about_text text,
  add column if not exists photo_url text;

-- 5) Settings (theme + blog)
-- Stores theme and blog configuration in structured JSONB columns
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  theme_color text, -- legacy field (stringified JSON). Kept for backward compatibility
  theme jsonb,      -- new structured column
  blog jsonb,       -- new structured column
  created_at timestamptz default now()
);

-- If table already exists, ensure new columns are present
alter table if exists public.settings add column if not exists theme jsonb;
alter table if exists public.settings add column if not exists blog jsonb;

-- Best-effort migration from legacy theme_color -> theme/blog
do $$
begin
  begin
    update public.settings
    set theme = coalesce(theme, (theme_color::jsonb -> 'theme')),
        blog  = coalesce(blog,  (theme_color::jsonb -> 'blog'))
    where theme_color is not null and theme_color <> '';
  exception when others then
    -- ignore if theme_color rows contain non-JSON strings
    null;
  end;
end $$;
