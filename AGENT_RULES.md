# כללי עבודה לאייג'נטים

## מטרת הפרויקט

אפליקציית PWA לניהול משימות ורכש פנימי עבור ישיבת בת עין. האפליקציה מיועדת לעבודה בעברית וב־RTL, עם מסכי משתמש רגיל ומנהל, ונשענת כרגע על localStorage כ־backend פעיל.

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

- HEAD נוכחי: `ea4ddc4 Add initial Supabase schema`
- אין remote מוגדר כרגע (אין `origin`).

## קומיטים חשובים קיימים

- `ea4ddc4 Add initial Supabase schema`
- `2041384 Add project documentation for future agents`
- `b41699d Prepare Supabase client configuration`
- `c73f0fe Centralize local data backend configuration`
- `9e83304 Add local supplier data adapter`
- `72abb51 Add local task data adapter`
- `23209c3 Add task lifecycle safeguards and archival`
- `112a922 Add basic PWA install support`
- `c576e63 Add supplier purchasing workflow and management counts`
- `354c7b9 Add Supabase smoke test SQL`

## תגיות קיימות

- `stable-before-supabase`
- `stable-local-adapters`
- `stable-supabase-client-prepared`

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

- `repositoryAdapters`
- `tasksRepository` — facade לכל גישת runtime למשימות
- `taskAdapter` — backend פנימי (נבחר לפי `DATA_BACKEND`, נקרא רק מתוך `tasksRepository`)
- `supplierAdapter`
- `repositoryAdapters.local`

כללי עבודה:

- אין לשנות את `DATA_BACKEND` מ־`"local"` ללא בקשה מפורשת.
- אין להעביר קריאות אמיתיות ל־Supabase לפני שלב ייעודי.
- **כל גישת runtime למשימות חייבת לעבור דרך `tasksRepository`.**
- **אסור:** קריאות ישירות ל־`taskAdapter.*` מחוץ ל־`tasksRepository` ולשורת setup של ה־adapter (`repositoryAdapters` + `const taskAdapter = …`).
- ספקים/רכש חייבים לעבור דרך `supplierAdapter`.
- לא להוסיף גישה ישירה חדשה ל־localStorage עבור משימות או ספקים מחוץ ל־adapters.
- אם מוסיפים backend חדש, לחבר אותו דרך `repositoryAdapters` ולא דרך UI ישירות.
- חריג קיים בקוד: העדפות, קטגוריות ומשתמשים עדיין משתמשים בחלק מהמקומות ישירות ב־localStorage. אין להרחיב את החריג הזה; אם נוגעים באזורים האלה, לשקול adapter ייעודי.

## מצב Supabase נוכחי

מה קיים:

- תיקיית `supabase` עם SQL בסיסי:
  - `schema.sql`
  - `rls.sql`
  - `seed.sql`
  - `smoke-test.sql`
  - `README.md`
- ב־`outputs/index.html` קיימים:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `createSupabaseClientSafe()`
  - `testSupabaseConnection()`
- יצירת client בטוחה: אם הספרייה לא זמינה או הערכים הם placeholders, האפליקציה לא קורסת.
- שגיאות Supabase נתפסות ב־`try/catch` ונרשמות כ־`console.warn`.

מה עדיין לא קיים:

- אין מעבר נתונים ל־Supabase.
- אין קריאות production אמיתיות ל־Supabase במסלול האפליקציה.
- אין Google Login.
- אין Supabase Storage.
- אין File attachments אמיתיים.
- אין Push notifications.

## מצב PWA נוכחי

קיים בסיס PWA:

- `outputs/manifest.json`
- `outputs/service-worker.js`
- אייקונים בתיקיית `outputs/icons`
- רישום service worker מתוך `outputs/index.html`

## בדיקות חובה לפני commit

לפני commit יש להריץ לפחות:

```bash
node -e "const fs=require('fs'); const html=fs.readFileSync('outputs/index.html','utf8'); const m=html.match(new RegExp('<script>([\\\\s\\\\S]*)</script>')); new Function(m[1]); console.log('script syntax ok');"
git -c core.fsmonitor=false diff --check
git -c core.fsmonitor=false status --porcelain
```

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
