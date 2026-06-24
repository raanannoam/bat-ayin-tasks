# מצב הפרויקט

עדכון נכון לקומיט:

```text
28a5a9c Clean temporary Playwright validation artifacts
```

נתיב פרויקט:

```text
C:\Users\Noam\Projects\Bat-ayin-tasks
```

Git: אין remote מוגדר כרגע (אין `origin`).

## סקירה כללית

האפליקציה היא PWA בעברית וב־RTL לניהול משימות ורכש פנימי בישיבת בת עין.

מצב הפיתוח הנוכחי:

- האפליקציה עובדת כ־mockup/אפליקציה סטטית מתוך `outputs/index.html`.
- ה־backend הפעיל הוא localStorage (`DATA_BACKEND = "local"`).
- קיימת שכבת adapters למשימות ולספקים.
- קיימת תשתית Supabase מלאה ב־DB (schema `bat_ayin` על פרויקט Yo-man) וקריאת debug מהאפליקציה — **ללא** מעבר production וללא כתיבה.
- קיימת תשתית PWA בסיסית עם manifest, service worker ואייקונים.

## מצב נוכחי (לפני מעבר Supabase)

נקודות אימות עדכניות:

- **Yo-man נשאר תקין ולא נפגע** — טבלאות `public` (clients, expenses, settings, work_entries) ללא שינוי.
- **Schema `bat_ayin` קיים ומאומת** — ארגון, קטגוריות ו־9 טבלאות; namespace נפרד מ־Yo-man.
- **RLS מאומת** — policies פעילות; בדיקות SQL עם `authenticated` role.
- **Auth test user מאומת** — `tzvi-test@example.com` (manager) עם profile ב־`public.profiles` ו־membership ב־`bat_ayin.organization_members`.
- **REST API ל־`bat_ayin` מאומת** — organizations/categories נגישים עם JWT תקף.
- **Supabase client נוסף ל־`outputs/index.html`** — URL ו־anon key אמיתיים לפרויקט Yo-man.
- **`testSupabaseConnection()` עובד** — בדיקת חיבור ל־`bat_ayin.tasks` (select limit 1).
- **`supabaseTasksReadAdapter` קיים לקריאה בלבד** — טוען tasks + task_updates, ממפה ל־app object.
- **`testLoadSupabaseTasks()` עובד עם session** — מחזיר `{ ok: true, count, tasks, source: "supabase" }`; בלי session מחזיר `{ ok: false, reason: "No Supabase auth session..." }`.
- **`DATA_BACKEND` עדיין `"local"`** — UI ו־`state.tasks` נשארים על localStorage.
- **אין כתיבה ל־Supabase** — אין insert/update/delete מהאפליקציה.
- **אין migration** — נתוני localStorage לא הועברו ל־DB.
- **אין שינוי בהתנהגות המשתמשים** — כל הפעולות ב־UI עוברות דרך local adapters כרגיל.

## מודול משימות

יכולות קיימות:

- יצירת משימה חדשה.
- עריכת משימה קיימת לפי הרשאות.
- קטגוריות.
- עדיפות רגילה / גבוהה.
- תאריך יעד.
- שדה `completed_at` בעת השלמת משימה.
- שדה `deleted_at` עבור soft delete.
- soft delete במקום מחיקה פיזית.
- ארכיון לוגי למשימות שהושלמו לפני 90 יום ומעלה.
- החזרה מ"הושלם" ל"בתהליך" למנהל.
- עדכונים למשימה.
- reminder בסיסי לפי תאריך יעד.
- מיון לפי תאריך, קטגוריה, מבצע ועדיפות.
- נעילת עריכה למשימה שהושלמה, עם אפשרות ניהולית מתאימה.

הנתונים נשמרים כיום ב־localStorage דרך `tasksRepository` → `taskAdapter` (local).

## מודול ספקים / רכש

יכולות קיימות:

- יצירת הזמנת ספק.
- מעקב שלבים:
  - הזמנה
  - קבלה
  - תשלום
  - קבלת חשבונית
- תאריכים לכל שלב.
- שיוך למשתמשים מסוימים.
- שיוך לכולם.
- כפתור "סמן הכל" לסימון כל שלבי ההזמנה.
- קישורים להזמנה או למסמכים חיצוניים.
- שדה תיאור מסמך/צילום מסך כמקום זמני בלבד.
- soft delete לספקים דרך `deleted_at`.

הנתונים נשמרים כיום ב־localStorage דרך `supplierAdapter`.

## הרשאות

### משתמש רגיל

- עובד במסך משתמש רגיל כברירת מחדל.
- רואה את המשימות האישיות שלו.
- יכול ליצור משימות עבור עצמו.
- יכול לעבוד עם ספקים שמשויכים אליו או מסומנים כ־"כולם".

### מנהל

- יכול לעבוד במסך ניהול.
- רואה תמונת ארגון רחבה יותר.
- יכול לנהל משימות של משתמשים אחרים.
- יכול לשנות קטגוריה, עדיפות, יעד וסטטוס לפי ההרשאות בקוד.
- יכול להחזיר משימות שהושלמו ל"בתהליך".
- יכול לנהל קטגוריות ומשתמשים.
- יכול להציג ארכיון משימות שהושלמו לפני יותר מ־90 יום.

## PWA

קיים:

- `outputs/manifest.json`
- `outputs/service-worker.js`
- אייקונים:
  - `outputs/icons/icon-192.png`
  - `outputs/icons/icon-512.png`
  - `outputs/icons/maskable-192.png`
  - `outputs/icons/maskable-512.png`
