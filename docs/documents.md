# Documents

The documents archive at `/documents`. Users upload, download, and delete files
(CVs, cover letters, transcripts) which are stored in a private Supabase Storage
bucket.

The page is wrapped in `ProtectedRoute`, so a session is always present. It uses
the shared `Sidebar`, which also carries the sign-out control.

## How storage is laid out

The `documents` bucket is **private**. Every file lives at
`<user id>/<uuid>-<original filename>`, because the storage policy only checks
the first path segment against `auth.uid()`. The UUID keeps two uploads of the
same filename apart.

That single design choice drives most of the code:

- **Uploads must include the `${user.id}/` prefix** or the policy rejects them.
  Uploading to the bucket root is refused outright.
- **Listing uses `list(user.id)`**, not `list('')`.
- **Downloads use `createSignedUrls(paths, ttl, { download: true })`.**
  `getPublicUrl` returns a valid-looking URL that returns a 400 on a private
  bucket, so nothing errors until the user clicks, which is the worst way to
  fail.
- **`{ download: true }` sets `Content-Disposition: attachment`**, which is what
  makes `DocumentCard`'s `<a download>` work. Browsers ignore that attribute on
  cross-origin links otherwise.
- **Signed URLs are built from a `Map` keyed on path**, not zipped by index. The
  response order is not guaranteed to match the request, and zipping would pair
  names with the wrong URLs without ever raising an error.
- **The display name is derived by stripping the UUID prefix.** The regex is
  anchored to the UUID shape, so a real filename like `2024-cv.pdf` survives
  intact.

Supabase drops an `.emptyFolderPlaceholder` marker into a folder that would
otherwise be empty; the page filters it out of the list.

## The pieces

| File | Role |
| --- | --- |
| `src/pages/DocumentsPage.jsx` | Loading, uploading, downloading, deleting. |
| `src/components/DocumentCard.jsx` | One document row: icon, name, download, delete. |
| `src/components/DocumentDropzone.jsx` | Drag-and-drop area and file picker. |

## Loading

On mount the page lists the user's folder, filters the placeholder, and mints
signed URLs for every file in **one** batched request rather than one per file.
While that is in flight it shows a loading message; with nothing stored it shows
an empty state; on failure it shows an inline message via `FormMessage`.

## Uploading

`DocumentDropzone` accepts both drag-and-drop and a file picker. It supports
selecting multiple files at once, ignores empty drops, and resets the file input
after selection so the same file can be picked again. The `+ Add document`
button opens the picker.

Each file is uploaded to its own generated path, then signed, then appended to
the visible list. Uploads are processed one at a time; if some succeed and
others fail, the successful ones still appear and an inline message names the
files that failed.

## Downloading

Each row's download control is an `<a download>` pointing at the file's signed
URL. URLs are minted when the page loads and last one hour, so a tab left open
longer than that has dead links until it is refreshed. This is a known
limitation, tracked in [ROADMAP.md](ROADMAP.md).

## Deleting

`DocumentCard` takes an `onDelete` prop, called with the document's `id`. That
`id` is the full `<user id>/<stored name>` storage path, not Storage's internal
object id, because `remove()` needs the path.

`handleDeleteDocument` calls `storage.remove([id])` and only updates the visible
list once that succeeds, so a failed delete surfaces an inline message rather
than silently removing a row that still exists. There is no confirmation step
before deleting.

The storage policy rejects anything outside the signed-in user's folder, so this
cannot delete someone else's file even if the id were tampered with.

## Supabase setup

Run [`schema.sql`](../schema.sql), which creates the private `documents` bucket
and its per-user policy. See [database.md](database.md) for the rest of the
schema, and [authentication.md](authentication.md) for the environment
variables.

The relevant policy is:

```sql
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
```

Earlier versions of this project used a **public** bucket with anonymous
policies as a temporary testing setup. Files uploaded under that scheme sat at
the bucket root with no user folder. They are unreachable under the current
policy and were deleted from the Supabase dashboard. Do not reintroduce an
anonymous policy: `to authenticated` is what keeps signed-out clients out of the
bucket entirely.

## The `documents` table

[`schema.sql`](../schema.sql) creates a `documents` table for file metadata
(`doc_type`, `file_name`, `storage_path`), but **no code reads or writes it
yet**. This page works directly off Storage and derives everything from the
path, which is why there is no notion of document type in the interface.

## Verification

There are no automated tests. Verify by hand:

- `npm run lint` and `npm run build` pass.
- Upload by drag-and-drop and by the file picker, including multiple files at
  once.
- Confirm uploaded files appear in the `documents` bucket in the Supabase
  dashboard, under a folder named for the user id.
- Refresh and confirm the files load back.
- Download a file and confirm it saves rather than opening in a tab.
- Delete a file and confirm it does not reappear after a refresh.
- Sign in as a second user and confirm the first user's files are not visible.

## Future work

- Signed download URLs are minted at page load and expire after an hour; they
  should be minted on click.
- There is no upload progress indicator.
- There is no way to rename a document.
- There is no confirmation step before deleting.
- Document metadata is derived from the storage path rather than stored in the
  `documents` table, so document type is not recorded.

See [ROADMAP.md](ROADMAP.md) for the full list.
