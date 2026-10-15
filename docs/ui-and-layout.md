# UI and layout

Source folder layout, shared components, design tokens, artwork layering, and
responsive behaviour.
The feature documents cover what each page does;
this covers how everything looks and holds together.

## Source layout

Components and pages are grouped by feature, using the same names as the
feature documents. A component used by only one feature lives in that
feature's folder; one shared across features lives in `layout/`, `routing/`, or
`ui/`.

| Folder | Holds |
| --- | --- |
| `src/pages/<feature>/` | One route's page component, its page-only data, and its tests. Features: `auth`, `dashboard`, `documents`, `tasks`, `calendar`, `analytics`. |
| `src/components/<feature>/` | Components used only by that feature's pages. |
| `src/components/layout/` | The authenticated page frame: `PageShell`, `Sidebar`, `PageGreeting`, `Logo`. |
| `src/components/routing/` | Route guards and their loading screen. |
| `src/components/ui/` | Generic building blocks: `FormMessage`, `ModalDialog`, `ModalField`. |
| `src/hooks/` | All custom React hooks. |
| `src/lib/` | Supabase access and pure logic, with no React. |

When a feature-only component starts being used by a second feature, move it to
`ui/` (or `layout/`) rather than importing across feature folders. Tests sit
next to the file they cover, as `Name.test.jsx`.

## Shared components

Each one owns how it looks; the caller owns where it sits, with spacing coming
in via `className`.

**`AuthCard`** is the shared shell for the four auth pages: page background,
logo, heading, the card itself, and all four decorative images. Takes `title`
and `children`. A page using it only has to describe its own form.

**`Field`** is a label plus an input. `id` is required and must be unique on the
page: it wires the `<label htmlFor>` to the input, which is what makes clicking
the label focus the field and lets screen readers announce them as a pair.
Anything else you pass (`type`, `placeholder`, `autoComplete`, `value`,
`onChange`) is spread onto the `<input>`.

**`AuthButton`** is the yellow submit button. Defaults to `type="submit"` and to
the spacing every auth card wants.

**`AuthFooter`** is the "Already have an account? Log in" row. Takes `prompt`,
`linkText` and `to`.

**`FormMessage`** is an inline error or success line. Takes `tone` (`'error'` by
default, or `'success'`) and children. It exists as a component rather than a
repeated `<p>` because the ARIA role, `alert` for errors and `status` for
success, is the part that four separate pages would forget, and it is what makes
a screen reader announce the message when it appears.

**`Logo`** is the Pipeline wordmark: the beaver mark from
`src/assets/pipelinelogo.png` next to the word "Pipeline". `className` sets the
text size, which the wordmark inherits, and `markClassName` sizes the image. The
mark is `aria-hidden` with an empty `alt`, because the word beside it already
carries the name. It is shared by the sidebar, the auth card, and the
route-loading screen, so changing it changes all three.

**`Sidebar`** is the app navigation for the Dashboard, Documents, Task List,
Calendar, and Analytics pages, and carries the sign-out control.

**`PageShell`** provides the authenticated pages' shared background, sidebar,
and content frame. The Dashboard, Documents, Task List, and Analytics pages
supply their own headers, board or panel content, and decorative images as
children.

**`StatCard`** shows one headline number with a label and an optional caption.
`tone` takes a background token and defaults to `bg-white`.

**`ChartPanel`** is a titled white panel for a chart. Its `<section>` is
labelled by its own heading through `useId`, so several panels can share a page.

**`ChartBar`** is one labelled horizontal bar inside a `ChartPanel` list. It
renders an `<li>`, so place it in a `<ul>` or `<ol>`. The value is visible text
and the bar is `aria-hidden`, so a chart reads correctly without the graphic.
`fraction` is clamped to 0–1; its width is the one inline style, because
Tailwind cannot generate runtime percentages.

**`PageGreeting`** provides the shared page heading and description used by the
Dashboard, Documents, Task List, and Calendar pages. It renders the consistent
“Hello, Busy Beaver” greeting and accepts optional children for page-specific
loading, error, or status messages.

**`TaskColumn`** renders a Task List column with a heading and task count. The
three main columns contain sortable cards; Due Soon displays the same card
style in read-only form without edit or delete controls.

