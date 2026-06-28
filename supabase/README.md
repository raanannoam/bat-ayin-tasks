# Supabase Database Foundation

This folder contains the database-only foundation for the mockup transition.
It does not connect the frontend, replace localStorage, or add Google Auth.

## Schema Layout

Bat Ayin uses a dedicated PostgreSQL schema so it can share one Supabase project
with other apps (for example Yo-man in `public`) without table or function name
collisions.

| Schema | Purpose |
|--------|---------|
| `public` | Shared `profiles` table (identity for all apps) |
| `bat_ayin` | Bat Ayin organizations, tasks, suppliers, preferences, RLS helpers |

Before using the Supabase JS client against `bat_ayin`, add `bat_ayin` to
**Project Settings → API → Exposed schemas** in the Supabase dashboard.

## Files

- `schema.sql` creates the `bat_ayin` schema, shared `public.profiles`, Bat Ayin
  tables, constraints, indexes, and grants.
- `rls.sql` enables row level security, `bat_ayin.*` helper functions, policies,
  triggers, and supplier soft-delete RPCs. Profile policies remain on `public.profiles`.
- `seed.sql` seeds the default organization, categories, and known-member placeholders.
- `smoke-test.sql` provides a rollback-safe manual SQL smoke test for RLS behavior.

## Run Order

In the Supabase SQL editor, run:

1. `schema.sql`
2. `rls.sql`
3. `seed.sql`

For RLS smoke testing, create three temporary users in Supabase Authentication,
replace the placeholder UUIDs in `smoke-test.sql`, then run `smoke-test.sql`.
The smoke test uses a transaction and ends with `rollback`.

## Seed Notes

The default organization is:

```text
ישיבת בת עין
```

Stored in `bat_ayin.organizations` with id `00000000-0000-0000-0000-000000000001`.

The categories match the current mockup. Each row includes a stable `slug`
that maps to the app's `task.category` / `baseCategories[].id` values:

| slug | name (label) | icon |
|------|--------------|------|
| `kitchen` | מטבח | kitchen |
| `maintenance` | תחזוקה | maintenance |
| `study` | לימוד | study |
| `money` | כספים | money |
| `events` | אירועים | events |
| `office` | משרד | office |

Custom categories added later should use their app id as the slug
(for example `custom-1709123456789`). Slugs are unique per organization
and must not change when the display name is edited.

The known members are represented as placeholders in `seed.sql`:

- עדינה
- אבי
- חיה
- צבי

Because `profiles.id` references `auth.users(id)`, the member rows can only be
created after matching Google Auth users and profile rows exist in `public.profiles`.
Replace the placeholder emails in `seed.sql` with the real Google account emails
before running that member section. Membership rows are stored in
`bat_ayin.organization_members`.

## Current Permission Model

Regular users are mini managers of their own tasks. They can create, read,
update, and delete tasks assigned to themselves, including title, notes, status,
due date, priority, and category.

Regular users cannot see or mutate tasks assigned to other people, reassign
tasks to someone else, manage global categories, or manage users.

Tzvi / manager can manage all tasks and the broader organizational picture.

RLS helper functions live in the `bat_ayin` schema (`bat_ayin.is_org_member`,
`bat_ayin.is_org_manager`, and so on).

## Not Included Yet

- Production Google Auth UI (debug OAuth helpers exist in the app)
- localStorage → Supabase migration tooling
- audit logs / task events / invitations / billing
