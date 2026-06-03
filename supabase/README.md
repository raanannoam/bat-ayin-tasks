# Supabase Database Foundation

This folder contains the database-only foundation for the mockup transition.
It does not connect the frontend, replace localStorage, or add Google Auth.

## Files

- `schema.sql` creates the tables, constraints, and indexes.
- `rls.sql` enables row level security, helper functions, policies, and task triggers.
- `seed.sql` seeds the default organization, categories, and known-member placeholders.

## Run Order

In the Supabase SQL editor, run:

1. `schema.sql`
2. `rls.sql`
3. `seed.sql`

## Seed Notes

The default organization is:

```text
ישיבת בת עין
```

The categories match the current mockup:

- מטבח
- תחזוקה
- לימוד
- כספים
- אירועים
- משרד

The known members are represented as placeholders in `seed.sql`:

- עדינה
- אבי
- חיה
- צבי

Because `profiles.id` references `auth.users(id)`, the member rows can only be
created after matching Google Auth users and profile rows exist. Replace the
placeholder emails in `seed.sql` with the real Google account emails before
running that member section.

## Current Permission Model

Regular users are mini managers of their own tasks. They can create, read,
update, and delete tasks assigned to themselves, including title, notes, status,
due date, priority, and category.

Regular users cannot see or mutate tasks assigned to other people, reassign
tasks to someone else, manage global categories, or manage users.

Tzvi / manager can manage all tasks and the broader organizational picture.

## Not Included Yet

- Frontend Supabase client
- Google Auth wiring
- localStorage replacement
- audit logs
- task events
- task assignees table
- invitations
- workspace switching
- billing

