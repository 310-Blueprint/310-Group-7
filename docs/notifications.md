# Notifications and deadline reminders

Pipeline warns users about unfinished applications due today, tomorrow, or in
two days. Past deadlines, invalid dates, and applications in Offer or Rejected
are ignored.

## Behaviour

The dashboard always shows a yellow reminder panel. It lists upcoming deadlines
or displays an empty-state message when there are none.

Selecting **Mark done** hides only that reminder in the current browser and
keeps it hidden after a refresh. It does not change the application's status or
remove the application from the board.

Selecting **Enable desktop alerts** opens the browser permission prompt. With a
public VAPID key configured, Pipeline registers its service worker and saves the
browser's push subscription in Supabase. Without that key, alerts work only
while Pipeline is open. Denying permission does not affect the reminder panel.

## Background delivery

Netlify runs the sender daily at `20:00 UTC` (08:00 NZST or 09:00 NZDT). It uses
the `Pacific/Auckland` date, sends reminders for applications due within two
days, records successful sends to prevent repeats that day, and removes expired
browser subscriptions.

Scheduled runs occur only on published deploys. A branch deploy or deploy
preview can be tested from the function's Netlify page with **Run now**.

## Setup

For an existing Supabase project, run only the **PUSH NOTIFICATIONS** section of
[`schema.sql`](../schema.sql). For a new project, run the complete schema.

Generate one VAPID key pair:

```bash
npx web-push generate-vapid-keys
```

Configure these values locally and in Netlify as shown in [`.env.example`](../.env.example):

```text
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_VAPID_PUBLIC_KEY=your-public-vapid-key
SUPABASE_URL=your-project-url
SUPABASE_SECRET_KEY=your-server-secret-key
VAPID_PUBLIC_KEY=your-public-vapid-key
VAPID_PRIVATE_KEY=your-private-vapid-key
VAPID_SUBJECT=mailto:your-team@example.com
```

The two VAPID public values must match. The Supabase secret and VAPID private
key are server-only: keep them in Netlify, never prefix them with `VITE_`, and
never commit or share them. Regenerate the VAPID pair if the private key is
exposed. Redeploy after changing Netlify settings.

## Manual verification

Create unfinished applications due today, tomorrow, in two days, and in three
days. Confirm only the first three appear, then move one to Offer and confirm it
disappears.

Select **Mark done** on one reminder and confirm only that reminder disappears.
Refresh the page and confirm it stays hidden while the application remains on
the board.

Deploy the branch with all settings configured. Open the deployed URL, sign in,
enable alerts, and confirm a subscription appears in Supabase. Close the tab and
select **Run now** for the scheduled function. Confirm an operating-system
notification arrives, then run it again and confirm it is not repeated that day.

Also confirm that denying browser permission leaves the reminder panel working.

## Future work

Add automated tests, configurable reminder windows, notification preferences,
and email delivery.
