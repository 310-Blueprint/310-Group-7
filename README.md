# Pipeline

An internship application tracker for students. Pipeline keeps application
progress and the documents that go with it in one place, so the whole process is
faster and less repetitive.

Built by **Team Blueprint** for **SOFTENG 310: Software Evolution and
Maintenance** at the University of Auckland.

## Why Pipeline

There are not many well-known platforms that let students manage internship
applications easily or intuitively. Spreadsheets exist, but they are
time-consuming to set up, unappealing, confusing to navigate, and often
demotivating to look at. Tailoring cover letters and CVs for each application is
tiresome and repetitive on top of that.

Pipeline tracks internship progress **and** collates the important documents into
a single place.

## Features

### Working today

- **User authentication.** Sign up, log in, and password reset by email, with
  protected routes and per-user data isolation.
- **Application tracking.** A kanban board with four stages (To apply, Applied /
  Waiting, Interview, Offer). Cards are dragged to reorder them or to change
  stage, and the board is saved to the database so it persists across devices.
- **Document management.** Upload CVs, cover letters, and transcripts by drag and
  drop or a file picker, then download or delete them. Files are stored
  privately, scoped to the account that uploaded them.

### Planned for the next iteration

Interview calendar, task management, notifications and reminders, job search and
filtering, job analytics, saved internships, and an AI cover letter and CV
tailorer. See [docs/ROADMAP.md](docs/ROADMAP.md) for the full list, including
known gaps in what already works.

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React 19 with Vite |
| Routing | React Router |
| Styling | Tailwind CSS v4 |
| Drag and drop | dnd kit |
| Backend and database | Supabase (Postgres, Auth, Storage) |
| Package manager | npm |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) and npm
- A [Supabase](https://supabase.com/) account and project

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/310-Blueprint/310-Group-7.git
   cd 310-Group-7
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the database. In your Supabase project, open the SQL editor and run
   [`schema.sql`](./schema.sql) top to bottom. It creates both tables, enables
   row-level security, adds the policies, and creates the private `documents`
   storage bucket.

4. Create a `.env.local` file in the project root by copying
   [`.env.example`](./.env.example), then fill in the values from your Supabase
   project under Settings, then API:

   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

   > `.env.local` is git-ignored. Never commit secrets. The keys for the team's
   > project are submitted separately on Canvas as required by the assignment
   > brief.

5. Configure authentication redirects. In the Supabase dashboard, under
   Authentication, then URL Configuration, set the **Site URL** to
   `http://localhost:5173` and add `http://localhost:5173/reset-password` to
   **Redirect URLs**. Without this the password reset link will not work. See
   [docs/authentication.md](docs/authentication.md).

6. Run the app:

   ```bash
   npm run dev
   ```

### Available scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production into `dist` |
| `npm run lint` | Run ESLint across the project |
| `npm run preview` | Serve the production build locally |

### Testing

The project does **not** currently have a test framework or any automated tests.
This is the largest known gap and is tracked as the top item in
[docs/ROADMAP.md](docs/ROADMAP.md), which also lists suggested first targets.

Until one is adopted, verify changes with `npm run lint`, `npm run build`, and by
running the app and exercising the affected flows. The feature documents in
[docs/](docs/) each end with a manual verification checklist.

### Deployment

Pipeline is deployed with [Netlify](https://www.netlify.com/).

- The `main` branch is connected to Netlify and deploys automatically on every
  push or merge.
- `public/_redirects` contains `/*  /index.html  200`, which is required for
  client-side routing. Without it, loading `/documents` or `/reset-password`
  directly returns a 404.

**Build settings:**

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `dist` |

**Environment variables:** set the same keys used locally
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) under Netlify, then Site
settings, then Environment variables. Add the deployed `/reset-password` URL to
the Supabase Redirect URLs allowlist as well.

## Documentation

Technical documentation for contributors lives in [docs/](docs/):

| Document | Covers |
| --- | --- |
| [authentication.md](docs/authentication.md) | Sign-in, sign-up, password reset, and route guards |
| [database.md](docs/database.md) | The Supabase schema and why row-level security matters |
| [dashboard.md](docs/dashboard.md) | The kanban board and drag and drop |
| [documents.md](docs/documents.md) | The documents archive and storage layout |
| [ui-and-layout.md](docs/ui-and-layout.md) | Shared components, design tokens, and breakpoints |
| [ROADMAP.md](docs/ROADMAP.md) | Known gaps and work planned for the next iteration |

The colour palette and design tokens are defined once in
[`src/styles/preset.css`](src/styles/preset.css) and explained in
[docs/ui-and-layout.md](docs/ui-and-layout.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the fork, branch, and pull request
workflow, along with issue and code review expectations.

Please also review our [Code of Conduct](./CODE_OF_CONDUCT.md) before taking
part.

## Getting help

Open an [issue](https://github.com/310-Blueprint/310-Group-7/issues) on this
repository using the bug report or feature request template.

## Versioning

This project follows [semantic versioning](https://semver.org/). Releases are
listed on the
[Releases](https://github.com/310-Blueprint/310-Group-7/releases) page.

## Licence

Released under the MIT Licence. See [LICENSE](./LICENSE).

## Acknowledgements

**Team Blueprint:**

- Abbey Martinez (amar379@aucklanduni.ac.nz)
- Alyza So (aso060@aucklanduni.ac.nz)
- Caitlin Kuan (ckua141@aucklanduni.ac.nz)
- Julianne Gabas (jgab318@aucklanduni.ac.nz)
- Navini Ariyasinghe (kari487@aucklanduni.ac.nz)
- Orion Lim (olim735@aucklanduni.ac.nz)

A breakdown of who worked on what is on the project wiki.

**Built with:** [React](https://react.dev/), [Vite](https://vitejs.dev/),
[Tailwind CSS](https://tailwindcss.com/), [Supabase](https://supabase.com/), and
[dnd kit](https://dndkit.com/).
