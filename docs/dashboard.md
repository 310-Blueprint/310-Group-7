# Dashboard

The kanban board at `/dashboard`. Application cards are dragged within a column
to reorder them and between columns to change their status, using
[`@dnd-kit`](https://dndkit.com/). Board state lives in React state and is loaded
from and saved to the Supabase `applications` table, so it persists across
devices rather than just one browser.

The page is wrapped in `ProtectedRoute`, so a session is always present. Data is
scoped to the signed-in user by row-level security, not by client-side
filtering; see [database.md](database.md).

## The board model

`src/pages/dashboard/dashboardData.js` defines the four workflow stages and nothing else:

| Column | Theme token |
| --- | --- |
| To apply | `bg-brand-blue` |
| Applied / Waiting | `bg-brand-pink` |
| Interview | `bg-brand-green` |
| Offer | `bg-brand-yellow` |

Board data lives in `items` state, shaped `{ columnId: [application] }`. It
starts empty and is loaded from Supabase in a `useEffect` on mount. A small
"Loading your applications" line, or an error line, shows while that is in
flight.

The database calls the columns something else (`to_apply`, `applied`, and so on)
and `position` orders cards within a column. All of that translation lives in
`src/lib/applications.js`, documented in [database.md](database.md).

## Filtering and sorting

The dashboard has a filter modal triggered by the filter button in the header.
It accepts text filters for `company`, `location`, and `role`, and a due-date
sort option with these values:

- `""` = default board order
- `"asc"` = earliest due date first
- `"desc"` = latest due date first

The actual matching happens in `DashboardPage.jsx`:

- `matchesText(value, filter)` trims the filter, lowercases both strings, and
  returns `true` when the field is empty or when it includes the search text.
- `matchesFilters(application, filters)` applies the company, location, and role
  checks together with logical AND semantics.
- `filterItems(items, filters)` runs each column through those rules, then re-sorts
  the visible items by `dueDate` when `sortOrder` is set.

This means the filter is purely client-side and only affects the visible
board; it does not change the database rows or the persisted status ordering.

## The data layer

`src/lib/applications.js` is the only file that talks to the `applications`
table:

- `fetchApplications()` loads all rows the caller can see and returns them in
  `position` order.
- `insertApplication({ userId, ...fields })` inserts a new row including
  `user_id`, and returns it mapped to the UI's `{ id, company, location, role,
  dueDate }` shape.
- `deleteApplication(id)` deletes one row.
- `updateApplicationPositions(status, applications)` persists `status` and
  `position` for a whole column after a drag, one update per row.

## Adding an application

The `+ Add application` button opens `ApplicationModal`.

**`ApplicationModal` props**

- `isOpen` (bool) controls visibility.
- `onClose` (func) is called when the overlay or the close control is clicked.
- `onSubmit` (func) is called on submit with
  `{ company, location, role, dueDate }`.

All four fields are required, validated on submit, with inline error messages
under each field. `location` is title-cased by `capitaliseWords` before it is
passed on. `dueDate` uses a native `<input type="date">`, so the browser
guarantees a valid value in `YYYY-MM-DD` format and there is no manual date
parsing; that string goes straight into the `due_date` date column.

The form resets after a successful submit. Closing without submitting does
**not** clear the fields, so in-progress input is not lost if the modal is
closed by accident.

`DashboardPage.handleAddApplication` then calls `insertApplication` with
`status` fixed to the first column ("To apply") and
`position = items[status].length`, so a new card lands at the bottom of that
column. The returned row is appended to state.

## Deleting an application

Each card carries a delete control. `handleDeleteApplication` removes the card
from local state first and then calls `deleteApplication`, so the board responds
immediately. There is no confirmation step, and a failed delete only logs to the
console, which means the card stays gone from the view until a refresh brings it
back. Both are tracked in [ROADMAP.md](ROADMAP.md).

## Drag and drop

`@dnd-kit` does not know about "columns"; it only knows about draggable and
droppable ids. The board tracks membership itself via a small
`findContainer(items, id)` helper:

- If `id` is itself a column title (a key of `items`), that id **is** the
  container. This happens when hovering over an empty column's droppable area.
- Otherwise it searches each column's array for an application with that id.

The pieces:

- **`src/components/dashboard/SortableApplicationCard.jsx`** is a thin wrapper around
  `ApplicationCard` that calls `useSortable` and applies the drag transform and
  listeners to a wrapping `<div>`. This keeps `ApplicationCard` purely
  presentational, with no drag-related props.
- **`src/components/dashboard/StatusColumn.jsx`** is the drop target. `useDroppable({ id })`
  sits on the column's content `<div>` so an empty column can still be dropped
  into, and the card list is wrapped in a `SortableContext` with
  `verticalListSortingStrategy`.
- **`DndContext`** in `DashboardPage` uses `PointerSensor` with an 8px activation
  distance, so a click is not mistaken for a drag, and `KeyboardSensor` for
  keyboard accessibility.

The event handlers:

- `onDragStart` records both the dragged application, for the `DragOverlay`, and
  which column it started in, which is needed later to know which columns to
  persist.
- `onDragOver` moves the card into the hovered column's array in local state when
  that column differs from its current one. This is what makes cross-column
  dragging feel live instead of only updating on drop.
- `onDragEnd` reorders the destination column if needed, then calls
  `updateApplicationPositions` for it, and for the origin column too if the card
  changed columns, because the remaining cards' positions shifted.

`DragOverlay` renders a floating, slightly rotated copy of the card being
dragged, so it is not visually clipped by column boundaries.

Persistence happens once, in `onDragEnd`, never on every `onDragOver` frame.

## Confetti

Dropping a card into the **Offer** column fires `canvas-confetti`: two bursts at
opposing angles, in the brand palette, with `disableForReducedMotion: true` so it
respects the operating system's reduced-motion setting.

It only fires when the card actually *changed* column into Offer, not when
reordering cards already there.

## Dependencies

- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` for drag and drop.
- `canvas-confetti` for the offer celebration.

## Layout and styling

Column colours come from the shared theme tokens in `src/styles/preset.css`,
never from hardcoded hex values. Responsive behaviour, including the one, two,
and four column layouts and the decorative beaver artwork, is covered in
[ui-and-layout.md](ui-and-layout.md).

## Verification

There are no automated dashboard tests. Verify by hand:

- `npm run lint` and `npm run build` pass.
- Reorder within a column, move a card across columns, and confirm the visible
  list updates without changing the underlying stored order until a drag ends.
- Use the filter modal to narrow by company/location/role, then clear the
  filters and confirm the full board returns.
- Sort by earliest and latest due date and confirm the card order changes within
  each column.
- Add an application through the modal and confirm it appears in "To apply" and
  survives a refresh.
- Drag a card into Offer and confirm the confetti fires.
- Delete a card and confirm it does not reappear after a refresh.

## Future work

- Failed saves after a drag, add, or delete only reach `console.error`, so the
  board can show state that never reached the database.
- New applications always land in "To apply", with no way to choose a different
  starting column.
- There is no confirmation step before deleting a card.
- Cards cannot be edited after they are created.

See [ROADMAP.md](ROADMAP.md) for the full list.
