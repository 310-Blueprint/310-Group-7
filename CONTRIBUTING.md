# Contributing

Thanks for contributing. This project is developed by **Team Blueprint** and is
associated with the University of Auckland **SOFTENG 310** course. These
guidelines describe the workflow every contributor is expected to follow.

Please read this document fully before making your first contribution, and read
[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before taking part.

## Getting set up

The [README](./README.md) covers installation, the Supabase setup, and the
available npm scripts. The steps below are the parts specific to contributing.

1. **Fork** the upstream repository, `310-Blueprint/310-Group-7`, to your own
   GitHub account.

2. **Clone** your fork locally:

   ```bash
   git clone https://github.com/<your-username>/310-Group-7.git
   cd 310-Group-7
   ```

3. Add the upstream repository as a remote so you can stay in sync:

   ```bash
   git remote add upstream https://github.com/310-Blueprint/310-Group-7.git
   ```

4. Follow the [README](./README.md) to install dependencies, run
   [`schema.sql`](./schema.sql) against your Supabase project, and create your
   `.env.local`.

Technical documentation for each feature is in [docs/](docs/). Start with
[docs/README.md](docs/README.md), which indexes the rest.

## The contribution workflow

Every change, **code or documentation**, follows this loop:

1. **Find or open an issue.** All work must be tied to an open issue. If one does
   not exist, create it first (see [Issues](#issues)) and wait for it to be
   approved.
2. **Claim the issue.** Assign yourself, or comment and have a maintainer assign
   you. You may only have **one claimed open issue at a time**.
3. **Sync and branch.** Update your fork from upstream, then create a feature
   branch from `main`:

   ```bash
   git fetch upstream
   git checkout main
   git rebase upstream/main
   git checkout -b <branch-name>
   ```

4. **Make your changes**, committing in logical steps. Rebase against
   `upstream/main` often rather than waiting until the end.
5. **Verify your work.** See [Testing your changes](#testing-your-changes).
6. **Open a pull request** from your fork's branch to `310-Blueprint/main`.
7. **Get it reviewed.** At least one other team member must review and approve.
8. **Merge.** See [Merge access](#merge-access). **Never merge without
   approval.**

## Branch naming

Use a consistent, descriptive scheme:

```
<type>/<short-description>
```

Common types are `feature`, `fix`, `docs`, `refactor`, and `test`. For example
`feature/application-list`, `fix/login-redirect`, or
`docs/contributor-guidelines`.

## Commits and pull requests

- **PR title** should succinctly describe the change, not just the issue number.
  Write `Add application status filter`, not `#42`.
- **PR body** should explain what changed and reference the issue, for example
  `Adds status filtering to the applications list. Closes #42.` The pull request
  template prompts for both.
- **Squash** your commits and resolve merge conflicts before merging.
- If more than one person worked on the issue, note this in the issue and pull
  request comments, and list all contributors on the wiki.

## Testing your changes

The project does **not** currently have a test framework or any automated tests.
Adopting one is the top item in [docs/ROADMAP.md](docs/ROADMAP.md), which lists
suggested first targets. Contributions that add test infrastructure are
especially welcome.

Until then, every pull request must be verified by hand, and **the pull request
description must say what was verified**. At a minimum:

- `npm run lint` passes.
- `npm run build` passes.
- The app runs and the affected flows behave as expected.

Each feature document in [docs/](docs/) ends with a manual verification
checklist for that area. Use the relevant one.

Once a test framework exists, this section becomes the ordinary requirement that
all additions and modifications ship with tests, and that the full suite passes
before a pull request is opened.

## Issues

### Creating an issue

- Check open issues first to avoid duplicates.
- Use the **bug report** or **feature request** template. Both are in
  [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/) and are offered
  automatically when you open a new issue.
- Apply appropriate **labels** (see below).
- Flag any dependencies in a comment, for example `Depends on #12` or
  `Blocks #15`.

### Getting an issue approved

New issues must be **approved by the team before anyone starts work**. Approval
checks that the issue is reproducible (for bugs) or appropriate (for features),
is not a duplicate, and has its dependencies flagged.

Issues are approved by discussion at the **weekly group meeting**. Anything that
comes up between meetings is discussed on the team's online channel first, and
the issue is created once the team agrees. Where approval happened in a meeting
or on chat, record it as a comment on the issue noting that it came from the
team discussion, so the decision is visible in the repository.

### Labels

We use the default GitHub labels plus the following:

| Label | Meaning |
| --- | --- |
| `frontend` | React and UI work |
| `backend` | Supabase and data-layer work |
| `documentation` | Documentation, wiki, and guidelines |
| `A2` | Work scoped for the next iteration |

## Code reviews

All pull requests must be reviewed by **at least one other team member**. As a
reviewer you should:

- Pull the branch and run the code, confirming it works as described.
- Run `npm run lint` and `npm run build`.
- Check the code is clear, commented where it needs to be, and maintainable.
- Check the pull request says what was manually verified.
- Check that any behaviour change is reflected in the relevant document in
  [docs/](docs/).

If you find bugs or problems during review, they should be fixed before the pull
request is approved. A new issue is not needed for these. Reviews should be
**constructive**: say what is wrong, and where possible suggest what would be
better.

## Merge access

**The approving reviewer merges the pull request.** The person who confirms the
code works is the one who lands it, so nothing is merged that a second person has
not run.

Before merging, squash the commits and resolve any conflicts. Never merge a pull
request that has not been approved.

## Code quality and security

- **SonarLint (in IDE):** run analysis while writing code.
- **SonarCloud (main branch):** analysis runs after contributions are merged.
- **Snyk:** monitors dependencies and opens pull requests for vulnerabilities,
  one per vulnerability. Merge these where practical; breaking changes may
  prevent some from being merged.
- **Dependencies:** declare all external dependencies in `package.json`. Do not
  add dependencies without the team's awareness.

## Documentation

Documentation is treated as a contribution like any other: it needs an issue, a
branch, and a review.

The documents in [docs/](docs/) are **living feature documents, not changelogs**.
When you change behaviour, update the document that owns it rather than adding a
new file describing your diff. Git history is the changelog. See
[docs/README.md](docs/README.md).

## Coordination

- All coordination happens through **issue and pull request comments**.
- The team meets **weekly**. Decisions about how the project is managed are
  recorded in the project documentation, and decisions about a specific issue,
  pull request, or commit are recorded as a comment there, noting that the
  discussion came from the meeting.
- If you spot anything that is not fostering an inclusive environment, or a
  problem the team cannot easily resolve, raise it with the teaching team
  promptly.

## Made a mistake?

If you slip on the workflow while learning it, that is okay. Note it on the
**Workflow Retrospective** wiki page, covering what happened, why, and how it was
fixed, rather than leaving it unrecorded.
