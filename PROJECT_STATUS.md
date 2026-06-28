# מצב הפרויקט

עדכון נכון לקומיט:

```text
1dbdd1a End-to-end Supabase task CRUD
```

תג יציב נוכחי:

```text
stable-supabase-task-crud-e2e
```

נתיב פרויקט:

```text
C:\Users\Noam\Projects\Bat-ayin-tasks
```

Git: אין remote מוגדר כרגע (אין `origin`).

## סקירה כללית

האפליקציה היא PWA בעברית וב־RTL לניהול משימות ורכש פנימי בישיבת בת עין.

מצב הפיתוח הנוכחי:

- האפליקציה עובדת מתוך `outputs/index.html`.
- **Runtime async** — `tasksRepository`, `bootstrapTasks()` ו־`loadTasks()` async.
- **Backend פעיל (ברירת מחדל):** localStorage (`DATA_BACKEND = "local"`).
- **Supabase tasks path מאומת E2E** — load/create/update/complete/reopen/delete דרך `tasksRepository` (debug backend בלבד).
- **ספקים:** localStorage בלבד (`supplierAdapter` local).
- **אין מעבר production** — `DATA_BACKEND` נשאר `"local"` אלא אם מופעל debug override.
- קיימת תשתית PWA בסיסית עם manifest, service worker ואייקונים.

## מצב נוכחי (אחרי Supabase task CRUD E2E)

נקודות אימות עדכניות:

- **Yo-man נשאר תקין** — טבלאות `public` ללא שינוי.
- **Schema `bat_ayin` + RLS מאומתים** — namespace נפרד, policies פעילות.
- **Supabase client + connection test** — `createSupabaseClientSafe()`, `testSupabaseConnection()`.
- **Bundled adapters** — `outputs/adapters.js` (`BatAyinAdapters`, מקור: `src/adaptersBundle.ts`).
- **Unified Supabase tasks adapter** — `BatAyinAdapters.createSupabaseTasksAdapter()` (read + write).
- **tasksRepository facade** — כל CRUD runtime למשימות עובר דרך repo → adapter.
- **Async bootstrap** — `bootstrapTasks()` טוען משימות async לפני render.
- **Google OAuth (debug) עובד** — `debugSupabaseSignInWithGoogle()`, `consumeSupabaseOAuthCallback()`.
- **Supabase session bootstrap עובד** — `bootstrapSupabaseAuthSession()`.
- **Organization membership מאומת** — context load כולל `organization_members` + profiles.
- **Task CRUD E2E מאומת** — `testSupabaseTaskCrudViaRepository()` (load/create/update/complete/reopen/delete).
- **`DATA_BACKEND` ברירת מחדל `"local"`** — UI ו־`state.tasks` על localStorage.
- **Debug override בלבד** — `?debugBackend=supabase` או `sessionStorage` (לא production switch).
- **ספקים local בלבד** — גם כש־debug backend=supabase, ספקים נשארים על local adapter.
- **אין migration** — נתוני localStorage לא הועברו ל־DB.

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

**Production path:** localStorage דרך `tasksRepository` → `taskAdapter` (local).

**Debug Supabase path:** `tasksRepository` → `supabaseTasksAdapter` (E2E מאומת, לא ברירת מחדל).

## מודול ספקים / רכש

יכולות קיימות:

- יצירת הזמנת ספק.
- מעקב שלבים: הזמנה, קבלה, תשלום, קבלת חשבונית.
- תאריכים לכל שלב.
- שיוך למשתמשים מסוימים / לכולם.
- כפתור "סמן הכל".
- קישורים להזמנה או למסמכים חיצוניים.
- soft delete לספקים דרך `deleted_at`.

**Production path:** localStorage דרך `supplierAdapter` (local) בלבד.

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
- אייקונים ב־`outputs/icons/`
- רישום service worker מתוך `outputs/index.html`.

אין עדיין push notifications.

## ארכיטקטורת נתונים

Backend ברירת מחדל:

```js
const DATA_BACKEND = "local"; // debug override: ?debugBackend=supabase
```

