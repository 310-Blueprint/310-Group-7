# Job Analytics

The read-only analytics dashboard at `/analytics`. It turns the applications on
the kanban board into concrete numbers: how many applications are tracked and
sent, how they are spread across the stages, and how often they convert from
Applied to Interview and from Interview to Offer.

The page is wrapped in `ProtectedRoute`, so a session is always present. Nothing
on it can be edited; every figure is derived from the `applications` table,
which is scoped to the signed-in user by row-level security. See
[database.md](database.md).

## What is shown

| Metric | Meaning |
| --- | --- |
| Applications tracked | Every application row, in any status. |
| Applications sent | Every application that has moved past To apply. |
| Applied → Interview | Of the applications sent, the share that reached Interview. |
| Interview → Offer | Of the applications that reached Interview, the share that reached Offer. |
| Applications by stage | The count in each board column now, and its share of everything tracked. |
| Application funnel | How many applications reached Sent, Interview, and Offer, with the step-to-step rate under each later stage. |

A rate with nothing to divide by, such as Interview → Offer before any
application has reached Interview, is shown as `—` with a hint, not `0%`.
`0%` is reserved for "there were candidates and none converted".

## How stage progress is inferred

The `applications` table stores only an application's **current** `status`.
There is no record of the stages it passed through or when. Analytics therefore
treats the current status as the **furthest stage reached**: a card in Offer
counts towards Sent, Interview, and Offer.

`STAGE_RANK` in `src/lib/analytics.js` encodes that order:

| `status` | Rank | Counts towards |
| --- | --- | --- |
| `to_apply` | 0 | tracked only |
| `applied` | 1 | Sent |
| `rejected` | 1 | Sent |
| `interview` | 2 | Sent, Interview |
| `offer` | 3 | Sent, Interview, Offer |

Any other or missing `status` has no rank and counts towards no stage.
**UPON ADDING A NEW STATUS**, confirm whether it needs a new rank and how it should 
be handled by countReached.

Two consequences follow:

- **Moving a card backwards changes history.** Dragging a card from Interview
  back to Applied / Waiting removes it from the Interview count, because the
  earlier stage is not stored anywhere.
- **`rejected` is counted conservatively.** It is allowed by the schema but has
  no board column, so nothing in the UI produces it today. If a row has it, the
  application was sent but where it stopped is unknown, so it counts towards
  Sent only. It has no bar in the stage breakdown, so the breakdown shares can
  sum to less than 100%.

The stage breakdown and the funnel answer different questions. The breakdown
counts applications **currently in** each column; the funnel counts applications
that **reached** each stage, including those that went further.

## The data layer

`src/lib/analytics.js` holds pure functions with no React or Supabase
dependency, so it can be unit tested in isolation once a test framework exists.
Board columns are passed in rather than imported.

- `buildAnalyticsSummary(applications, columns)` returns
  `{ total, sent, stages, funnel, conversions }` and is the only entry point the
  page uses.
- `countByStage(applications, columns)` returns
  `{ id, title, tone, count, share }` per column, in board order.
- `buildFunnel(applications)` returns `{ id, title, count }` for each entry in
  `FUNNEL_STAGES`.
- `countReached(applications, status)` counts applications at or beyond a stage.
- `toRate(numerator, denominator)` returns a fraction, or `null` when the
  denominator is zero.
- `formatPercentage(rate)` rounds to a whole percentage, or returns `—` for
  `null`.

`src/hooks/useApplicationAnalytics.js` fetches rows once on mount through
`fetchApplications()` in `src/lib/applications.js`, which remains the only module
that queries the table. It memoises the summary and returns
`{ summary, isLoading, loadError }`. Its `columns` argument defaults to
`COLUMNS` from `src/pages/dashboard/dashboardData.js`; a caller passing its own must pass
a stable array, or the summary is recomputed on every render.

## Freshness

Data is loaded when the page mounts. Navigating to Analytics from any other page
remounts it, so changes made on the board are reflected on the next visit or
refresh. There is no live subscription. `AnalyticsPage` keys its content on the
user id, so signing in as a different user starts from a clean state.

## Page states

`AnalyticsPage` renders exactly one of the following under its header:

| State | Shown |
| --- | --- |
| Loading | A "Loading your analytics…" line in the header. |
| Load failed | A "Couldn't load analytics" alert in the header. The error is also logged. |
| No applications | `AnalyticsEmptyState`, with a link to the dashboard. |
| One or more applications | `AnalyticsDashboard`. |

An account whose applications are all in To apply is **not** empty: it shows
the dashboard, with `—` for both rates and a prompt in the funnel panel to move
an application to Applied / Waiting.

## Components

- **`AnalyticsDashboard`** composes the four stat cards and the two charts from
  a summary. It owns layout only.
- **`StatCard`** shows one headline number with a label and optional caption.
- **`ChartPanel`** is the titled white panel that frames each chart, labelled
  for screen readers by its heading.
- **`ChartBar`** is one labelled horizontal bar. The count and percentage are
  visible text, so the bar itself is `aria-hidden`.
- **`StageBreakdownChart`** draws one `ChartBar` per board column, in the
  column's own brand tone.
- **`ConversionFunnel`** draws one `ChartBar` per funnel stage in `bg-link`,
  scaled against Sent so the bars narrow like a funnel.
- **`AnalyticsEmptyState`** is the "Add some applications to see your
  analytics" panel.

## Dependencies

None beyond what the app already uses. The charts are plain elements styled with
Tailwind and the brand tokens in `src/styles/preset.css`, not a charting
library. Bar widths are the only inline styles, because Tailwind cannot generate
classes for arbitrary runtime percentages. If richer charts are needed, adopting
a charting library is a team decision; see
[CONTRIBUTING.md](../CONTRIBUTING.md#code-quality-and-security).

## Layout and styling

The page uses `PageShell` and the same split beaver artwork as the other
authenticated pages. Stat cards go one, two, then four across; the two chart
panels sit side by side from `lg`. See [ui-and-layout.md](ui-and-layout.md).

## Verification

Run `npm test` for automated coverage. `src/lib/analytics.test.js` covers the
aggregation: reached-stage counting, rejected and unknown statuses, `null`
rates for empty denominators, percentage formatting, the stage breakdown, the
funnel and the summary. `src/pages/analytics/AnalyticsPage.test.jsx` covers the
loading, error and empty states, the stat cards and their captions, both
charts, and refetching when the signed-in user changes. `fetchApplications` is
mocked, so also verify the real integration by hand:

- `npm test`, `npm run codestyle`, and `npm run build` pass.
- Sign in with real applications and confirm each stage count matches the
  board.
- Move a card on the board, return to Analytics, and confirm the numbers change.
- Sign in as a different user and confirm the first user's figures do not
  appear.
- Check the layout at 375px, 768px, and 1440px.

## Future work

- **Stage history.** Recording each status change, for example in an
  `application_events` table, would make conversion rates survive cards being
  moved backwards and would allow time-in-stage metrics.
- **Date-range filter**, such as this month against all time. This also needs a
  timestamp for when an application was sent, which `created_at` is not.
- **Rejected applications** have no column, so they are counted as Sent only.

Explicitly out of scope for A2, and not planned here: time-series trends,
segmenting by role, industry, or company, benchmarking against other students,
exporting to PDF or CSV, and predictive or AI-generated insights.

See [ROADMAP.md](ROADMAP.md) for the wider project roadmap.
