# תכנון מיפוי: אפליקציה ↔ Supabase

מסמך תכנון בלבד. לא משנה קוד ולא מחליף adapters.

**מקורות:**

- אפליקציה: `outputs/index.html` — `normalizeTask`, `normalizeUpdate`, `normalizeSupplier`, `loadCategories`, `loadPeople`
- DB: `supabase/schema.sql`, `supabase/seed.sql`

**קבועים לכל המיפוי:**

| קבוע | ערך |
|------|-----|
| `DEFAULT_ORGANIZATION_ID` | `00000000-0000-0000-0000-000000000001` (מ-`seed.sql`) |
| תפקיד מנהל באפליקציה | `צבי` ↔ `organization_members.role = 'manager'` |
| תאריכים באפליקציה | `YYYY-MM-DD` (string) |
| תאריכים ב-Supabase | `date` / `timestamptz` |

---

## 1. Tasks

### 1.1 שדות משימה (`tasks` table + `task_updates`)

לאחר `normalizeTask`, אובייקט משימה באפליקציה מכיל:

| שדה באפליקציה | טיפוס באפליקציה | שדה Supabase | טבלה | Conversion נדרש? | הערות |
|---------------|-----------------|--------------|------|------------------|--------|
| `id` | string (`"t1"`, `"t1709..."`) | `id` | `tasks` | **כן** | App: string. DB: `uuid`. ב-read: UUID→string או שמירת `local_id` ב-cache. ב-write: `gen_random_uuid()` + טבלת מיפוי `local_id → uuid`. |
| — | — | `organization_id` | `tasks` | **כן** | לא קיים באפליקציה. תמיד `DEFAULT_ORGANIZATION_ID`. |
| `category` | slug string | `category_id` | `tasks` | **כן** | slug → UUID דרך `categories` (ראו סעיף 2). |
| `owner` | display name | `assignee_id` | `tasks` | **כן** | שם → `profiles.id` (ראו סעיף 3). |
| — | — | `created_by` | `tasks` | **כן** | לא נשמר באפליקציה. ב-write: `auth.uid()` של המשתמש המחובר. |
| `title` | string | `title` | `tasks` | לא | ישיר |
| `notes` | string | `notes` | `tasks` | לא | ברירת מחדל `''` ב-DB |
| `status` | `"progress"` \| `"done"` | `status` | `tasks` | לא | ערכים זהים |
| `priority` | `"normal"` \| `"high"` | `priority` | `tasks` | לא | ערכים זהים. שים לב: `normalizeTask` מגדיר `high` לפי `index % 5` אם חסר — ב-Supabase לשמור ערך מפורש. |
| `due_date` | `YYYY-MM-DD` \| null | `due_date` | `tasks` | **קל** | string → `date`. null נשאר null. |
| `dueLabel` | string (עברית) | `due_label` | `tasks` | **קל** | שם שדה שונה. ב-read: אפשר לחשב מ-`due_date` via `taskDueLabel()` ולא לסמוך על DB. |
| `due` | `"today"` \| `"tomorrow"` \| `"date"` \| `"done"` \| `"none"` | — | — | **כן (derived)** | אין עמודה. לשחזר מ-`due_date` + `status`: `done`→`"done"`, null→`"none"`, השוואה ליום→`"today"`/`"tomorrow"`/`"date"`. |
| `reminder` | object | `reminder` | `tasks` | **קל** | JSONB. מבנה: `{ enabled, timing, amount, unit }`. ברירת מחדל DB: `{"enabled": false}`. |
| `created_at` | `YYYY-MM-DD` | `created_at` | `tasks` | **כן** | App: date-only string. DB: `timestamptz`. read: `toISOString().slice(0,10)` או שמירת noon UTC. write: `created_at::timestamptz` או `now()`. |
| — | — | `updated_at` | `tasks` | **כן (derived)** | DB מנהל trigger. באפליקציה אין — לא להציג / לעדכן ידנית. |
| `completed_at` | `YYYY-MM-DD` \| null | `completed_at` | `tasks` | **כן** | App: date string. DB: `timestamptz`. חובה לא-null כש-`status='done'` (CHECK + trigger). |
| `deleted_at` | `YYYY-MM-DD` \| null | `deleted_at` | `tasks` | **כן** | App: date string (soft delete). DB: `timestamptz`. read: null = פעיל. |
| `deleted_by` | display name \| null | `deleted_by` | `tasks` | **כן** | שם → `profiles.id`. |
| `createdLabel` | string | — | — | **לא** | UI בלבד ביצירה; לא נשמר ב-normalize. לא למפות. |
| `updates[]` | array (nested) | — | `task_updates` | **כן** | טבלה נפרדת. ראו 1.2. |

