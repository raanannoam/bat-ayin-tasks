# Bat-ayin-tasks

## מטרה

PWA בעברית וב־RTL לניהול משימות ורכש פנימי בישיבת בת עין — למשתמש רגיל ולמנהל.

## מצב נוכחי

- **נתיב:** `C:\Users\Noam\Projects\Bat-ayin-tasks`
- **HEAD:** `1dbdd1a End-to-end Supabase task CRUD`
- **תג יציב:** `stable-supabase-task-crud-e2e`
- **Backend פעיל (ברירת מחדל):** `localStorage` (`DATA_BACKEND = "local"`)
- **Git:** אין remote מוגדר כרגע

### מה עובד (production path)

- משימות, ספקים/רכש, הרשאות, PWA בסיסי
- Async runtime + `tasksRepository` facade
- Adapters מקומיים (`localTasksAdapter`, `localSuppliersAdapter`)

### מה מאומת (debug Supabase path)

- Unified Supabase tasks adapter (`outputs/adapters.js`)
- Google OAuth + Supabase session (console debug)
- Organization membership
- Task CRUD E2E: load/create/update/complete/reopen/delete via `tasksRepository`

### מה עדיין local / לא production

- `DATA_BACKEND` ברירת מחדל `"local"` — אין production switch
- ספקים — localStorage בלבד
- אין migration, אין production auth UI

## איך אייג'נט חדש מתחיל

1. לוודא שעובדים בתיקייה: `C:\Users\Noam\Projects\Bat-ayin-tasks`
2. לקרוא: `AGENT_RULES.md`, `PROJECT_STATUS.md`, קובץ זה
3. להריץ לפני כל שינוי:

```bash
git -c core.fsmonitor=false status --porcelain
git -c core.fsmonitor=false log --oneline -10
git -c core.fsmonitor=false tag
```

4. לא לשנות ברירת מחדל של `DATA_BACKEND` מ־`"local"` ללא בקשה מפורשת
5. משימות — רק דרך `tasksRepository`; ספקים — רק דרך `supplierAdapter`

## Roadmap קצר

1. ~~Async runtime~~ — **הושלם**
2. ~~Supabase tasks adapter (unified)~~ — **הושלם**
3. ~~Task CRUD E2E~~ — **הושלם**
4. ~~Google OAuth (debug)~~ — **הושלם**
5. **Suppliers Supabase** — adapter + runtime
6. **Production auth UI**
7. **Migration** localStorage → DB
8. **Production backend switch**
9. File attachments, push notifications

פרטים מלאים: `PROJECT_STATUS.md`
