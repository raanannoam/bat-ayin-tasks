# Bat-ayin-tasks — Agent Onboarding

PWA בעברית וב-RTL לניהול משימות ורכש בישיבת בת עין.
פרודקשן: **https://bat-ayin-tasks.vercel.app**

---

## מבנה האפליקציה

```
outputs/
  index.html        ← כל האפליקציה: HTML + CSS + JS מוטמע. העורך הראשי.
  adapters.js       ← שכבת הנתונים. נוצר אוטומטית מ-src/ — אל תערוך ישירות.
  service-worker.js ← PWA caching. עדכן CACHE_VERSION בכל deploy.
  manifest.json     ← PWA metadata.
  icons/            ← אייקוני PWA.
  validation-harness.js ← נטען רק בבדיקות Playwright, לא מגיע למשתמשים.

src/                ← TypeScript — מקור של adapters.js.
supabase/           ← סכמת DB, RLS, seed.
scripts/            ← build + validation tools.
docs/               ← תיעוד (roadmap, deploy instructions).
```

---

## כלל אחד: שינוי UI — עורך `outputs/index.html`. שינוי לוגיקת נתונים — עורך `src/` ואחר כך מריץ `npm run build:adapters`.

---

## Deploy

**כל push ל-master → Vercel מפרס אוטומטית.**

חובה בכל שינוי ב-`outputs/`:
```js
// outputs/service-worker.js — שורה 1
const CACHE_VERSION = "beit-tasks-pwa-vXX"; // ← להעלות X ב-1
```
בלי עדכון גרסה, משתמשים עם PWA מותקן יקבלו את הגרסה הישנה מה-cache.

---

## Backend

| מצב | מפעיל | נתונים |
|-----|--------|--------|
| `local` (ברירת מחדל) | כל פתיחה ישירה | localStorage |
| `supabase` | התחברות עם Google OAuth | Supabase PostgreSQL |

`DATA_BACKEND` נקבע ב-`src/pilot/pilotConfig.ts`. **אל תשנה לברירת מחדל supabase ללא בקשה מפורשת.**

---

## הרצת בדיקות

```bash
npm run build          # בדיקת TypeScript בלבד (ללא פלט)
npm run build:adapters # בניית adapters.js מ-src/
npm run build:all      # שניהם יחד
npm run validate       # build + static + browser (Playwright)
```

---

## כללי Stage 0 (ייצוב פיילוט)

- תיקוני באגים ושיפורי UI בלבד — אין refactor, אין infrastructure חדש
- כל שינוי עובר דרך `git commit` + push
- ה-Supabase anon key מותר ב-repo (public key, RLS מגן)
- תיעוד מלא: `AGENT_RULES.md`, `PROJECT_STATUS.md`, `docs/MIGRATION_ROADMAP.md`
