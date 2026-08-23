# Authentication

Email and password sign-in via Supabase Auth. This covers how the pieces fit
together, the decisions that look odd until you know why, and what needs
configuring before it will run.

## Why this matters more than a login form

[`schema.sql`](../schema.sql) gives both tables a `user_id` defaulting to
`auth.uid()`, and row-level security policies that check `auth.uid() = user_id`.
**`auth.uid()` is whoever is currently signed in.** So auth is not a cosmetic
gate in front of the app; it is the thing that makes the whole schema secure.
With nobody signed in, `auth.uid()` is null and every policy returns nothing.
See [database.md](database.md) for the full picture.

The same applies to the storage bucket: it is private, and its policy only
allows access to files whose first path segment matches the user's id. That is
covered in [documents.md](documents.md).

## The pieces

| File | Role |
| --- | --- |
| `src/lib/supabaseClient.js` | The one shared client. Throws early if env vars are missing. |
| `src/context/AuthContext.js` | The context object, alone in its own file. |
| `src/context/AuthProvider.jsx` | Tracks the session app-wide. |
| `src/context/useAuth.js` | `const { user, session, loading } = useAuth()` |
| `src/components/ProtectedRoute.jsx` | Wraps pages needing a signed-in user. |
| `src/components/PublicOnlyRoute.jsx` | Wraps the auth forms. |
| `src/components/RouteLoading.jsx` | Shown while the session is being restored. |
| `src/components/FormMessage.jsx` | Inline error or success line, with the right ARIA role. |

`AuthProvider` wraps `<App />` inside `<BrowserRouter>` in `src/main.jsx`.

## How the session is tracked

`AuthProvider` does two things in one effect:

1. `supabase.auth.getSession()` recovers an existing session on first load, so
   a refresh does not sign you out.
2. `supabase.auth.onAuthStateChange(...)` keeps the app in sync afterwards, on
   sign-in, sign-out, and silent token refreshes.

It exposes `{ session, user, loading }` and nothing else. In particular it does
**not** wrap `signIn` / `signOut`. Pages call `supabase.auth.*` directly, so
there is one way to talk to Supabase rather than two competing ones, and the
official docs apply as written.

### `loading` is not cosmetic

Restoring a session is asynchronous. For the first render after a refresh there
is no session yet, even for a signed-in user. If `ProtectedRoute` treated that
as "signed out", it would throw people out of the app every time they pressed
F5. `loading` means "we do not know yet", which is distinct from "no".

### Three things that would break it

- **Not unsubscribing.** The effect returns a cleanup calling
  `subscription.unsubscribe()`. Without it, React StrictMode's mount, unmount,
  mount cycle leaves two live subscriptions.
- **Writing state after teardown.** The `active` flag discards the first run's
  `getSession()` result if it lands after that run was torn down. React 19 does
  not warn about this, so it fails silently.
- **A "run once" ref guard.** The common StrictMode advice is a `useRef(false)`
  guard. It is wrong here, because the second mount would skip
  `onAuthStateChange` entirely and the app would never notice a sign-in or
  sign-out again. Idempotent subscribe plus cleanup is the correct shape.

The `onAuthStateChange` callback is also deliberately **not** `async`. It can run
while supabase-js holds an internal lock, and awaiting another `supabase.auth`
call inside it deadlocks.

## Why the context is three files

`eslint.config.js` extends `reactRefresh.configs.vite`, which sets
`react-refresh/only-export-components` to **error**. A single `AuthContext.jsx`
exporting the provider, the hook and the context is three lint failures. So:
context in `AuthContext.js`, hook in `useAuth.js` (the rule only scans `.jsx`),
component alone in `AuthProvider.jsx`.

Do not add a file whose name differs only by case. Windows is case-insensitive
and `.js` resolves before `.jsx`, so imports would silently pick the wrong one.

## Routes

This table is the single source of truth for routing. Routing itself lives in
`src/App.jsx`.

| Path | Page | File | Guard |
| --- | --- | --- | --- |
| `/` | Login | `src/pages/LoginPage.jsx` | public only |
| `/signup` | Sign up | `src/pages/SignUpPage.jsx` | public only |
| `/forgot-password` | Request a reset link | `src/pages/ForgotPasswordPage.jsx` | public only |
| `/reset-password` | Set a new password | `src/pages/ResetPasswordPage.jsx` | **none** |
| `/dashboard` | Dashboard | `src/pages/DashboardPage.jsx` | protected |
| `/documents` | Documents | `src/pages/DocumentsPage.jsx` | protected |

