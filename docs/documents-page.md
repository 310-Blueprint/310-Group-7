# Documents page

## Summary

A responsive documents archive page has been added based on the supplied design mockup. It uses the same Tailwind theme and decorative artwork as the existing dashboard and authentication pages.

## New files

- `src/pages/DocumentsPage.jsx` defines the documents page layout.
- `src/components/DocumentCard.jsx` provides the reusable document row (icon, filename, download).
- `src/components/DocumentDropzone.jsx` provides the drag-and-drop upload area.
- `src/pages/documentsData.js` defines the seed/mock document list used before Supabase is wired up.

## Routing

- Added the documents route at `/documents` in `src/App.jsx`.
- The existing dashboard route remains at `/dashboard`, login at `/`.
- The documents page is not currently protected by an authenticated route.

## Documents interface

- Added the greeting and "Welcome to your documents archive" subtitle, matching the dashboard header pattern.
- Added a visual `+ Add document` placeholder button. It has no click behaviour yet.
- Added the documents panel, listing each document as a row with an icon, filename, and download action.
- Added the drop zone below the panel, with a dashed border and "Drop your documents here" prompt.
- Drop zone border highlights on drag-over and accepts dropped files, appending them to the in-memory document list. Uploaded files are not persisted anywhere yet — the list resets on refresh.
- Sidebar is intentionally left blank (an empty spacer `div` matching its width) pending the shared `Sidebar` component from a teammate.

## Artwork and icons

- Reused the existing beaver artwork, matched to the same position and layering (`z-0`) used on the dashboard.
- Replaced the placeholder emoji icons (document, download, plus) with the team's Figma-exported PNG icons, rendered via `<img>`.

## Styling

- The documents page uses a stacked mobile layout and a sidebar layout on desktop.
- Document rows truncate long filenames to prevent horizontal overflow.
- The documents panel, drop zone, icons, and text use responsive spacing and sizing.
- The documents panel uses the shared `bg-brand-blue` theme token, matching the "To apply" column colour on the dashboard rather than a one-off hex value.

## Remaining work

- Swap in the shared `Sidebar` component once it lands, replacing the spacer `div`.
- Replace `documentsData.js` seed data with a real fetch from Supabase storage.
- Persist dropped files to Supabase storage instead of only holding them in memory.
- Implement the Add document interaction (likely reusing the same drop/upload logic as the drop zone).
- Add automated component and interaction tests when the project adopts a React testing framework.
