-- Storage bucket and policies for portfolio assets
-- Run this in the Supabase SQL editor.

-- Create public bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

-- Enable public read from the bucket (works even if bucket set to private)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read portfolio objects'
  ) then
    create policy "Public read portfolio objects" on storage.objects
      for select to public
      using (bucket_id = 'portfolio');
  end if;
end $$;

-- Allow authenticated users to upload to the bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Auth upload portfolio objects'
  ) then
    create policy "Auth upload portfolio objects" on storage.objects
      for insert to authenticated
      with check (bucket_id = 'portfolio');
  end if;
end $$;

-- Allow authenticated users to update their own objects in the bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Auth update own portfolio objects'
  ) then
    create policy "Auth update own portfolio objects" on storage.objects
      for update to authenticated
      using (bucket_id = 'portfolio' and owner = auth.uid())
      with check (bucket_id = 'portfolio' and owner = auth.uid());
  end if;
end $$;

-- Allow authenticated users to delete their own objects in the bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Auth delete own portfolio objects'
  ) then
    create policy "Auth delete own portfolio objects" on storage.objects
      for delete to authenticated
      using (bucket_id = 'portfolio' and owner = auth.uid());
  end if;
end $$;