`/` is login for now. When the landing page lands it takes `/`, and login moves
to `/login`: one line in `src/App.jsx`, plus the `to` props on the `AuthFooter`s
that point back at login.

Both guards use `<Navigate replace>`. Without `replace`, a redirect leaves the
blocked page in history, so pressing Back triggers the redirect again, which is
an inescapable loop.

`ProtectedRoute` passes the attempted location in `state.from`, and `LoginPage`
sends the user there after signing in rather than always to the dashboard.

Signing out needs no `navigate()` call: it clears the session, the provider
updates, and `ProtectedRoute` redirects on its own. If sign-out does not
navigate, the guards are wired wrong.

Internal navigation uses `<Link>`, never `<a href>`. An `<a>` triggers a full
page reload and drops all React state.

## Sign up and the "Confirm email" setting

That dashboard setting (Authentication, then Providers, then Email) changes what
`signUp` returns, so the page branches on the response rather than assuming:

- **`data.session` present.** Confirmation is off, the user is already signed
  in, go to the dashboard.
- **`data.session` null.** Confirmation is on; show "check your inbox".

Signing up with an **already-registered** address returns no error and a decoy
user object. That is deliberate on Supabase's part: it stops the form being used
to discover which emails have accounts. We show the same "check your inbox"
message either way rather than detecting it, because detecting it would put the
leak straight back. The same reasoning is why login shows Supabase's "Invalid
login credentials" verbatim instead of something friendlier.

## The password reset round trip

1. `/forgot-password` calls `resetPasswordForEmail(email, { redirectTo })`, where
   `redirectTo` is `${window.location.origin}/reset-password`. It is computed,
   not hard-coded, so one build works locally and on Netlify.
2. Supabase emails a one-time link.
3. Clicking it verifies the token and redirects to `/reset-password` with
   `#access_token=...&type=recovery` in the URL fragment.
4. The client's `detectSessionInUrl` (on by default) consumes that fragment at
   import time, turns it into a session, and clears the hash. **We parse none of
   this ourselves.**
5. `/reset-password` calls `updateUser({ password })`, then `signOut()`, then
   sends the user to login with a success message.

### Why `/reset-password` has no guard

Step 4 creates a **real session**. So:

- `PublicOnlyRoute` would bounce the user to the dashboard before they could
  change anything.
- `ProtectedRoute` would dump users with an expired link on the login page with
  no explanation.

The page reads `loading` and `session` itself and renders one of three states:
loading, invalid or expired, or the form.

### Why it signs you out afterwards

The recovery link left a live session. Signing out forces the user to prove they
know the new password, and means a forwarded reset email does not leave someone
signed in. If you would rather keep them in, drop the `signOut()`, but that is a
security decision, so update this document too.

Note the ordering: `updateUser` must resolve **before** `signOut`, or the update
runs against a revoked token.

### Tutorials to ignore

Anything using `exchangeCodeForSession` is written for the PKCE flow. This client
uses the default **implicit** flow, where the token arrives in the URL fragment,
and calling that function throws on the flow mismatch.

## Configuration you need

**Environment.** Copy [`.env.example`](../.env.example) to `.env.local` and fill
in `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Both come from the
Supabase dashboard under Settings, then API. The client throws a named error if
either is missing, rather than failing obscurely later.

**Database.** Run [`schema.sql`](../schema.sql) in the Supabase SQL editor. See
[database.md](database.md).

**Supabase dashboard:**

- Authentication, then URL Configuration. Set **Site URL** to
  `http://localhost:5173`, and add `http://localhost:5173/reset-password` to
  **Redirect URLs**. If it is not allowlisted, Supabase silently falls back to
  the Site URL and the reset link lands on `/`, which looks like a routing bug
  but is not.
- Authentication, then Providers, then Email, then **Confirm email**. Off is
  easier for development, on is correct for the demo.

**Deployment.** `public/_redirects` contains `/*  /index.html  200`. Without it,
loading `/reset-password` or `/documents` directly returns a 404 on Netlify,
which matters most for the emailed reset link. Add the deployed
`/reset-password` URL to the Redirect URLs allowlist too.

## Future work

- The greeting on both the dashboard and documents pages is still the hardcoded
  "Hello, Stranger", when `useAuth()` already exposes the signed-in user.
- There is no `*` catch-all route, so an unknown URL renders blank.
- There is no user profile feature: no `/profile` route, no profile table, and
  no way to change an email or display name.

See [ROADMAP.md](ROADMAP.md) for the full list.
