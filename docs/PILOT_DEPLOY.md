# Pilot Deployment — Yeshivat Bat Ayin

Static PWA backed by Supabase. Shared tasks and suppliers for pilot users.

**Production URL:** `https://bat-ayin-tasks.vercel.app`

**Stage 0 note:** Hosting moved from Netlify to Vercel (2026-06-29) to restore deploy capability during pilot. This is not Stage 5 of the migration roadmap.

## Prerequisites (one-time, Supabase dashboard)

1. Run SQL in order: `schema.sql` → `rls.sql` → `pilot-auth.sql` → `seed.sql`
2. **Authentication → Providers → Google** — enable OAuth
3. **Authentication → URL configuration**
   - **Site URL:** `https://bat-ayin-tasks.vercel.app` (לא `http://127.0.0.1:8899` / localhost)
   - אם Site URL נשאר על localhost — אנדרואיד (ובמיוחד PWA/SW) יחזור ל-127.0.0.1 אחרי Google
   - **Redirect URLs:** add `https://bat-ayin-tasks.vercel.app/index.html` and `https://bat-ayin-tasks.vercel.app/**`
   - אחרי שינוי: `supabase login && supabase link --project-ref jxjxjvxbxpgvlarzbohm && supabase config push`
4. **Project Settings → API → Exposed schemas** — include `bat_ayin`
5. Add pilot users in Google Auth, then update emails in `seed.sql` and re-run the members section

## Build

```bash
npm run build:all
```

## Deploy (Vercel — manual, Stage 0 exception)

```bash
npx vercel deploy --prod
```

Project publishes `outputs/` (see root `vercel.json`). Build runs `npm run build:all` on Vercel.

## Pilot URL

- App entry: `https://bat-ayin-tasks.vercel.app/index.html` (or `/`)
- Users sign in with Google — no `?mockup=` parameters

## Debug (developers only)

| Query | Purpose |
|-------|---------|
| `?debug=1` | Expose Supabase test helpers + validation harness |
| `?debugBackend=local` | Force localStorage backend (CI validation) |

Do not share debug URLs with pilot users.

## Manager first login

If the manager had local mockup data on this device, it migrates automatically once to Supabase (one-time).

## Invitations to new members

Currently **manual**: a manager saves the invited Google email in the app (ניהול → חברי ארגון → הוספת חבר), which stores a pending row in `bat_ayin.organization_invitations`. No email is sent by the app — the manager shares the app link (`https://bat-ayin-tasks.vercel.app`) with the invitee directly. Once the invitee signs in with Google using that exact email, `accept_pending_invitation()` activates their membership automatically.

**Optional future capability (not active):** an automated Hebrew invitation email via Supabase Edge Functions + Resend was designed and its server-side pieces were written, but deliberately left undeployed and unwired:

- `supabase/invitation-email.sql` — DB migration (email-status tracking columns + manager-gated RPCs). Not applied to any project.
- `supabase/functions/send-invitation-email/index.ts` — Edge Function that sends the email via Resend. Not deployed.

To activate this later, all of the following are still needed:

1. A Resend account with a verified sending domain.
2. Secrets on the Supabase project: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `APP_URL`.
3. Apply the migration: `supabase db push` (after linking, includes `invitation-email.sql`).
4. Deploy the function: `supabase functions deploy send-invitation-email`.
5. Client wiring (not started): adapter methods to call the function, a send/retry button in the org-members UI, `npm run build:adapters`, and a `service-worker.js` cache-version bump.

Until then, keep sharing the app link manually after saving the invitation.

## Support

User not in org → show gate screen; add their Google email to `seed.sql` members block and re-run SQL.
