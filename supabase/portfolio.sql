-- Portfolio data schema and seed
-- Run this after supabase/schema.sql in the Supabase SQL editor.

-- Extension needed for gen_random_uuid
create extension if not exists "pgcrypto";

-- Services (what you do)
create table if not exists public.service (
  id uuid primary key default gen_random_uuid(),
  "order" int,
  title text not null,
  slug text,
  icon_url text,
  short_description text,
  focus_areas text,
  toolset_list text,
  cta_text text,
  created_at timestamptz default now()
);
alter table public.service add constraint if not exists service_title_uniq unique (title);
alter table public.service add column if not exists slug text;
alter table public.service add column if not exists short_description text;
alter table public.service add column if not exists focus_areas text;
alter table public.service add column if not exists toolset_list text;
alter table public.service add column if not exists cta_text text;
alter table public.service add constraint if not exists service_slug_uniq unique (slug);
alter table public.service enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='service' and policyname='Public read services'
  ) then
    create policy "Public read services" on public.service for select to anon, authenticated using (true);
  end if;
end $$;

-- Technologies
create table if not exists public.technology (
  id uuid primary key default gen_random_uuid(),
  "order" int,
  name text not null,
  icon_url text,
  created_at timestamptz default now()
);
alter table public.technology add constraint if not exists technology_name_uniq unique (name);
alter table public.technology enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='technology' and policyname='Public read technologies'
  ) then
    create policy "Public read technologies" on public.technology for select to anon, authenticated using (true);
  end if;
end $$;

-- Testimonials
create table if not exists public.testimonial (
  id uuid primary key default gen_random_uuid(),
  "order" int,
  testimonial text,
  name text,
  designation text,
  company text,
  image_url text,
  created_at timestamptz default now()
);
alter table public.testimonial add constraint if not exists testimonial_dedup_uniq unique (name, designation, company);
alter table public.testimonial enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='testimonial' and policyname='Public read testimonials'
  ) then
    create policy "Public read testimonials" on public.testimonial for select to anon, authenticated using (true);
  end if;
end $$;

-- Projects
create table if not exists public.project (
  id uuid primary key default gen_random_uuid(),
  "order" int,
  name text not null,
  description text,
  image_url text,
  model_url text,
  source_code_link text,
  source_link_web text,
  created_at timestamptz default now()
);
alter table public.project add constraint if not exists project_name_uniq unique (name);
alter table public.project enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='project' and policyname='Public read projects'
  ) then
    create policy "Public read projects" on public.project for select to anon, authenticated using (true);
  end if;
end $$;

-- Tags
create table if not exists public.tag (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  color text,
  created_at timestamptz default now()
);
alter table public.tag enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='tag' and policyname='Public read tags'
  ) then
    create policy "Public read tags" on public.tag for select to anon, authenticated using (true);
  end if;
end $$;

-- Project <-> Tag mapping
create table if not exists public.project_tag (
  project_id uuid references public.project(id) on delete cascade,
  tag_id uuid references public.tag(id) on delete cascade,
  primary key (project_id, tag_id)
);
alter table public.project_tag enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='project_tag' and policyname='Public read project_tag'
  ) then
    create policy "Public read project_tag" on public.project_tag for select to anon, authenticated using (true);
  end if;
end $$;

-- Navigation links
create table if not exists public.nav_link (
  id text primary key,
  "order" int,
  title text not null,
  created_at timestamptz default now()
);
alter table public.nav_link enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='nav_link' and policyname='Public read nav_link'
  ) then
    create policy "Public read nav_link" on public.nav_link for select to anon, authenticated using (true);
  end if;
end $$;

-- -------------------------------------------------------------------
-- Seed data from src/components/Portfolio/constants/index.js
-- Safe to re-run due to unique constraints + ON CONFLICT DO NOTHING
-- -------------------------------------------------------------------

-- nav links
insert into public.nav_link (id, "order", title) values
  ('about', 1, 'About'),
  ('resume', 2, 'Resume'),
  ('projects', 3, 'Projects'),
  ('contact', 4, 'Contact')
on conflict (id) do nothing;

-- services
insert into public.service ("order", title, slug, icon_url, short_description, focus_areas, toolset_list, cta_text) values
  (
    1,
    'Web Developer',
    'web-developer',
    null,
    'Responsive interfaces crafted with accessibility, performance, and maintainability in mind.',
    $$Pixel-perfect UI implementation with React, Tailwind, and Framer Motion animations.
Design system stewardship to keep typography, spacing, and colors consistent.
Performance budgets, Core Web Vitals tracking, and Lighthouse-driven optimizations.$$,
    $$React
Vite
Tailwind CSS
TypeScript
Framer Motion
Storybook$$,
    'Let me craft delightful interfaces that convert visitors into users.'
  ),
  (
    2,
    'Backend Developer',
    'backend-developer',
    null,
    'Robust APIs, secure data flows, and cloud-native deployments that scale.',
    $$REST and GraphQL API design with proper validation, rate limiting, and observability.
Database schema design plus migration strategies across PostgreSQL, MongoDB, and Supabase.
CI/CD pipelines that automate testing, container builds, and blue/green deployments.$$,
    $$Node.js
Express
Supabase
PostgreSQL
MongoDB
Docker$$,
    'I can help you launch reliable services without slowing the roadmap.'
  ),
  (
    3,
    'Game Developer',
    'game-developer',
    null,
    'Gameplay prototypes that balance mechanics, narrative, and player feedback loops.',
    $$Rapid prototyping of mechanics, level design, and UI flows for early playtesting.
Shader and particle experimentation to bring environments and characters to life.
Build automation for multi-platform exports plus telemetry hooks for balancing data.$$,
    $$Unity
C#
Blender
Three.js
WebGL
Figma$$,
    'Let’s turn your story into an interactive experience.'
  )