### 1.2 שדות עדכון משימה (`updates[]` → `task_updates`)

| שדה באפליקציה | טיפוס | שדה Supabase | Conversion | הערות |
|---------------|-------|--------------|------------|--------|
| — (אין id) | — | `id` | **כן** | UUID חדש בכל insert. אין עריכת update באפליקציה לפי index. |
| — | — | `organization_id` | **כן** | `DEFAULT_ORGANIZATION_ID` |
| — (parent) | — | `task_id` | **כן** | UUID של המשימה האב |
| `by` | display name | `author_id` | **כן** | שם → `profiles.id` |
| `text` | string | `body` | **קל** | שם שדה שונה |
| `created_at` | `YYYY-MM-DD` | `created_at` | **כן** | date string → timestamptz |
| `notify_participants` | boolean | `notify_participants` | לא | |
| `notification_status` | string | `notification_status` | לא | `"pending"` \| `"sent"` \| `"failed"` \| `"skipped"` |
| — | — | `updated_at` | derived | DB |
| — | — | `deleted_at` | — | אין soft delete לעדכונים באפליקציה |
| — | — | `deleted_by` | — | אין |

### 1.3 הרכבה ב-adapter (read)

```
SELECT tasks.*, task_updates.*
JOIN categories ON ...
JOIN profiles AS assignee ON tasks.assignee_id = assignee.id
→ map to app task object
```

- סינון: `deleted_at IS NULL` (RLS כיום לא מסנן — adapter חייב).
- `updates`: `ORDER BY created_at ASC`, קיבוץ לפי `task_id`.

### 1.4 פיצול ב-adapter (write)

- INSERT/UPDATE `tasks` — ללא מערך `updates` מקונן.
- INSERT ל-`task_updates` — רק עדכונים חדשים ( diff לפי timestamp / id ).
- `completeTask`: `status='done'`, `completed_at=now()`, `due_date=null`, `reminder.enabled=false`.
- `reopenTask`: `status='progress'`, `completed_at=null` (trigger מאפס).

---

## 2. Categories

### 2.1 מודל באפליקציה

| מקור | מבנה |
|------|------|
| `baseCategories` | `{ id: slug, label, icon }` — slugs: `kitchen`, `maintenance`, … |
| `beit-categories` | קטגוריות מותאמות: `{ id: "custom-{timestamp}", label, icon: "office" }` |
| `beit-hidden-categories` | מערך slugs מוסתרים (soft hide, לא מחיקה מ-DB) |
| שימוש במשימות | `task.category` = `id` (slug), לא `label` |

### 2.2 מודל ב-Supabase (`categories`)

| שדה DB | מקביל באפליקציה | Conversion |
|--------|-----------------|------------|
| `id` | — | UUID פנימי |
| `organization_id` | — | קבוע |
| `name` | `label` | ישיר |
| `icon` | `icon` | ישיר |
| `color` | — | אין באפליקציה — null |
| `is_active` | לא ב-`beit-hidden-categories` | `false` אם slug ב-hidden |
| `sort_order` | סדר ב-`baseCategories` | מ-seed |
| `deleted_at` / `deleted_by` | מחיקת מנהל | soft delete — שונה מ-hide |

### 2.3 אפשרות א: הוספת `slug` ל-`categories`

```sql
-- עתידי, לא מיושם כעת
slug text not null,
unique (organization_id, slug)
```

| יתרון | חיסרון |
|-------|--------|
| התאמה 1:1 ל-`task.category` | דורש migration SQL + עדכון seed |
| מיגרציה מ-localStorage ללא UUID קשיח ב-adapter | עמודה נוספת |
| קטגוריות מותאמות: `custom-1709...` נשמרות כ-slug | |
| שינוי `label` לא שובר קישור למשימות | |

**seed מוצע (עתידי):**

