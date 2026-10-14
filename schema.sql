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


-- ------------------------------------------------------------
-- 3. TASKS
--    One row per task in the Task List page. The `status` values
--    represent the three draggable columns. Due Soon is calculated
--    from due_date and is not stored as a separate status.
-- ------------------------------------------------------------
create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid()
                 references auth.users(id) on delete cascade,
  title        text not null
                 check (length(trim(title)) > 0),
  description  text,
  due_date     date,
  status       text not null default 'todo'
                 check (status in ('todo','in_progress','completed')),
  position     int  not null default 0,  -- ordering of a task WITHIN its column
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Queries filter by the logged-in user and order tasks by column position.
create index tasks_user_status_position_idx
  on public.tasks (user_id, status, position);


-- ============================================================
-- 4. ROW LEVEL SECURITY
--    Enable RLS, then allow each user to touch ONLY their own
--    rows. `to authenticated` blocks anonymous access entirely.
--    A single FOR ALL policy covers select/insert/update/delete.
-- ============================================================
alter table public.applications enable row level security;
alter table public.documents    enable row level security;
alter table public.tasks        enable row level security;

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

create policy "Users manage own tasks"
  on public.tasks for all
  to authenticated
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ------------------------------------------------------------
-- 4. PUSH NOTIFICATIONS
-- ------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid()
               references auth.users(id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "Users manage own push subscriptions"
  on public.push_subscriptions for all
  to authenticated
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.push_notification_deliveries (
  id                   uuid primary key default gen_random_uuid(),
  application_id       uuid not null
                         references public.applications(id) on delete cascade,
  push_subscription_id uuid not null
                         references public.push_subscriptions(id) on delete cascade,
  reminder_date        date not null,
  created_at           timestamptz not null default now(),
  unique (application_id, push_subscription_id, reminder_date)
);

alter table public.push_notification_deliveries enable row level security;


-- ============================================================
-- 5. STORAGE BUCKET  (holds the actual document files)
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
-- 6. AUTO-UPDATE updated_at ON applications  (optional but tidy)
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

-- Keep updated_at fresh whenever a task is edited or moved.
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();
