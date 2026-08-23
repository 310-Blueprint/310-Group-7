# Database

Supabase Postgres, plus one Storage bucket. The runnable schema is
[`schema.sql`](../schema.sql) in the repo root; this document explains what it
means rather than repeating it.

## Setting up a project

1. Create a Supabase project.
2. Open the SQL editor and run [`schema.sql`](../schema.sql) top to bottom. It
   creates both tables, enables row-level security, adds the policies, creates
   the private `documents` Storage bucket, and adds a trigger that keeps
   `updated_at` current.
3. Copy the project URL and publishable key from Settings, then API, into
   `.env.local`. See [authentication.md](authentication.md).

The file is safe to re-run against the same project: it drops nothing, and the
bucket insert is guarded with `on conflict do nothing`. The `create table` and
`create policy` statements will error if the objects already exist, which is the
intended signal that the project is already set up.

## `applications`

One row per internship application. Every card on the board is a row here.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key. Also the drag-and-drop item id in the UI. |
| `user_id` | `uuid` | Defaults to `auth.uid()`, cascades on user delete. |
| `company_name` | `text` | Required. |
| `role` | `text` | Required. |
| `location` | `text` | Required by the add form, nullable in the database. |
| `due_date` | `date` | A real date column, not free text. |
| `status` | `text` | CHECK-constrained. This is the board column. |
| `position` | `int` | Ordering of a card **within** its column. |
| `created_at` | `timestamptz` | Set on insert. |
| `updated_at` | `timestamptz` | Maintained by the `applications_set_updated_at` trigger. |

### Database to UI mapping

The database names and the board's names differ, so `src/lib/applications.js`
translates between them. Nothing else in the app should talk to this table
directly.

| Database | UI | Where |
| --- | --- | --- |
| `company_name` | `company` | `toApplication()` |
| `due_date` | `dueDate` | `toApplication()` |
| `status` | column title | `STATUS_BY_COLUMN` and its inverse |
| `location`, `role`, `id` | unchanged | `toApplication()` |

The status mapping is the important half:

| `status` value | Board column |
| --- | --- |
| `to_apply` | To apply |
| `applied` | Applied / Waiting |
| `interview` | Interview |
| `offer` | Offer |
| `rejected` | **no column** |

`rejected` is allowed by the CHECK constraint but has no entry in
`STATUS_BY_COLUMN` and no column in `src/pages/dashboardData.js`. A row with
that status is silently invisible in the UI. Either add a fifth column or drop
the value from the constraint; see [ROADMAP.md](ROADMAP.md).

The board's column titles are defined once in `src/pages/dashboardData.js`. If
you add or rename a column there, update `STATUS_BY_COLUMN` and the CHECK
constraint to match, or inserts will fail.

## `documents`

Metadata about an uploaded file: `doc_type` (`cv`, `cover_letter`, or
`transcript`), the original `file_name` for display, and the `storage_path`
inside the bucket.

**No code reads or writes this table yet.** `src/pages/DocumentsPage.jsx` works
directly against Storage and derives the display name by stripping the UUID
prefix off the storage path. That means document type is not recorded anywhere,
and a file whose original name contained something that looks like a UUID
prefix will display oddly. Wiring the page to this table is tracked in
[ROADMAP.md](ROADMAP.md).

## Row-level security is the security boundary

Both tables have RLS enabled with a single `for all` policy scoped
`to authenticated`, checking `auth.uid() = user_id` in both `using` and
`with check`. Anonymous clients get nothing at all.

This is not belt-and-braces. It is the only thing separating users. In
`src/lib/applications.js`, `fetchApplicationsByColumn` runs `select('*')` with
**no client-side filter on `user_id`**. It returns every row the database is
willing to hand over, and the policy is what makes that set the caller's own
rows. Adding a `.eq('user_id', ...)` would be redundant; removing the policy
would expose every user's board.

The Storage bucket works the same way, keyed on the first path segment rather
than a column. That is described in [documents.md](documents.md).

## Troubleshooting

- **`42501 new row violates row-level security policy` on insert**, or a
  `select` that silently returns zero rows with no error, means the policies are
  not applied to this project. Re-run the RLS section of
  [`schema.sql`](../schema.sql).
- **`PGRST204 column "location" does not exist`** when adding an application
  means the project was set up from an older schema that predates the `location`
  column. Add it:

  ```sql
  alter table public.applications add column if not exists location text;
  ```

- **Empty board for a user who definitely has applications** usually means you
  are signed in as a different user than the one who created them. Rows are
  scoped per user with no shared or admin view.

## Future work

- `rejected` status has no board column, so those rows are invisible.
- The `documents` table is unused; document metadata is derived from the storage
  path instead.

See [ROADMAP.md](ROADMAP.md) for the full list.