| slug | name | icon | seed UUID |
|------|------|------|-----------|
| `kitchen` | מטבח | kitchen | `10000000-...-0001` |
| … | … | … | … |

### 2.4 אפשרות ב: mapping דרך adapter בלבד

| אסטרטגיה | תיאור | סיכון |
|----------|--------|-------|
| B1 — לפי `name` | `label` ↔ `categories.name` | שינוי שם שובר משימות |
| B2 — לפי `icon` | רק ל-base (icons ייחודיים) | custom תמיד `office` — לא עובד |
| B3 — map קשיח בקוד | `{ kitchen: "10000000-...-0001" }` | כפילות עם seed, שביר בהוספת קטגוריה |
| B4 — טעינה + cache | `Map<slug, uuid>` בזיכרון | **דורך slug** — בלי slug ב-DB צריך B3 או B1 |

### 2.5 המלצה מנומקת

**להוסיף `categories.slug` (אפשרות א).**

**נימוקים:**

1. האפליקציה משתמשת ב-**slug כמפתח יציב** — לא בשם העברי.
2. `unique (organization_id, name)` לא מספיק — שמות משתנים ב-UI; slugs לא.
3. קטגוריות מותאמות כבר נוצרות עם id ייחודי (`custom-{timestamp}`) — מתאים לעמודת slug.
4. adapter-only (B3) משכפל UUIDs מ-`seed.sql` ונשבר בכל סביבה עם seed שונה.
5. מיפוי לפי שם (B1) שברירי בעברית (טעויות, ניקוד, עריכה).

**עד שלב slug:** adapter זמני יכול להשתמש ב-map קשיח של 6 הקטגוריות מ-seed + fallback לפי `name` לקטגוריות custom.

---

## 3. Users

### 3.1 מודל באפליקציה

| מקור | תוכן |
|------|------|
| `basePeople` | `["עדינה", "אבי", "חיה", "צבי"]` — strings |
| `beit-people` | שמות נוספים |
| `beit-hidden-people` | שמות מוסתרים מה-UI |
| `task.owner` / `updates[].by` | display name |
| `state.role` | mockup: `"user"` \| `"manager"` — לא Auth אמיתי |
| `personalOwner()` | mockup: `"עדינה"` (user) / `"צבי"` (manager) |

### 3.2 מודל ב-Supabase

| טבלה | שדות רלוונטיים |
|------|----------------|
| `profiles` | `id` (= `auth.users.id`), `display_name`, `email` |
| `organization_members` | `user_id`, `organization_id`, `role`, `is_active` |

### 3.3 מיפוי שם → UUID

**שלב 5 (Google Login) — מקור האמת:**

```
auth.users (Google)
  → profiles (display_name, email)
  → organization_members (role: manager | user)
```

**טבלת התאמה מ-seed (placeholder):**

| display_name | email (placeholder) | role | הערה |
|--------------|---------------------|------|------|
| עדינה | adina@example.com | user | להחליף email אמיתי |
| אבי | avi@example.com | user | |
| חיה | chaya@example.com | user | |
| צבי | tzvi@example.com | manager | |

**Cache ב-adapter:**

```javascript
// פсевдо-קוד — לא ליישום כעת
profileDirectory = {
  byName: Map<display_name, { id, role, is_active }>,
  byId: Map<uuid, display_name>
}
```

**טעינה:**

```sql
SELECT p.id, p.display_name, p.email, om.role, om.is_active
FROM profiles p
JOIN organization_members om ON om.user_id = p.id
WHERE om.organization_id = :org_id;
```

**Conversion:**

| כיוון | פעולה |
|-------|--------|
| App → DB | `owner: "עדינה"` → `assignee_id = profileDirectory.byName.get("עדינה").id` |
| DB → App | `assignee_id` → `owner = profileDirectory.byId.get(uuid)` |
| `deleted_by` | אותו מיפוי |
| `updates[].by` | → `author_id` |

**כשלונות:**

- שם לא קיים → שגיאת validation / fallback למשתמש המחובר.
- שני profiles עם אותו `display_name` → **אסור** — ל enforce uniqueness per org בזמן onboarding.
- `beit-hidden-people` → `organization_members.is_active = false` (לא מחיקה).

**mockup role → Auth:**

