# כללי עבודה לאייג'נטים

## מטרת הפרויקט

אפליקציית PWA לניהול משימות ורכש פנימי עבור ישיבת בת עין. האפליקציה מיועדת לעבודה בעברית וב־RTL, עם מסכי משתמש רגיל ומנהל, ונשענת כרגע על localStorage כ־backend פעיל.

## Current Development Phase

**Stage 0 — Pilot Stabilization** (official; see [`docs/MIGRATION_ROADMAP.md`](docs/MIGRATION_ROADMAP.md))

All agents must follow Stage 0 until the product owner declares the pilot stable.

- **Bug fixes are allowed** — critical pilot/production issues, auth, permissions, Supabase/RLS, data integrity, Android/PWA, operator documentation.
- **Infrastructure work is postponed** — no GitHub-as-source-of-truth, CI/CD, repository cleanup, source-of-truth work, refactoring, or UI extraction.
- **Stage 0 hosting exception:** production is on Vercel (`https://bat-ayin-tasks.vercel.app`); manual `npx vercel deploy --prod` only — not migration roadmap Stage 5.
- **New features must be added to the backlog** in `PROJECT_STATUS.md` (section Backlog After Stage 0) unless explicitly approved by the product owner for the current stage.

Do not start Stage 1 or any migration stage without explicit approval after Stage 0 exit.

## חובה לפני כל שינוי

לפני כל שינוי בקבצים יש להריץ ולהציג:

```bash
pwd
git -c core.fsmonitor=false status --porcelain
git -c core.fsmonitor=false log --oneline -10
git -c core.fsmonitor=false tag
```

אם פקודות git נתקעות, להשתמש ב־`core.fsmonitor=false`.

אין לבצע שום שינוי לפני אימות שנמצאים בפרויקט הנכון:

```text
C:\Users\Noam\Projects\Bat-ayin-tasks
```

סימני זיהוי לפרויקט:

- `outputs/index.html`
- `outputs/manifest.json`
- `outputs/service-worker.js`
- תיקיית `supabase`

## Git

- HEAD נוכחי: `1dbdd1a End-to-end Supabase task CRUD`
- תג יציב: `stable-supabase-task-crud-e2e`
- אין remote מוגדר כרגע (אין `origin`).

## קומיטים חשובים קיימים

- `1dbdd1a End-to-end Supabase task CRUD`
- `b3d3a9c Complete Supabase task mutations`
- `c422d08 Make runtime async-ready`
- `7e392a3 Unify Supabase adapters`
- `bf70287 Add Supabase tasks write adapter`
- `bc5b14b Add tasksRepository facade and Supabase write debug validation`
- `ea4ddc4 Add initial Supabase schema`
- `c73f0fe Centralize local data backend configuration`
- `72abb51 Add local task data adapter`
- `9e83304 Add local supplier data adapter`

## תגיות קיימות

- `stable-before-supabase`
- `stable-local-adapters`
- `stable-supabase-client-prepared`
- `stable-tasks-repository`
- `stable-supabase-write-adapter`
- `stable-supabase-unified-adapter`
- `stable-async-runtime`
- `stable-supabase-task-crud`
- `stable-supabase-task-crud-e2e`

## כללי עבודה

- לא ליצור כפילויות של פיצ'רים, מסכים, helpers או adapters.
- לפני הוספת פיצ'ר לבדוק אם הוא כבר קיים ב־`outputs/index.html`, בתיקיית `supabase`, או בתיעוד.
- לשמור על RTL ועל עברית כברירת מחדל.
- לא לשנות UI ללא צורך מפורש.
- לא לשנות copy, צבעים, מבנה מסכים או ניווט כחלק משינוי תשתיתי.
- להעדיף שינוי קטן וממוקד על פני refactor רחב.
- לא להמציא פיצ'רים בתיעוד או בקוד. לתעד רק מה שקיים או מה שמסומן במפורש כ־TODO.

## Cursor Agent Response Style

Use compact checkpoint communication.

Default response format:

````text
CP# complete

changed:
- file
- exact functions touched

diff:
```diff
minimal relevant diff only
````

validated:

* syntax ok
* behavior unchanged / or exact runtime result

risks:

* only real risks, max 3 bullets

next:

* one suggested next checkpoint

```

Rules:

- Keep responses short.
- Do not include long tables unless requested.
- Do not repeat full architecture summaries.
- Do not explain obvious pass-through behavior at length.
- Prefer bullets over paragraphs.
- For small checkpoints, include only the minimal diff.
- Always stop after the requested checkpoint.
- Do not continue to the next checkpoint without approval.

## Ultra Compact Protocol

think compact
write compact

format:

CP# done

chg:

* ...

diff:

```diff
minimal diff only
```

val:

* syntax
* result

risk:

* max 2

next:

* one line

for audits:

find:

* ...
* ...

rec:

* one line

stop

constraints:

* no architecture recap
* no long explanations
* no tables unless requested
* no repeating prior checkpoints
* assume project context is already known
* prefer keywords over sentences
* output only information needed for the current checkpoint
* stop immediately after requested output

## מודל הרשאות

### משתמש רגיל

