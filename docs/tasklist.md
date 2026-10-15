# Task List

The task-management kanban board at `/tasks`. Tasks can be created, edited,
deleted, reordered within a column, or dragged between columns to update their
status, using [`@dnd-kit`](https://dndkit.com/). Task data is held in React
state and loaded from and saved to the Supabase `tasks` table, so it persists
across refreshes and signed-in devices.

The page is wrapped in `ProtectedRoute`, so users must be signed in. Task data
is scoped to the signed-in user through Supabase row-level security, rather
than a client-side `user_id` filter; see [database.md](database.md).

## The board model

`src/pages/tasks/TaskListPage.jsx` defines the task columns and their theme tokens:

| Column | Status stored in Supabase | Theme token |
| --- | --- | --- |
| To Do | `todo` | `bg-brand-blue` |
| In Progress | `in_progress` | `bg-brand-pink` |
| Completed | `completed` | `bg-brand-green` |
| Due Soon | **Not stored as a status** | `bg-brand-yellow` |

The three main columns are defined in `TASK_COLUMNS`. `DUE_SOON_COLUMN` is a
separate, read-only view of tasks that already exist in the other columns.

Board data lives in `tasks` state, shaped `{ status: [task] }`. It begins with
empty arrays and is loaded in a `useEffect` when the page mounts. The page
tracks `isLoading` and `loadError` while the request is in flight. Each column
shows its task count.

Tasks have the UI shape `{ id, title, description, dueDate, status, position }`.
The `position` field determines the order of tasks within each saved status.

## The data layer

`src/lib/tasks.js` is the only Task List module that directly reads or writes
the Supabase `tasks` table:

- `fetchTasksByColumn(columns)` selects accessible rows, sorts them by
  `position` (then `created_at`), and groups them by status for React state.
- `insertTask(data)` creates a row and returns the saved task with its generated
  database ID.
- `updateTask(id, changes)` updates an existing task's fields, including its
  status and position when supplied, and returns the saved row.
- `deleteTask(id)` deletes a task by its unique ID.
- `updateTaskPositions(status, tasks)` saves the status and numerical position
  of each task in a column after a drag.

The `toTask()` helper maps Supabase's `due_date` field to the frontend's
`dueDate` name and converts a null description to an empty string. The database
provides default values for `id`, `user_id`, `created_at`, and `updated_at`;
`user_id` defaults to `auth.uid()`. The `updated_at` trigger keeps modification
timestamps current. The RLS policy restricts reading and modifying rows to
their owner. See [`schema.sql`](../schema.sql) and [database.md](database.md).

## Adding a task

The `+ Add task` button opens `src/components/tasks/TaskModal.jsx`, which is a popup
window that has multiple fields, both compulsory and optional for the user to
fill out.

**`TaskModal` props**

- `isOpen` (bool) controls the native dialog's visibility.
- `onClose` (func) closes the popup.
- `onSubmit` (async func) receives the task fields and waits for the save.
- `taskToEdit` (task or null) supplies existing values when editing.

The form contains a required title and status, plus an optional description
and due date. The title must not be blank, and the selected status must be one
of the three stored statuses. The due date uses a native date input and is
submitted as `YYYY-MM-DD` or `null`.

`TaskListPage.handleAddTask` checks the selected status, assigns a position at
the end of that column, and calls `insertTask`. Unlike the Dashboard's
application form, a task may start in any of the three main columns. The
Supabase-generated task is appended to React state only after the insert
succeeds, and the modal closes. While saving, the form blocks repeat submits.
The Add Task button is disabled while the initial fetch is loading or has
failed.

The modal is mounted conditionally. Closing it without saving discards the
unsaved form state when it unmounts.

## Editing a task

Each draggable task card has a pencil/edit control. Clicking it looks up the
task using `findContainer`, stores it in `editingTask`, and opens `TaskModal`
with its current field values.

`handleUpdateTask` calls `updateTask(id, changes)` to save the edited title,
description, due date, and status. If the status changes, the task is placed at
the end of the destination column. Once Supabase confirms the update, React
replaces the task in its current column or moves it to the new column. The
existing ID is preserved rather than creating a duplicate task. A failed save
is caught by the modal so the user can retry.

## Deleting a task

Each editable card has a trash control. `handleDeleteTask` calls `deleteTask`
first and removes the card from React state after Supabase confirms success.
There is no confirmation popup. If the database request fails, the card is
left in place, and the error is logged and stored in `saveError`.

Deleting a task also removes it automatically from Due Soon, because that view
is derived from the same task state rather than a separate list of records.

## Drag and drop

`@dnd-kit` identifies draggable and droppable elements by ID; the Task List
tracks column membership using `findContainer(tasks, id)`:

- If the ID matches a main column, it identifies that column's drop area.
- Otherwise, the helper searches the three task arrays for the task ID.

The components are separated as follows:

- **`src/components/tasks/TaskCard.jsx`** displays a task's title, description, due
  date, and optional edit/delete controls without implementing dragging.
- **`src/components/tasks/SortableTaskCard.jsx`** wraps `TaskCard` with `useSortable`,
  applies drag transforms, and forwards edit/delete callbacks. Those buttons
  stop event propagation so they can be clicked without starting a drag.
- **`src/components/tasks/TaskColumn.jsx`** uses `useDroppable` and a
  `SortableContext` with `verticalListSortingStrategy` for the editable columns.
  Due Soon uses plain `TaskCard` components and does not support editing or
  dragging tasks into it.
- **`DndContext`** configures a pointer sensor with an 8 px activation distance
  and a keyboard sensor for accessible dragging. `DragOverlay` renders a
  floating copy of the active task.

`handleDragStart` records the dragged task for the overlay. `handleDragEnd`
calculates its destination, reorders within the same column or moves it to a
new one, and updates React state immediately. When inserting into another
column, it uses the drop target and pointer location to place the task,
including at the end when dropped below the last card.

After the drop, `updateTaskPositions` saves the affected column's order. If a
task changes columns, both the source and destination columns are persisted.
A ref prevents overlapping drag-position saves. If saving fails, the handler
tries to reload the last saved order from Supabase. Database position updates
are separate requests, not a single atomic transaction.

## Due Soon

Due Soon is a **calculated, read-only column**, not a fourth database status.
`getDueSoonTasks(tasks)` derives its contents from the three main columns.

It includes only incomplete tasks with a due date between **today and seven
days from today, inclusive**. Tasks without a due date, overdue tasks, and
completed tasks are excluded. Dates are parsed as local calendar dates, and
the resulting cards are sorted from earliest to latest due date.

A task displayed in both To Do and Due Soon is still **one** task and one
Supabase row. Due Soon updates when the underlying React task state changes,
so editing a due date, completing a task, or deleting it updates the view.

## Confetti

Moving an existing task into **Completed** fires `canvas-confetti`, reusing the
Dashboard's two-burst, brand-colour celebration. The animation uses
`disableForReducedMotion: true` to respect the user's reduced-motion setting.

Confetti fires after a successful database save when a task moves into
Completed through drag-and-drop or the edit popup. It does not fire when the
page loads, when an already completed task is reordered, or when a task leaves
Completed.

## Dependencies

- `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` for dragging
  and sorting.
- `@supabase/supabase-js` through the shared `src/lib/supabaseClient.js`.
- `canvas-confetti` for the completion celebration.

## Layout and styling

Column colours use the shared Tailwind brand theme tokens. `PageShell` provides
the page layout and decorative beaver/grass artwork. The board uses responsive
one-, two-, and four-column layouts; see
[ui-and-layout.md](ui-and-layout.md).

## Verification

There are no dedicated automated Task List tests in the inspected project.
Verify manually:

- Run `npm run lint` and `npm run build`.
- Create a task in each of the three main statuses; refresh and confirm they
  remain in the selected columns.
- Edit a title, description, due date, and status; refresh and verify changes
  persist without creating another row.
- Delete a task; refresh and confirm it does not return.
- Reorder within a column and move a task between columns, including into an
  empty column and to the very bottom; refresh to check saved positions.
- Check Due Soon for a task due within seven days; verify completed and overdue
  tasks are excluded and that Due Soon cannot receive drops.
- Move a task into Completed by dragging and by editing its status; check that
  confetti fires only for a new completion.
- Sign in as a different user and confirm the first user's tasks are not
  accessible through the application.
- Simulate a failed save and confirm the board does not silently treat an
  unsaved change as permanent.

## Future work

- `updateTaskPositions` sends separate row updates, so a partial failure can
  leave column positions inconsistent. An atomic reorder operation would
  improve reliability.
- Concurrent edits or drag operations from multiple sessions are not
  synchronised in real time; refreshing reloads the saved state.
- Task errors should remain visible and actionable, with a retry option where
  appropriate.
- The Due Soon calculation is recomputed on React renders, not by a midnight
  timer, so leaving the page open across a date change may require refreshing.

See [ROADMAP.md](ROADMAP.md) for the wider project roadmap.