- `?mockup=manager` / `sessionStorage` — **יוסר** בשלב 5.
- `canAccessTask` / `canAccessSupplier` — יעברו ל-RLS + `auth.uid()` + `organization_members.role`.

---

## 4. Suppliers

ישות באפליקציה = **הזמנת ספק** (לא קטalog `suppliers` נפרד).

### 4.1 מיפוי שדות ראשיים → `supplier_orders`

| שדה באפליקציה | שדה Supabase | Conversion |
|---------------|--------------|------------|
| `id` | `id` | string → uuid (+ מיפוי local) |
| — | `organization_id` | קבוע |
| `supplier` | `supplier_name` | ישיר |
| — | `supplier_id` | **אופציונלי** — null בשלב ראשון; עתיד: upsert ל-`suppliers` |
| `description` | `description` | ישיר |
| `amount` | `amount_text` | ישיר (טקסט חופשי, לא numeric) |
| `due_date` | `due_date` | string → date \| null |
| `notes` | `notes` | ישיר |
| `document_notes` | `document_notes` | ישיר |
| `created_at` | `created_at` | date string → timestamptz |
| — | `created_by` | `auth.uid()` ב-write |
| `deleted_at` | `deleted_at` | **שים לב:** `normalizeSupplier` לא מחזיר — adapter write/read חייב לטפל |
| `deleted_by` (name) | `deleted_by` | שם → uuid |

### 4.2 `assignees[]` + `allAssignees`

**אפליקציה:**

```javascript
allAssignees: false, assignees: ["עדינה", "אבי"]
allAssignees: true,  assignees: []
```

**Supabase:**

```sql
all_assignees boolean
assignee_ids uuid[]
check (all_assignees = true OR cardinality(assignee_ids) > 0)
```

| App → DB | |
|----------|---|
| `allAssignees === true` | `all_assignees = true`, `assignee_ids = '{}'` |
| `allAssignees === false` | `all_assignees = false`, `assignee_ids = assignees.map(name → profileUuid)` |

| DB → App | |
|----------|---|
| `all_assignees === true` | `allAssignees: true`, `assignees: []` |
| else | `allAssignees: false`, `assignee_ids.map(uuid → displayName)` |

**הרשאות (לפני write):** להשלים RLS — כיום **אין** policies על `supplier_orders`.

**סינון visibility (כמו `canAccessSupplier`):**

```
manager → כל ההזמנות
user    → all_assignees OR auth.uid() = ANY(assignee_ids)
```

### 4.3 `steps` + `step_dates`

**אפליקציה:**

```javascript
steps:      { order, received, payment, invoice }  // boolean
step_dates: { order: "2026-06-22", received: "", ... }
```

**Supabase — מיפוי שלבים:**

| app `steps` key | boolean column | date column |
|-----------------|----------------|-------------|
| `order` | `order_completed` | `order_completed_at` |
| `received` | `received_completed` | `received_completed_at` |
| `payment` | `payment_completed` | `payment_completed_at` |
| `invoice` | `invoice_completed` | `invoice_completed_at` |

**Conversion App → DB:**

```
order_completed      = steps.order
order_completed_at   = step_dates.order || null  (empty string → null)
```

**Conversion DB → App:**

```
steps.order = order_completed
step_dates.order = order_completed_at ? toIsoDate(order_completed_at) : ""
```

**`updateSupplierStage`:** checked + dateValue — אם `dateValue` נתון, שלב = true + תאריך.

**`markAllSupplierStages`:** כל ה-booleans true + תאריכים = היום לשלבים חסרים.

### 4.4 `links[]`

**אפליקציה:** `links: ["https://...", ...]` — מערך strings.

**Supabase:** `supplier_order_links` — שורה לכל קישור.

| App field | DB field | Conversion |
|-----------|----------|------------|
| URL string | `url` | ישיר |
| — | `link_type` | `'link'` (ברירת מחדל) |
| — | `label` | null או hostname מה-URL |
| — | `organization_id` | קבוע |
| — | `supplier_order_id` | FK להזמנה |
| `document_notes` (טקסט) | **לא** ב-links | נשאר ב-`supplier_orders.document_notes` |
| עתיד: קבצים | `attachment_path`, `link_type='attachment_placeholder'` | לא באפליקציה כיום |