- רואה ומנהל את המשימות האישיות שלו.
- יכול ליצור משימה לעצמו.
- יכול לערוך משימות שנגישות לו.
- רואה ספקים שמשויכים אליו או מסומנים כ־"כולם".

### מנהל

- רואה תמונת ניהול רחבה.
- יכול לנהל משימות של כל המשתמשים.
- יכול להחזיר משימה מ"הושלם" ל"בתהליך".
- יכול לנהל קטגוריות ומשתמשים במסך הניהול.
- יכול לצפות בארכיון משימות שהושלמו לפני יותר מ־90 יום.

## כללי adapters ונתונים

ה־backend הפעיל כרגע:

```js
const DATA_BACKEND = "local";
```

מבנה adapters קיים:

- `outputs/adapters.js` — bundled `BatAyinAdapters` (מקור: `src/adaptersBundle.ts`)
- `repositoryAdapters` — `local`, `supabase` (שני backends בלבד)
- `tasksRepository` — async facade לכל גישת runtime למשימות
- `supabaseTasksAdapter` — unified Supabase adapter (read + write)
- `taskAdapter` — backend פנימי (נבחר לפי `DATA_BACKEND`, נקרא רק מתוך `tasksRepository`)
- `supplierAdapter` — תמיד local ב-production; Supabase adapter קיים ב-bundle ל-debug E2E בלבד
- `repositoryAdapters.local` — production path

כללי עבודה:

- אין לשנות את ברירת המחדל של `DATA_BACKEND` מ־`"local"` ללא בקשה מפורשת.
- אין production switch ל־Supabase — debug override (`?debugBackend=supabase`) בלבד.
- **כל גישת runtime למשימות חייבת לעבור דרך `tasksRepository`.**
- **אסור:** קריאות ישירות ל־`taskAdapter.*` מחוץ ל־`tasksRepository` ולשורת setup של ה־adapter (`repositoryAdapters` + `const taskAdapter = …`).
- ספקים/רכש חייבים לעבור דרך `supplierAdapter`.
- לא להוסיף גישה ישירה חדשה ל־localStorage עבור משימות או ספקים מחוץ ל־adapters.
- אם מוסיפים backend חדש, לחבר אותו דרך `repositoryAdapters` ולא דרך UI ישירות.
- חריג קיים בקוד: העדפות, קטגוריות ומשתמשים עדיין משתמשים בחלק מהמקומות ישירות ב־localStorage. אין להרחיב את החריג הזה; אם נוגעים באזורים האלה, לשקול adapter ייעודי.

## מצב Supabase נוכחי

מה קיים ואומת:

- תיקיית `supabase` עם SQL (schema, RLS, seed, smoke-test)
- Client בטוח + `testSupabaseConnection()`
- Bundled adapters: `outputs/adapters.js` → `BatAyinAdapters`
- Unified Supabase tasks adapter (read + write)
- Async runtime: `bootstrapTasks()`, async `tasksRepository`
- Google OAuth (debug): `debugSupabaseSignInWithGoogle()`, session bootstrap
- Organization membership context
- Task CRUD E2E via `testSupabaseTaskCrudViaRepository()`
- `DATA_BACKEND` ברירת מחדל `"local"` — UI production על localStorage

מה עדיין לא קיים:

- Production switch (`DATA_BACKEND` production = supabase)
- Migration localStorage → DB
- Suppliers Supabase runtime (local בלבד ב-UI; adapter + E2E debug קיימים)
- Production Google Login UI (OAuth debug בלבד)
- Supabase Storage / file attachments
- Push notifications

## מצב PWA נוכחי

קיים בסיס PWA:

- `outputs/manifest.json`
- `outputs/service-worker.js`
- אייקונים בתיקיית `outputs/icons`
- רישום service worker מתוך `outputs/index.html`

## בדיקות חובה לפני commit

לפני commit יש להריץ לפחות:

```bash
npm run validate
git -c core.fsmonitor=false diff --check
git -c core.fsmonitor=false status --porcelain
```

פקודות validation:

| פקודה | מה בודק |
|--------|---------|
| `npm run validate` | build + static + browser integration (פקודה ראשית) |
| `npm run validate:static` | build, PWA, bundle sync בלבד |
| `npm run validate:browser` | Playwright suites בלבד |
| `npm run validate:supabase` | Supabase CRUD (דורש session + `--require-supabase`) |
| `npm run verify` | static validation only (alias for `validate:static`) |

כאשר יש שינוי התנהגותי, יש לבדוק גם בדפדפן:

- האפליקציה נפתחת.
- אין `console.error`.
- משימות עדיין עובדות דרך localStorage.
- ספקים עדיין עובדים דרך localStorage.
- אם Supabase לא מוגדר, אין קריסה.

## תהליך סיום עבודה ו־QA

בסיום כל עבודה:

- להציג מה שונה.
- להציג בדיקות שבוצעו ותוצאות.
- להציג `git -c core.fsmonitor=false status --porcelain`.
- אם התבקשת לבצע commit, לבצע אותו עם ההודעה המדויקת שניתנה.
- לאחר commit להציג `git -c core.fsmonitor=false log --oneline -5`.
- לא להשאיר שרתי בדיקה או תהליכים זמניים פעילים אם הם נפתחו לצורך QA.
