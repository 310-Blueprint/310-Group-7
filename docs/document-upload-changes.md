# Document Upload Changes

## Branch

`feature/implement-document-upload`

## Summary

This branch adds document upload support to the Documents page and connects uploads to Supabase Storage so files remain available after a page refresh.

## Code Changes

### `src/components/DocumentDropzone.jsx`

- Added a hidden file input that supports selecting multiple files.
- Added a label so users can browse for files from the Documents page.
- Kept drag-and-drop support.
- Added a check so empty drops are ignored.
- Reset the file input after selection so the same file can be selected again.

### `src/pages/DocumentsPage.jsx`

- Connected the page to the shared Supabase client.
- Uploads selected or dropped files to the `documents` Storage bucket.
- Generates a unique Storage path for each uploaded file.
- Adds successfully uploaded files to the visible document list.
- Uses Supabase public URLs for document downloads.
- Loads existing files from the `documents` bucket when the page opens.
- Removes the generated numeric prefix from filenames displayed in the interface.
- Changed the `+ Add document` control to open the file picker.

## Supabase Setup

The project requires these local environment variables in `.env`:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Supabase must contain a Storage bucket named `documents`. The bucket is currently public so the generated public download URLs work.

For the current anonymous testing setup, Storage policies must allow both uploading and listing files:

```sql
create policy "Allow file uploads"
on storage.objects
for insert
to anon
with check (bucket_id = 'documents');

create policy "Allow listing"
on storage.objects
for select
to anon
using (bucket_id = 'documents');
```

The anonymous policies are suitable only for temporary testing. Production use should require authenticated users and restrict access to each user's own files.

## Verification

- `npm run lint` passes.
- Uploaded files appear in Supabase Storage under the `documents` bucket.
- Existing uploaded files are loaded back into the Documents page after refreshing.

## Current Limitations

- Authentication is not connected yet, so the current Storage policies allow anonymous access.
- The bucket contents are listed from the root directory and are not associated with individual users.
- The initial sample documents remain local seed data and are not stored in Supabase.
- There is no upload progress indicator or user-facing upload error message yet.
