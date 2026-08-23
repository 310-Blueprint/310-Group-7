# Roadmap

Everything known to be missing or unfinished, in one place. Each item appears
here exactly once. The feature documents repeat only the handful of items that
belong to them, and link back here.

This is documentation, not a tracker. Anything actually being worked on should
have a GitHub issue; see [CONTRIBUTING.md](../CONTRIBUTING.md).

## Where a new contributor should start

The items under [Housekeeping](#housekeeping) are small, self-contained, and
need no Supabase access beyond a working local setup. The greeting fix under
[Gaps in shipped features](#gaps-in-shipped-features) is a good first change
that touches real application code: `useAuth()` already exposes the signed-in
user, so it is a genuine improvement in a few lines.

## The largest gap: no tests

The project has **no test framework and no automated tests**. Nothing is
configured in `package.json`, and there is no `test` script.

This is the single biggest piece of outstanding work, and it blocks the
contribution workflow in [CONTRIBUTING.md](../CONTRIBUTING.md), which requires
that changes ship with tests. Until a framework is adopted, verification is
manual, plus `npm run lint` and `npm run build`.

Suggested starting point: Vitest with React Testing Library, which fits a Vite
project without extra build configuration. The highest-value first targets are
the pure logic that currently has no coverage at all:

- `findContainer` and the drag handlers in `DashboardPage.jsx`.
- The status and column mapping in `src/lib/applications.js`.
- `toDisplayName` and the UUID-prefix regex in `DocumentsPage.jsx`.
- Form validation in `ApplicationModal.jsx`.
- Both route guards, which are small but security-relevant.

## Gaps in shipped features

### Correctness and safety

- **Dashboard failures are invisible.** A failed drag save, add, or delete in
  `DashboardPage.jsx` only reaches `console.error`, so the board can display
  state that never reached the database until the page is refreshed. The
  documents page already handles this properly with an inline `FormMessage`;
  the dashboard should do the same.
- **No confirmation before deleting** an application or a document. Both delete
  immediately on click.
- **No `*` catch-all route**, so an unknown URL renders a blank page. See
  [authentication.md](authentication.md).

### Data model

- **`rejected` status has no board column.** The database CHECK constraint
  allows it, but `src/pages/dashboardData.js` defines four columns and
  `STATUS_BY_COLUMN` has no entry for it, so a row with that status is silently
  invisible. Either add a fifth column or drop the value from the constraint.
  See [database.md](database.md).
- **The `documents` table is unused.** [`schema.sql`](../schema.sql) creates it,
  but `DocumentsPage.jsx` works directly off Storage and derives display names
  from the path, so `doc_type` is not recorded anywhere and the interface cannot
  distinguish a CV from a transcript. See [documents.md](documents.md).

### User experience

- **The greeting is hardcoded.** Both `DashboardPage.jsx` and `DocumentsPage.jsx`
  render "Hello, Stranger" even though `useAuth()` exposes the signed-in user.
- **No user profile.** There is no `/profile` route and no way to change a
  display name, email, or password while signed in. Password reset only works
  through the signed-out email flow.
- **Applications cannot be edited** after they are created, only moved between
  columns or deleted.
- **New applications always land in "To apply"**, with no way to choose a
  different starting column from the modal.
- **Signed download URLs expire.** They are minted when the documents page loads
  and last one hour, so a tab left open longer has dead links until it is
  refreshed. They should be minted on click. See [documents.md](documents.md).
- **No upload progress indicator**, and no way to rename a stored document.
- **`/` doubles as the login page.** When a landing page is built it takes `/`
  and login moves to `/login`: one line in `src/App.jsx`, plus the `to` props on
  the `AuthFooter`s.

## Housekeeping

- Remove `@dnd-kit/dom` from `package.json`. It is declared but imported
  nowhere.
- Remove `src/App.css`. It is tracked but imported nowhere.
- Remove `public/favicon.svg`. `index.html` points at `favicon.png` instead.
- Remove `src/assets/leaf1.png`, `leaf2.png`, and `logo.png`, which are imported
  nowhere and are around 500 KB of dead weight in the repository.
- Re-export `beaver.png` (651 KB) and `beaverArms.png` (205 KB) as SVG, like the
  grass already is. They are most of the bundle. See
  [ui-and-layout.md](ui-and-layout.md).
- Add Prettier and an `.editorconfig`. Formatting is inconsistent across the
  codebase: most files use two-space indentation and no semicolons, while
  `src/components/ApplicationModal.jsx` uses four spaces, semicolons, and double
  quotes.

## Planned for A2

From the project proposal. None of these have been started, and each is large
enough to be broken into several issues.

| Feature | Notes |
| --- | --- |
| Calendar for interview scheduling | The `applications` table already has `due_date` to build from. |
| Task management | Reminders and to-dos attached to an application. |
| Notifications and reminders | Depends on the calendar and task work. |
| Job search and filtering | Searching and filtering across the board. |
| Job analytics | Response rates, time-to-interview, and similar, over a user's own applications. |
| Saved internships | Roles saved to apply to later, distinct from applications already in progress. |
| AI CV and cover letter tailorer | The original motivation for the project: tailoring stored documents to a specific role. Needs the `documents` table wired up first so document type is known. |

## Documentation debt

- `README.md` documents an `npm run test` script that does not exist, names the
  environment file as `.env` where the code uses `.env.local`, describes the
  kanban columns as "In Progress, Accepted, Rejected" rather than the four that
  exist, and still carries an unedited Vite scaffold section under a second
  top-level heading.
- `CONTRIBUTING.md` names the environment variable `VITE_SUPABASE_ANON_KEY`
  rather than `VITE_SUPABASE_PUBLISHABLE_KEY`, contains unresolved
  "[Team to confirm]" placeholders, and points at issue templates that do not
  exist in the repository.
- There is no `.github/` directory, so there are no bug report or feature
  request templates, no pull request template, and no CI workflows.
- The project is named four different ways across the repository: "Pipeline"
  (the product), `310-group-7` (`package.json`), "Tech-A" (the GitHub
  organisation), and "310-Blueprint" (`LICENSE`).