רכיבים קיימים:

- `outputs/adapters.js` — bundled `BatAyinAdapters` (tasks + shared helpers)
- `repositoryAdapters` — `local`, `supabase`, `supabaseRead`, `supabaseWrite`
- `tasksRepository` — async facade לכל CRUD/load/save של משימות
- `supabaseTasksAdapter` — unified adapter (read + write) via `createSupabaseTasksAdapter()`
- `localTasksAdapter` / `localSuppliersAdapter` — production path
- `taskAdapter` — נבחר לפי `DATA_BACKEND`; נקרא רק מתוך `tasksRepository`
- `supplierAdapter` — local בלבד ב-production

זרימת נתונים:

- **Production:** משימות → `tasksRepository` → local adapter; ספקים → `supplierAdapter` (local).
- **Debug Supabase:** `?debugBackend=supabase` → `tasksRepository` → `supabaseTasksAdapter`; ספקים עדיין local.
- **Bootstrap:** `bootstrapTasks()` טוען async לפני render.

הערה:

- העדפות, קטגוריות ומשתמשים עדיין חלקית ישירות ב־localStorage.

## מצב Supabase

### מה הושלם ואומת

- SQL: `supabase/schema.sql`, `rls.sql`, `seed.sql`, `smoke-test.sql`
- Schema deployed על **Yo-man** (`jxjxjvxbxpgvlarzbohm.supabase.co`)
- Client + connection test + bundled adapters
- Unified tasks adapter (read + write)
- Async runtime + `tasksRepository` facade
- Google OAuth + session bootstrap (debug console path)
- Organization membership context
- Task CRUD E2E via `testSupabaseTaskCrudViaRepository()`

### מה עדיין לא בוצע

- **Production switch** — `DATA_BACKEND` נשאר `"local"` (אין flip ל-production)
- **Migration** — localStorage → DB
- **Suppliers Supabase** — adapter stub קיים; runtime production עדיין local
- **Production Google Login UI** — OAuth עובד ב-debug בלבד
- **File attachments** — Supabase Storage
- **Push notifications**

## Next recommended phase

**לא לעבור עדיין ל־production `DATA_BACKEND = "supabase"`.**

סדר מומלץ:

1. **Suppliers Supabase adapter** — read/write + RLS
2. **Production auth UI** — Google Login במסך (לא רק debug console)
3. **Migration script** — localStorage → DB
4. **Production backend switch** — רק אחרי suppliers + auth + migration
5. File attachments, push notifications

## תגיות וקומיטים חשובים

תגיות:

- `stable-before-supabase`
- `stable-local-adapters`
- `stable-supabase-client-prepared`
- `stable-bat-ayin-schema-namespace`
- `stable-supabase-mapping`
- `stable-docs-after-move`
- `stable-tasks-repository`
- `stable-supabase-write-adapter`
- `stable-supabase-unified-adapter`
- `stable-async-runtime`
- `stable-supabase-task-crud`
- `stable-supabase-task-crud-e2e` ← **יציב נוכחי**

קומיטים אחרונים:

- `1dbdd1a` — End-to-end Supabase task CRUD
- `b3d3a9c` — Complete Supabase task mutations
- `c422d08` — Make runtime async-ready
- `7e392a3` — Unify Supabase adapters
- `bf70287` — Add Supabase tasks write adapter
- `bc5b14b` — Add tasksRepository facade and Supabase write debug validation

## TODO / Roadmap

1. ~~Supabase preparation~~ — **הושלם**
2. ~~Supabase read adapter~~ — **הושלם** (unified adapter)
3. ~~Supabase write adapter~~ — **הושלם** (debug/E2E)
4. ~~Async bootstrap~~ — **הושלם**
5. ~~Task CRUD E2E~~ — **הושלם** (`stable-supabase-task-crud-e2e`)
6. ~~Google OAuth (debug)~~ — **הושלם**
7. **Suppliers Supabase** — adapter + runtime
8. **Production auth UI**
9. **Migration** localStorage → DB
10. **Production backend switch**
11. File attachments
12. Push notifications