**`TaskCard`** displays a task's title, optional description, due date, and
optional edit/delete buttons. `SortableTaskCard` adds drag behaviour around it
without putting drag logic inside the visual card component.

**`RouteLoading`** is the placeholder shown by both route guards while the
session is being restored.

## Favicon and branding

`index.html` points at `/favicon.png`, served from `public/favicon.png`.

## The layering

The one genuinely non-obvious part of the auth pages. The heading sits behind
the card, the beaver is split across it, and the grass sits in front:

```
heading  ->  beaver body (z-0)  ->  card (z-10)  ->  grass + beaver arms (z-20)
```

Two things this depends on:

- **The beaver is a sibling of the card, not a child.** A child element can
  never paint behind its own parent's background, no matter its z-index. This is
  why the two beaver images live outside the card's `<div>`.
- **`z-index` needs a positioned element.** Everything in that chain carries
  `relative` or `absolute`; adding a z-index to a static element does nothing.

The two beaver images share `BEAVER_POSITION` so they cannot drift apart. They
are one piece of artwork split in half, and any difference in position shows up
as a visible seam. The dashboard, documents, and Task List pages use the same constant for
the same reason.

Nothing in the chain may have `overflow-hidden`, or the grass and beaver get
clipped where they hang past the card's edges.

## Colours and fonts

Design tokens live in `src/styles/preset.css`, inside Tailwind v4's `@theme`
block. Tailwind v4 has no JS config file; this is its equivalent. Defining
`--color-link` there generates `text-link`, `bg-link`, `border-link` and so on.

**`preset.css` is the single source of truth for the palette.** Do not copy hex
values into other files or into documentation, or they drift silently.

Use a token when a colour has a role that recurs: `--color-link`,
`--color-input-bg`, `--color-error`, `--color-success`. One-off decorative
values can stay inline.

Poppins is loaded in `index.html` and set as `--font-sans`, so it applies
everywhere without a `font-sans` class.

## Responsive layout

The smallest supported viewport width is 320px. Layout is keyed to Tailwind's
default breakpoints rather than to device names, because the navigation and the
column count change at different widths.

| Breakpoint | From | Behaviour |
| --- | --- | --- |
| base | 320px | Top navigation bar with icons only, stacked headers and actions, one board column |
| `sm` | 640px | Navigation labels appear, wider controls and typography, two board columns |
| `md` | 768px | Navigation becomes the vertical left sidebar |
| `xl` | 1280px | Four board columns, decorative artwork shown |

### Navigation

`Sidebar.jsx` is a horizontal bar above the page content on mobile and a
vertical left sidebar from `md`. Labels are hidden on the narrowest screens
while the icons remain visible, and appear from `sm`. Active and hover states are
preserved at every size.

### Dashboard

`DashboardPage.jsx` has no fixed minimum width and no fixed viewport height, so
the page grows and scrolls when its content is taller than the viewport.

- The heading and the Add application button stack on mobile, and the button
  fills the available width.
- Status columns go one, then two, then four, per the table above.
- Each status column has a minimum height so empty workflow stages remain
  visible as drop targets.
- The split beaver and grass artwork is hidden below `xl` to prevent it
  overlapping content.

### Task List

`TaskListPage.jsx` reuses `PageShell` and the Dashboard's responsive board
layout. At base width, cards appear in one column; at `sm` they appear in two,
and at `xl` all four visual columns appear side by side.

- The page heading and `+ Add task` button stack on mobile, with the button
  taking the available width. Loading and save errors appear below the heading.
- `TaskColumn.jsx` gives each column a coloured background, rounded corners,
  a task count, and minimum height so empty columns remain visible.
- To Do, In Progress, and Completed use `bg-brand-blue`, `bg-brand-pink`, and
  `bg-brand-green`. The read-only Due Soon column uses `bg-brand-yellow`.
- `TaskCard.jsx` keeps long task titles and descriptions wrapped. Edit and
  delete buttons have accessible labels and their own keyboard focus styles;
  using them does not start a card drag.
- The same split beaver and grass artwork used by the Dashboard is hidden
  below `xl` to avoid covering board content.