on conflict (title) do nothing;

-- technologies
insert into public.technology ("order", name, icon_url) values
  (1, 'HTML 5', null),
  (2, 'CSS 3', null),
  (3, 'JavaScript', null),
  (4, 'TypeScript', null),
  (5, 'React JS', null),
  (6, 'Tailwind CSS', null),
  (7, 'Node JS', null),
  (8, 'MongoDB', null),
  (9, 'git', null),
  (10, 'figma', null)
on conflict (name) do nothing;

-- education (tables defined in supabase/schema.sql)
insert into public.education ("order", title, company_name, icon_url, icon_bg, date, achievement_subtitle, achievement_points) values
  (1, 'Certificate IV in Information Technology,', 'Upskilled Pty Ltd, Australia', null, '#383E56', '2023 - Currently', 'Achievements',
   '[
     "Developed business requirement templates aimed to collect input for an implementation project to automate processes in a major local bank.",
     "Developed an UAT procedure from scratch",
     "Documented UAT which had to be signed and agreed by clients."
   ]'::jsonb),
  (2, 'Bachelor Degree of Systems Engineer', 'ECCI University, Bogota, Colombia', null, '#383E56', '2010 - 2014', 'Achievements',
   '[
     "Developed business requirement templates aimed to collect input for an implementation project to automate processes in a major local bank.",
     "Developed an UAT procedure from scratch",
     "Documented UAT which had to be signed and agreed by clients."
   ]'::jsonb),
  (3, 'Professional Technician in Systems Engineering', 'INSUTEC. Bogota, Colombia', null, '#383E56', '2005 - 2008', 'Achievements',
   '[
     "Developed business requirement templates aimed to collect input for an implementation project to automate processes in a major local bank.",
     "Developed an UAT procedure from scratch",
     "Documented UAT which had to be signed and agreed by clients."
   ]'::jsonb)
on conflict do nothing;

-- experience
insert into public.experience ("order", title, company_name, icon_url, icon_bg, date, achievement_subtitle, achievement_points, respon_subtitle, respon_points) values
  (1, 'System Test Analyst', 'Choucair Testing, Colombia', null, '#383E56', 'June 2015 - July 2016',
   'Achievements',
   '[
     "Developed business requirement templates aimed to collect input for an implementation project to automate processes in a major local bank.",
     "Developed an UAT procedure from scratch",
     "Documented UAT which had to be signed and agreed by clients."
   ]'::jsonb,
   'Responsibilities',
   '[
     "Identifying and breaking down the necessary tasks to test new or existing product.",
     "Designing tests, either alone or as part of a team",
     "Setting up automated tests.",
     "Performing functional tests of clients'' web page.",
     "Analysing the customers'' IT Quality Assurance Area."
   ]'::jsonb),
  (2, 'IT Support Officer', 'IQ Outsourcing, Colombia', null, '#E6DEDD', 'September 2013 - May 2015',
   'Achievements',
   '[
     "Proposed, prepared and facilitated training for new team members, increasing team productivity by 20%.",
     "Designed and implemented an operational status report using SQL to consolidate a dashboard",
     "Utilised SQL to identify errors in databases, enabling timely fixes"
   ]'::jsonb,
   'Responsibilities',
   '[
     "Monitoring and maintaining computer systems and networks.",
     "Ensuring that new technologies and processes are adapted to current systems effectively.",
     "Supervising installation of software and hardware modules and ensuring that upgrades are performed timely.",
     "Validating errors and proposing solutions to applications.",
     "Ensuring that computer hardware and software is updated and maintained correctly.",
     "Repairing and replacing equipment as necessary.",
     "Diagnosing and troubleshooting technical problems.",
     "Identifying priority issues and ensuring that they are handled first.",
     "Responding on time to service issues and requests.",
     "Providing technical support to customers'' IT staff."
   ]'::jsonb)
on conflict do nothing;

-- testimonials
insert into public.testimonial ("order", testimonial, name, designation, company, image_url) values
  (1, 'I thought it was impossible to make a website as beautiful as our product, but Rick proved me wrong.', 'Sara Lee', 'CFO', 'Acme Co', 'https://randomuser.me/api/portraits/women/4.jpg'),
  (2, 'I''ve never met a web developer who truly cares about their clients'' success like Rick does.', 'Chris Brown', 'COO', 'DEF Corp', 'https://randomuser.me/api/portraits/men/5.jpg'),
  (3, 'After Rick optimized our website, our traffic increased by 50%. We can''t thank them enough!', 'Lisa Wang', 'CTO', '456 Enterprises', 'https://randomuser.me/api/portraits/women/6.jpg')
on conflict do nothing;

-- projects
insert into public.project ("order", name, description, image_url, source_code_link, source_link_web) values
  (1, 'Portfolio',
   'Front-end portfolio built with Vite + React. Responsive, performant, and accessible.',
   null,
   'https://github.com/edwin-pedraza/React_portafoliopapp',
   'https://edwin-pedraza.github.io/react/Project/portfolio/build/index.html'
  )
on conflict (name) do nothing;

-- tags
insert into public.tag (name, color) values
  ('react', 'blue-text-gradient'),
  ('CSS', 'green-text-gradient')
on conflict (name) do nothing;

-- link tags to the portfolio project
insert into public.project_tag (project_id, tag_id)
select p.id, t.id
from public.project p
join public.tag t on t.name in ('react','CSS')
where p.name = 'Portfolio'
on conflict do nothing;