**Read:** `SELECT * FROM supplier_order_links WHERE supplier_order_id = ? AND deleted_at IS NULL` → `links = rows.map(r => r.url).filter(Boolean)`.

**Write:** replace strategy — מחק (soft) קישורים ישנים / diff by url — בשלב write מלא.

---

## 5. Migration Strategy

### עקרונות

- `DATA_BACKEND` נשאר `"local"` עד החלטה מפורשת.
- כל שלב: adapter חדש ב-`repositoryAdapters` + fallback ל-local.
- `organization_id` קבוע בשלב ראשון (ארגון יחיד).
- Auth mockup פעיל עד שלב 5.

### שלב 1: Tasks read-only

**מטרה:** טעינת משימות מ-Supabase להצגה, כתיבה עדיין local (או read-only UI).

| פעולה | פירוט |
|-------|--------|
| SQL | `schema` + `rls` + `seed` + (עתידי) `categories.slug` |
| Adapter | `supabaseTasksReadAdapter.loadTasks()` |
| Cache | `profileDirectory`, `categoryDirectory` |
| Join | tasks + task_updates + categories + profiles |
| Fallback | אם Supabase לא מוגדר → `localTasksAdapter` |

**לא בשלב זה:** INSERT/UPDATE/DELETE.

### שלב 2: Tasks write

**מטרה:** CRUD משימות + עדכונים דרך Supabase.

| פעולה | פירוט |
|-------|--------|
| Auth | session נדרש — לפחות `auth.uid()` (עדיין לא Google — service / test users) |
| Write | create / update / soft delete / complete / reopen |
| Updates | INSERT ל-`task_updates` בלבד (לא replace כל המערך) |
| Id map | `localStorage` key `beit-task-id-map` או UUID ישיר ב-app |
| Dual-write | **לא מומלץ** — לבחור backend אחד |

### שלב 3: Suppliers read-only

**מטרה:** הצגת הזמנות ספק מ-Supabase.

| פעולה | פירוט |
|-------|--------|
| SQL | **חובה:** RLS על `supplier_orders`, `supplier_order_links`, `suppliers` |
| Query | orders + links nested |
| Map | steps, assignees, links (סעיף 4) |
| Fallback | local |

### שלב 4: Suppliers write

**מטרה:** CRUD הזמנות, שלבים, קישורים.

| פעולה | פירוט |
|-------|--------|
| Create | INSERT order + bulk INSERT links |
| Stage update | UPDATE boolean + date columns |
| Delete | soft delete |
| Constraint | `all_assignees OR assignee_ids` — validation לפני send |

### שלב 5: Google Login

**מטרה:** Auth אמיתי, mockup roles יוצאים.

| פעולה | פירוט |
|-------|--------|
| Auth | Supabase Google provider |
| Profile | trigger / hook: `auth.users` → `profiles` |
| Members | הרצת קטע seed members עם emails אמיתיים |
| Role | `organization_members.role` במקום `state.role` |
| Prefs | `beit-prefs` → `user_preferences` (`dark`→`dark_mode`, `text`→`text_size`) |
| Hidden people/categories | `is_active` / `deleted_at` |

### תרשים זרימה

```
[localStorage] ──read-only──► Supabase tasks (1)
[localStorage] ──write──────► Supabase tasks (2)
[localStorage] ──read-only──► Supabase suppliers (3)
[localStorage] ──write──────► Supabase suppliers (4)
[mockup role] ──replace─────► Google Auth + RLS (5)
```

---

## 6. Risk Analysis

### שלב 1 — Tasks read-only

| סיכון | השפעה | מitigation |
|-------|--------|------------|
| אין `categories.slug` | מיפוי category שגוי | map זמני / slug בעתיד |
| שמות ללא profile | `owner` ריק / שגיאה | profiles + members לפני read |
| RLS לא מסנן `deleted_at` | משימות מחוקות נראות | סינון ב-adapter |
| `dueLabel` vs חישוב | תצוגה שונה | להעדיף חישוב מ-`due_date` |
| updates nested vs table | עדכונים חסרים | JOIN חובה |
| תאריכים date vs timestamptz | סטיות timezone | noon UTC convention |

### שלב 2 — Tasks write