For task data, status changes, ordering, and completion confetti, see
[task-list.md](task-list.md).

### Analytics

`AnalyticsPage.jsx` reuses `PageShell` and the split beaver artwork, which is
hidden below `xl`. It has a heading but no header action.

- The four stat cards go one, then two, then four across, matching the board.
- The stage breakdown and funnel panels stack until `lg` and then sit side by
  side.
- Stage bars use each board column's own tone. The funnel uses `bg-link`
  because it is a single series, not the board's stages.
- The empty state fills the content area with its "Go to dashboard" link
  centred.

For the metrics themselves, see [job-analytics.md](job-analytics.md).

### Documents page

`DocumentsPage.jsx`, `DocumentCard.jsx`, and `DocumentDropzone.jsx` adjust to
narrow screens.

- The page header and the Add document button stack on mobile.
- The documents panel uses smaller padding and corner radii on mobile, and the
  shared `bg-brand-blue` token so it matches the "To apply" column.
- Long filenames truncate instead of creating horizontal overflow.
- Document and download icons scale down on small screens.
- The drop zone has a practical minimum height and responsive icon and text
  sizes.

### Calendar Page

`CalendarPage.jsx` has no fixed minimum width and no fixed viewport height, so
the page grows and scrolls when its content is taller than the viewport.

- The page heading is rendered through the shared `PageGreeting` component,
  with loading and application-fetch errors shown beneath the description.
- The calendar grids grow/shrink based on how many items are in it.
- If a row grows due to its item count, the other rows will shrink in response.
- Previous and next month controls use the shared dark, rounded button style,
  with visible direction icons and keyboard focus states.
- Same beaver display as the other pages.

### Authentication pages

The shared auth components support narrow screens without changing the form
structure, so this applies to login, sign-up, and both password reset pages at
once.

- Card padding decreases on mobile and returns to the original spacing on larger
  screens.
- Page headings use fluid font sizing.
- Primary buttons use the full available width on mobile.
- Footer text wraps cleanly.
- Decorative grass and beaver artwork scales down on mobile.
- Visible keyboard focus styles are provided for primary actions.

### Application modal

`ApplicationModal.jsx` stays usable on short and narrow screens.

- The dialog scrolls vertically when its form does not fit in the viewport.
- Outer padding, heading size, card spacing, and form gaps decrease on mobile.
- Form controls stay within the available width.
- The Submit button fills the modal width on mobile and returns to its compact
  size on larger screens.

The modal heading sits above and slightly overlapping the dark card to match the
original mockup, achieved with a negative margin on the card plus explicit
z-index stacking so the heading renders above rather than behind it.

### Task modal

`TaskModal.jsx` reuses the native `<dialog>` styling for both adding and editing
tasks. Its heading changes between "ADD TASK" and "EDIT TASK", above a dark card.

- The dialog scrolls vertically if the form is taller than the viewport.
- Padding, typography, and form gaps adapt to narrower screens. The submit
  button fills the available width on mobile.
- Inputs have visible focus styles; validation errors appear by the relevant
  fields, with an inline message for a failed database save.
- The submit button shows a saving state and is disabled while a request is in
  flight, preventing duplicate submissions.
- The status dropdown contains only the three stored task statuses. Due Soon
  is not an option because it is calculated from due dates.

## Conventions

- **Tokens for values, components for markup.** We deliberately avoid `@apply`
  and shared CSS classes. A CSS class carries only the styling, so a caller can
  still get the structure or the `htmlFor` and `id` pairing wrong. A component
  carries all three.
- **Long `className` strings are accepted.** Tailwind class lists routinely run
  past 100 characters, and breaking them up hurts readability more than it
  helps. Everything else stays within normal line lengths.
- **Icons are Figma-exported PNGs** rendered via `<img>`, kept in `src/assets/`.

## Verification

There are no automated tests. Alongside `npm run lint`, `npm run build`, and
`git diff --check`, review layouts by hand at representative widths:

- 375px mobile
- 768px tablet
- 1440px desktop

## Future work

- None as of yet.

See [ROADMAP.md](ROADMAP.md) for the full list.
