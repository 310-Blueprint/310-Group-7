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

## Documentation and repository setup

- **No CI workflows.** `.github/` holds the issue and pull request templates but
  no GitHub Actions. Lint and build are run by hand by the author and again by
  the reviewer. A workflow running `npm run lint` and `npm run build` on every
  pull request would catch breakage before review, and is the natural place to
  hang a test suite once one exists.
- **Sonar and Snyk are configured outside the repository.** There is no
  `sonar-project.properties` and no Snyk configuration tracked here, so the
  analysis setup is not reproducible by a new contributor from the repository
  alone.
- **The live Netlify URL is not recorded** in the README's deployment section.
- **No release has been tagged yet.** The README points at the Releases page and
  the project follows semantic versioning, but nothing is published there.
- **The wiki contributions page has empty issue-number columns.** Contributions
  should tie back to tracked issues.
- `package.json` still carries the scaffold name `310-group-7` rather than
  `pipeline`. Cosmetic, but it is what appears in build output.