| סיכון | השפעה | mitigation |
|-------|--------|------------|
| CHECK `done` + `completed_at` | INSERT נכשל | תמיד ל set `completed_at` עם `status=done` |
| Trigger assignee member | assign ללא membership | וידוא org_members לפני write |
| Trigger reassignment | user משנה owner | לשמור התנהגות mockup / RLS |
| אין id ל-updates | duplicates | UUID per insert; לא replace all |
| מיפוי id string↔uuid | כפילויות / אובדן | טבלת מיפוי מקומית |
| `author_id` null | trigger נכשל | תמיד `auth.uid()` |

### שלב 3 — Suppliers read-only

| סיכון | השפעה | mitigation |
|-------|--------|------------|
| **אין RLS** | חשיפת נתונים | SQL policies לפני שלב |
| `normalizeSupplier` מאבד `deleted_at` | הזמנות "חיות" | תיקון adapter (עתידי) |
| `assignee_ids` GIN | שגיאת query | `@>` / `contains` syntax |
| links ריקים | UI ריק | OK |

### שלב 4 — Suppliers write

| סיכון | השפעה | mitigation |
|-------|--------|------------|
| CHECK assignees | create נכשל | validation לפני submit |
| links replace | קישורים כפולים | transaction + delete old |
| step date type | `date` vs string | normalize empty → null |
| `supplier_id` null | OK by design | optional FK |

### שלב 5 — Google Login

| סיכון | השפעה | mitigation |
|-------|--------|------------|
| email mismatch seed | אין membership | עדכון seed + onboarding |
| duplicate display_name | מיפוי שם שגוי | unique per org policy |
| mockup role removed | QA שונה | test users |
| `beit-prefs.text` = `"רגיל"` | DB expects `"regular"` | mapping table |
| migration localStorage | אובדן נתונים | export/import script חד-פעמי |
| RLS + manager | צבי חייב manager role | seed + verify |

---

## 7. ישויות נוספות (קצר)

### User preferences

| App (`beit-prefs`) | Supabase (`user_preferences`) | Conversion |
|--------------------|-------------------------------|------------|
| `dark` | `dark_mode` | boolean |
| `text` (`"רגיל"`) | `text_size` (`"regular"`) | map: `רגיל→regular`, `גדול→large` (אם יוסף) |

### localStorage ללא מקבילה ב-DB

| מפתח | טיפול מומלץ |
|------|-------------|
| `beit-version` | client-only; לא למיגרציה |
| `beit-hidden-categories` | `categories.is_active = false` |
| `beit-hidden-people` | `organization_members.is_active = false` |
| `sessionStorage beit-mockup-role` | יוסר בשלב 5 |

---

## 8. המלצה סופית: `categories.slug`

### **כן — להוסיף `categories.slug` לטבלת `categories`.**

**סיכום:**

| קriterion | slug ב-DB | adapter-only |
|----------|-----------|--------------|
| התאמה ל-`task.category` | מלאה | חלקית / שבירה |
| קטגוריות custom | `custom-*` ישיר | בעייתי |
| שינוי label | בטוח | שובר מיפוי by name |
| תחזוקה | seed + migration אחת | map כפול בקוד |
| מיגרציה localStorage | slug נשמר | UUIDs קשיחים |

**צעדים מומלצים (עתידיים, לא בוצעו):**

1. `ALTER TABLE categories ADD COLUMN slug text;`
2. `UPDATE` slugs ל-6 קטגוריות seed + `unique (organization_id, slug)`
3. `NOT NULL` אחרי backfill
4. עדכון `seed.sql` — INSERT כולל slug
5. adapter: `category_id = directory.bySlug.get(task.category)`

---

## 9. סיכום executive

| מודול | מוכנות מיפוי | חסם עיקרי |
|-------|--------------|-----------|
| Tasks | גבוה | slug categories, name→uuid, id map |
| Categories | בינוני | **חסר slug** |
| Users | בינוני | Auth + profiles לפני write |
| Suppliers | בינוני | RLS + steps/links split |
| Prefs | גבוה | enum text_size |

**סדר עבודה מומלץ:** slug → profiles seed → tasks read → tasks write → RLS suppliers → suppliers read/write → Google Login → migration script.

---

*מסמך זה נוצר כתכנון בלבד. לא בוצע commit ולא שונה קוד אפליקציה.*
