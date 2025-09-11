-- Optional: add unique constraints to prevent duplicates
-- Adjust to your preference before running.

-- Prevent duplicate education entries by title + company + date
do $$
begin
  if not exists (
    select 1 from pg_indexes where schemaname = 'public' and indexname = 'education_dedup_uniq'
  ) then
    alter table public.education add constraint education_dedup_uniq unique (title, company_name, date);
  end if;
end $$;

-- Prevent duplicate experience entries by title + company + date
do $$
begin
  if not exists (
    select 1 from pg_indexes where schemaname = 'public' and indexname = 'experience_dedup_uniq'
  ) then
    alter table public.experience add constraint experience_dedup_uniq unique (title, company_name, date);
  end if;
end $$;

