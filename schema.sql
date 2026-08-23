-- ============================================================
-- Internship Tracker (Pipeline) - Supabase schema
-- Team Blueprint - SOFTENG 310 - Group 7
--
-- Run this whole file in the Supabase SQL Editor (top to bottom).
-- It is safe to re-run: it drops nothing, and the bucket insert
-- is guarded with ON CONFLICT.
--
-- See docs/database.md for how these tables map onto the UI.
-- ============================================================


-- ------------------------------------------------------------
-- 1. APPLICATIONS
--    One row per internship application. The `status` values
--    ARE your kanban columns: edit the CHECK list to change
--    which columns exist on the board.
-- ------------------------------------------------------------
create table public.applications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid()
                 references auth.users(id) on delete cascade,
  company_name text not null,
  role         text not null,
  location     text,                     -- required by the add-application form
  due_date     date,
  status       text not null default 'to_apply'
                 check (status in ('to_apply','applied','interview','offer','rejected')),
  position     int  not null default 0,  -- ordering of a card WITHIN its column
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Queries always filter by the logged-in user, so index that column.
create index applications_user_id_idx on public.applications (user_id);


-- ------------------------------------------------------------
-- 2. DOCUMENTS  (metadata only: the file itself lives in Storage)
--    storage_path is the path inside the 'documents' bucket,
--    e.g.  <user_id>/<uuid>.pdf
--
--    NOTE: no code reads or writes this table yet. DocumentsPage
--    works directly off Storage and derives display names from
--    the path. See docs/ROADMAP.md.
-- ------------------------------------------------------------
create table public.documents (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid()
                 references auth.users(id) on delete cascade,
  doc_type     text not null
                 check (doc_type in ('cv','cover_letter','transcript')),
  file_name    text not null,            -- original filename, for display
  storage_path text not null,            -- path inside the bucket
  created_at   timestamptz not null default now()
);

create index documents_user_id_idx on public.documents (user_id);


-- ============================================================
-- 3. ROW LEVEL SECURITY
--    Enable RLS, then allow each user to touch ONLY their own
--    rows. `to authenticated` blocks anonymous access entirely.
--    A single FOR ALL policy covers select/insert/update/delete.
-- ============================================================
alter table public.applications enable row level security;
alter table public.documents    enable row level security;

create policy "Users manage own applications"
  on public.applications for all
  to authenticated
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own documents"
  on public.documents for all
  to authenticated
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ============================================================
-- 4. STORAGE BUCKET  (holds the actual document files)
--    Private bucket. Files are namespaced by user id so the
--    folder-level policies below keep users out of each
--    other's files.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- storage.foldername(name)[1] = the first folder in the path,
-- which we require to equal the user's id.
create policy "Users manage own files"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ============================================================
-- 5. AUTO-UPDATE updated_at ON applications  (optional but tidy)
--    Keeps updated_at fresh whenever a card is edited or moved.
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();
