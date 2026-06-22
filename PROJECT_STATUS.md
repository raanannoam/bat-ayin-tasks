# מצב הפרויקט

עדכון נכון לקומיט:

```text
ea4ddc4 Add initial Supabase schema
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
- ה־backend הפעיל הוא localStorage.
- קיימת שכבת adapters למשימות ולספקים.
- קיימת הכנה ראשונית ל־Supabase, כולל schema SQL ראשוני, אך אין עדיין מעבר נתונים או auth.
- קיימת תשתית PWA בסיסית עם manifest, service worker ואייקונים.

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

הנתונים נשמרים כיום ב־localStorage דרך `taskAdapter`.

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
- `repositoryAdapters.local`
- `taskAdapter`
- `supplierAdapter`
- `localTasksAdapter`
- `localSuppliersAdapter`

זרימת הנתונים הנוכחית:

- משימות נטענות ונשמרות דרך `taskAdapter`.
- ספקים נטענים ונשמרים דרך `supplierAdapter`.
- `DATA_BACKEND` בוחר את adapter הפעיל מתוך `repositoryAdapters`.
- כרגע רק backend מסוג `local` פעיל.

הערה חשובה:

- העדפות, קטגוריות ומשתמשים עדיין משתמשים בחלק מהמקומות ישירות ב־localStorage.
- משימות וספקים כבר מרוכזים ב־adapters.

## מצב Supabase

מה כבר הוכן:

- תיקיית `supabase` קיימת.
- קיימים הקבצים:
  - `supabase/schema.sql`
  - `supabase/rls.sql`
  - `supabase/seed.sql`
  - `supabase/smoke-test.sql`
  - `supabase/README.md`
- קיימת תשתית RLS ו־smoke test SQL לפי `supabase/README.md`.
- קיים schema ראשוני (קומיט `ea4ddc4`).
- נוספו placeholders:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
- נוספה יצירת client בטוחה:
  - אם הספרייה לא זמינה, האפליקציה לא קורסת.
  - אם הערכים חסרים או placeholders, האפליקציה לא קורסת.
- נוספה `testSupabaseConnection()`.
- שגיאות Supabase נתפסות ונרשמות כ־`console.warn`.

מה עדיין לא בוצע:

- לא הוחלף ה־backend.
- לא הועברו משימות ל־Supabase.
- לא הועברו ספקים ל־Supabase.
- אין read-only mode מול Supabase.
- אין write support מול Supabase.
- אין Google Login.
- אין Storage.
- אין קבצים מצורפים אמיתיים.
- אין push notifications.

## תגיות וקומיטים חשובים

תגיות:

- `stable-before-supabase`
- `stable-local-adapters`
- `stable-supabase-client-prepared`

קומיטים חשובים:

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

## TODO / Roadmap

סדר עדיפות:

1. Supabase preparation
2. Supabase read-only
3. Supabase write support
4. Google Login
5. File attachments
6. Push notifications

פירוט:

1. Supabase preparation
   - schema SQL ראשוני כבר קיים (`ea4ddc4`).
   - להשלים קונפיג אמיתי במקום placeholders כאשר תהיה סביבה מוכנה.
   - להמשיך לשמור על `DATA_BACKEND = "local"` עד החלטה מפורשת.

2. Supabase read-only
   - להוסיף adapter קריאה בלבד.
   - לבדוק טעינת נתונים מול Supabase בלי כתיבה.
   - לא לשבור את localStorage fallback.

3. Supabase write support
   - להוסיף כתיבה הדרגתית דרך adapters.
   - לשמור על טיפול שגיאות ב־try/catch.
   - להחליט על אסטרטגיית migration וסנכרון.

4. Google Login
   - לחבר auth רק לאחר שה־data layer מוכן.
   - להתאים הרשאות משתמש רגיל ומנהל ל־Supabase RLS.

5. File attachments
   - לחבר Supabase Storage או פתרון קבצים אחר.
   - להחליף את שדה תיאור המסמך הזמני במודל קבצים אמיתי.

6. Push notifications
   - להרחיב את תשתית ה־PWA.
   - להגדיר הרשאות, subscription ושרת התראות מתאים.
