# Calendar

The calendar view at `/calendar`. Displays items in `/dashboard`.

The page is wrapped in `ProtectedRoute`, so a session is always present. It uses
the shared `Sidebar`, which also carries the sign-out control.

## Handling Time

The calendar uses the default javascript `Date` class to handle time, so any limitations that come with it will be here as well, mainly:
- Timezones other than the local time and UTC are not supported
- Date-times only, so making a date without a specified time will always start it at midnight, 12 AM.
However, these aren't that detrimental to our use case, except when the user wants to move to a different timezone.

## Database Access

This page uses the same database queries as `/dashboard` to retrieve applications. Refer to [dashboard.md] for more details.
However, instead of sorting them by status, we sort them by their due date, which will be used to place applications into their specific dates.

This page uses the hook `useTaskList` to retrieve tasks. Refer to [tasklist.md] for more details.
This is sorted the same way using `.dueDate`.

## Verification

Tests are stored in `CalendarPage.test.jsx`, remember to add new ones when new functionality is implemented.

For manual verification:
- `npm run codestyle` and `npm run build` pass.
- Ensure that all applications in the dashboard show up on the calendar.
- Make & delete some applications and see if those changes are reflected in the calendar.
- Repeat with tasks.

## Components

### CalendarEntry & CalendarTaskEntry
These two components included in `/components` display an entry in the calendar. The regular entry is used for applications whereas the task entries are used for tasks.
These contain an SVG icon + a paragraph containing their current status alongside the entry's title.
The colours are decided by their current status, this can be edited by editing the maps inside of the `.jsx` files.

## Future work

- Better visuals
- Toggle to a "week" view

See [ROADMAP.md](ROADMAP.md) for the full list.
