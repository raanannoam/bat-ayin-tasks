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

The "חברי ארגון" screen shows pending invitations (email, role, "ממתין לכניסה ראשונה") below the member list, refreshed immediately after a save. `prepare_organization_invitation` rejects an email that already belongs to an active member or already has a pending invitation (clear error instead of a silent duplicate/replace) — role changes for existing members must go through promote/demote, not re-inviting.

**Required SQL re-apply (2026-10-04 fix):** re-run `supabase/org-admin.sql` in the Supabase SQL editor against the production project *before* deploying the matching frontend build (see deploy order below). It is idempotent (safe to re-run; no destructive table changes — it de-duplicates any pre-existing duplicate pending invitations by revoking older rows, then adds a unique index) and includes:
- the duplicate-prevention logic above in `prepare_organization_invitation`, now also enforced at the constraint level (a unique partial index on `(organization_id, lower(email)) where status = 'pending'`) so two concurrent invite requests for the same email can't both succeed — not just the single-request check,
- the new `list_organization_invitations` RPC (manager-only — checks `is_org_manager` internally and is granted only to `authenticated`, same pattern as `list_organization_members`; powers the pending-invitations list),
- a fix to a stray semicolon after `set search_path` in `list_organization_members`, `update_organization_member_role`, and `set_organization_member_active` that would make `create or replace function` fail with a syntax error on re-run (the same class of bug already fixed for `accept_pending_invitation` — see git history).

**Deploy order:** apply the SQL first, then push/deploy the frontend. The old frontend tolerates the new SQL fine (it only shows the new duplicate/already-member error text verbatim in a toast — no crash). The new frontend does **not** tolerate the old SQL as gracefully on its own: `loadPendingInvitations()` calling a not-yet-created `list_organization_invitations` would fail — the frontend already degrades this to an inline "לא ניתן לטעון הזמנות ממתינות כרגע" note instead of blocking the member list, but applying the SQL first avoids that window entirely.

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