- רישום service worker מתוך `outputs/index.html`.

ה־PWA הוא בסיסי. אין עדיין push notifications.

## ארכיטקטורת נתונים

ה־backend הפעיל:

```js
const DATA_BACKEND = "local";
```

רכיבים קיימים:

- `repositoryAdapters`
- `tasksRepository` — facade לכל CRUD/load/save של משימות (UI → repo → adapter)
- `repositoryAdapters.local` — production path
- `repositoryAdapters.supabaseRead` — debug read-only (לא מחובר ל־`DATA_BACKEND`)
- `taskAdapter` / `supplierAdapter` — backend פנימי; `taskAdapter` נקרא רק מתוך `tasksRepository`
- `localTasksAdapter` / `localSuppliersAdapter`
- `supabaseTasksReadAdapter` — `loadTasks()` async בלבד
- `testLoadSupabaseTasks()` — debug בקונסול (`window.testLoadSupabaseTasks`)

זרימת הנתונים הנוכחית:

- משימות נטענות ונשמרות דרך `tasksRepository` → `taskAdapter` (local).
- ספקים נטענים ונשמרים דרך `supplierAdapter` (local).
- `DATA_BACKEND` בוחר adapter פעיל מתוך `repositoryAdapters`.
- Supabase read path נפרד: `testLoadSupabaseTasks()` → `supabaseTasksReadAdapter` — **לא** מעדכן `state.tasks`.

הערה חשובה:

- העדפות, קטגוריות ומשתמשים עדיין משתמשים בחלק מהמקומות ישירות ב־localStorage.
- משימות מרוכזות ב־`tasksRepository` → adapters; ספקים ב־`supplierAdapter`.

## מצב Supabase

### מה כבר הוכן ואומת

- תיקיית `supabase` עם:
  - `schema.sql` — schema `bat_ayin` + `public.profiles`
  - `rls.sql` — RLS policies
  - `seed.sql` — ארגון + 6 קטגוריות
  - `smoke-test.sql`
  - `README.md`
  - `mapping-plan.md` — תכנון מיפוי app ↔ DB
- Schema deployed על פרoיקט **Yo-man** (`jxjxjvxbxpgvlarzbohm.supabase.co`).
- `bat_ayin` ב־Exposed schemas ב־Dashboard.
- Supabase client ב־`outputs/index.html` (URL + anon key אמיתיים).
- `testSupabaseConnection()` — בדיקת חיבור.
- `supabaseTasksReadAdapter` + `testLoadSupabaseTasks()` — קריאת משימות debug (דורש Auth session).
- `.gitignore` — `node_modules/` (ניקוי artifacts מבדיקות Playwright).

### מה עדיין לא בוצע

- לא הוחלף `DATA_BACKEND` ל־`"supabase"`.
- לא הועברו משימות מ־localStorage ל־DB (migration).
- לא הועברו ספקים ל־Supabase.
- אין Supabase write adapter.
- אין async bootstrap ל־`state.tasks`.
- אין Google Login / UI auth.
- אין Storage / קבצים מצורפים.
- אין push notifications.

## Next recommended phase

**לא לעבור עדיין ל־`DATA_BACKEND = "supabase"`.**

סדר מומלץ:

1. **יצירת משימות בדיקה ב־DB** — insert ידני/SQL ל־`bat_ayin.tasks` + `task_updates` (עם test user כ־assignee).
2. **בדיקת קריאה אמיתית** — התחברות Auth מחוץ לקוד committed; `await testLoadSupabaseTasks()` עם `count > 0` ומיפוי נכון.
3. **תכנון async bootstrap** — איך לטעון מ־Supabase בלי לשבור init sync של localStorage.
4. **רק אחר כך** — Supabase write adapter, migration, והחלפת `DATA_BACKEND`.

## תגיות וקומיטים חשובים

תגיות:

- `stable-before-supabase`
- `stable-local-adapters`
- `stable-supabase-client-prepared`
- `stable-bat-ayin-schema-namespace`
- `stable-supabase-mapping`
- `stable-docs-after-move`

קומיטים אחרונים (Supabase):

- `28a5a9c` — Clean temporary Playwright validation artifacts
- `8fc0ea2` — Add read-only Supabase tasks adapter for debug validation
- `f5b6f56` — Wire Supabase client and bat_ayin connection test
- `6213588` — Move Bat Ayin schema to dedicated namespace

קומיטים חשובים (היסטוריה):

- `ea4ddc4` — Add initial Supabase schema
- `2041384` — Add project documentation for future agents
- `b41699d` — Prepare Supabase client configuration
- `c73f0fe` — Centralize local data backend configuration
- `9e83304` — Add local supplier data adapter
- `72abb51` — Add local task data adapter
- `23209c3` — Add task lifecycle safeguards and archival
- `112a922` — Add basic PWA install support
- `c576e63` — Add supplier purchasing workflow and management counts
- `354c7b9` — Add Supabase smoke test SQL

## TODO / Roadmap

סדר עדיפות מעודכן:

1. ~~Supabase preparation~~ — **הושלם** (schema, RLS, seed, client, connection test)
2. ~~Supabase read-only (debug)~~ — **הושלם חלקית** (`supabaseTasksReadAdapter`, `testLoadSupabaseTasks`)
3. **Test data + read validation** — משימות בדיקה ב־DB, אימות מיפוי מלא
4. **Async bootstrap design** — לפני החלפת backend
5. Supabase write support
6. Migration מ־localStorage
7. Google Login
8. File attachments
9. Push notifications
