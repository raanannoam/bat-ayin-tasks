# Bat-ayin-tasks

## מטרה

PWA בעברית וב־RTL לניהול משימות ורכש פנימי בישיבת בת עין — למשתמש רגיל ולמנהל.

## מצב נוכחי

- **נתיב:** `C:\Users\Noam\Projects\Bat-ayin-tasks`
- **HEAD:** `ea4ddc4 Add initial Supabase schema`
- **Backend פעיל:** `localStorage` (`DATA_BACKEND = "local"`)
- **Git:** אין remote מוגדר כרגע
- **תגיות יציבות:** `stable-before-supabase`, `stable-local-adapters`, `stable-supabase-client-prepared`

מה עובד: משימות, ספקים/רכש, הרשאות, PWA בסיסי, adapters מקומיים.

מה מוכן ל־Supabase (ללא שימוש production):

- `supabase/schema.sql`
- `supabase/rls.sql`
- `supabase/seed.sql`
- `supabase/smoke-test.sql`
- `supabase/README.md`
- client בטוח ו־placeholders ב־`outputs/index.html`

## איך אייג'נט חדש מתחיל

1. לוודא שעובדים בתיקייה: `C:\Users\Noam\Projects\Bat-ayin-tasks`
2. לקרוא: `AGENT_RULES.md`, `PROJECT_STATUS.md`, קובץ זה
3. להריץ לפני כל שינוי:

```bash
git -c core.fsmonitor=false status --porcelain
git -c core.fsmonitor=false log --oneline -10
git -c core.fsmonitor=false tag
```

4. לא לשנות `DATA_BACKEND` מ־`"local"` ללא בקשה מפורשת
5. משימות — רק דרך `tasksRepository`; ספקים — רק דרך `supplierAdapter`

## Roadmap קצר

1. **Supabase read-only** — adapter קריאה בלבד, fallback ל־localStorage
2. **Supabase write** — כתיבה הדרגתית דרך adapters
3. **Google Login** — לאחר שה־data layer מוכן
4. **File attachments** — Supabase Storage או חלופה
5. **Push notifications** — הרחבת PWA

פרטים מלאים: `PROJECT_STATUS.md`
