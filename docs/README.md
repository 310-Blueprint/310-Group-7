# Pipeline documentation

Technical documentation for contributors. If you are looking for what Pipeline
is, how to install it, or how to contribute, start with the
[project README](../README.md) and [CONTRIBUTING.md](../CONTRIBUTING.md).

## What is here

| Document | Answers |
| --- | --- |
| [authentication.md](authentication.md) | How sign-in, sign-up, password reset, and the route guards work. |
| [database.md](database.md) | What the Supabase tables hold, how they map onto the UI, and why row-level security matters. |
| [dashboard.md](dashboard.md) | The kanban board: columns, adding and deleting applications, drag and drop. |
| [documents.md](documents.md) | The documents archive: upload, download, delete, and how Storage is laid out. |
| [ui-and-layout.md](ui-and-layout.md) | Shared components, design tokens, artwork layering, and responsive breakpoints. |
| [ROADMAP.md](ROADMAP.md) | Known gaps and the work planned for A2. |

The runnable database schema lives at [`schema.sql`](../schema.sql) in the repo
root. Run it top to bottom in the Supabase SQL editor to set up a new project.

## How to maintain these

These are living feature documents, not changelogs. When you change behaviour,
update the document that owns it. Do not add a new file describing your diff;
git history is the changelog.

Each document describes the system as it is today, and ends with a short
"Future work" list of gaps specific to that feature. Anything broader belongs
in [ROADMAP.md](ROADMAP.md) so it is recorded in exactly one place.

## One thing to know up front

The project has **no test framework and no automated tests**. This is the
largest known gap and is tracked in [ROADMAP.md](ROADMAP.md). Verification is
currently manual, plus `npm run lint` and `npm run build`.
