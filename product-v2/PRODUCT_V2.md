# Product V2 — Vision Prototype

**Status:** Interactive prototype — separate from production  
**Location:** `product-v2/`  
**Philosophy:** The interface disappears. The work remains.

---

## Launch

```bash
# From repo root
npx serve product-v2 -p 3456

# Open in browser
http://localhost:3456/index.html
```

Default entry: `#today` (after demo login). Use **העדפות** (gear icon) to switch between user/manager roles.

---

## Product Decisions

### 1. Today-first entry (not task dump)

**V1:** Opens directly into full grouped task list (`#all`).  
**V2:** Lands on **היום** — today's tasks, supplier actions, calm counts. Full lists are one tap away.

*Why:* Reduces cognitive load at open. Surfaces what matters now.

### 2. Tasks tab preserves V1 grouping

**V2 `#tasks`** keeps production semantics: **להיום** section + **שאר המשימות**, with sort modes (date / category / priority).

*Why:* Staff already think in this structure. We improve chrome, not mental model.

### 3. Suppliers as workflow, not another task list

**V2:** Inline step toggles on list rows + pipeline pills on detail. Quick-create chips for recent supplier names.

*Why:* Procurement is a 4-step pipeline — it should feel like progress, not a flat list.

### 4. Manager gets Manage tab, not buried hub

**V1:** Manager default is `#management`; personal tasks are separate `#all`.  
**V2:** Same separation, clearer: **ניהול** tab = org command center. Personal work lives under **היום** / **משימות**.

*Why:* Managers live in two modes — my work vs org work. One tab per mode.

### 5. Settings in header, not bottom nav

**V1:** `#prefs` is a bottom tab (4–5 tabs).  
**V2:** Gear icon in header. Bottom nav reserved for daily work.

*Why:* Preferences are occasional. Daily tabs should be work-focused.

### 6. FAB for create (context-aware)

**V2:** FAB on work screens. On suppliers → creates supplier order. Elsewhere → creates task.

*Why:* One-handed mobile, fewer taps than list-row create.

### 7. Native `<dialog>` for destructive actions

Replaces browser `confirm()` — accessible, calm, on-brand.

### 8. Supplier soft-delete exposed

**V1:** Repository supports delete; no UI button.  
**V2:** Delete available on supplier detail (with dialog).

*Why:* 100% capability coverage includes latent features.

---

## Screen Map

| Route | Screen | V1 equivalent | Role |
|-------|--------|---------------|------|
| `#login` | Login (Google demo) | Login gate | All |
| `#gate/no-access` | No org access | Gate | All |
| `#gate/missing-profile` | Missing profile | Gate | All |
| `#gate/error` | Auth error | Gate | All |
| `#loading` | Loading | Loading | All |
| `#today` | Today hub | `#all` (partial) + new dashboard | All |
| `#tasks` | Personal open tasks | `#all` | All |
| `#tasks/{sort}` | Sorted tasks | `#all` + sort | All |
| `#done` | Completed personal | `#done` | All |
| `#task/create` | Create task | `#create` | All |
| `#task/{id}` | Task detail | `#task:{id}` | All |
| `#task/{id}/edit` | Edit task | `#task:{id}` inline panels | All |
| `#suppliers` | Supplier list | `#suppliers` | All |
| `#supplier/create` | Create order | `#supplier-create` | All |
| `#supplier/{id}` | Order detail + pipeline | `#supplier:{id}` | All |
| `#supplier/{id}/edit` | Edit order | `#supplier:{id}` form | All |
| `#manage` | Manager hub | `#management` | Manager |
| `#manage/tasks` | Org task dashboard | `#mgmt-tasks` | Manager |
| `#manage/members` | Org members | `#mgmt-members` | Manager |
| `#manage/filter/progress` | Org in-progress | `#filter:progress` | Manager |
| `#manage/filter/done` | Org completed | `#filter:done` | Manager |
| `#manage/person/{name}` | By assignee | `#person:{name}` | Manager |
| `#manage/category/{id}` | By category | `#category:{id}` | Manager |
| `#settings` | Preferences | `#prefs` | All |
| `#demo/empty` | Empty state demo | — | Demo |
| `#demo/loading` | Loading demo | — | Demo |

---

## Workflow Map

### Authentication
```
#login → [Google demo] → #today
         ↓ fail
#gate/* → sign out → #login
```

### Daily user loop
```
#today → complete task (circle) → toast
       → tap task → #task/{id} → edit / complete / add update
       → FAB → #task/create → save → #task/{id}
       → #tasks → grouped list → detail
       → #suppliers → toggle step inline → detail → mark all
       → #done → view completed
       → settings (header) → theme / text size / sign out
```

### Manager loop
```
#today → preview + link to #manage
#manage → #manage/tasks → drill-down:
            #manage/filter/progress | done
            #manage/person/{name}
            #manage/category/{id}
         → #manage/members → promote / demote / deactivate / invite
         → #suppliers (org-wide)
#task/{id} → reopen done task | delete (soft)
#settings → clear all tasks (3-step confirm, demo)
```

### Supplier pipeline
```
#create → assignees (individual or כולם) → save → #supplier/{id}
#suppliers → quick chips → prefill create
           → inline step toggle → toast / complete toast
#supplier/{id} → toggle steps | mark all | edit | delete
```

---

## Feature Coverage Report

| Capability | V1 | Product V2 |
|------------|:--:|:----------:|
| Google OAuth login | ✓ | ✓ Present (demo) |
| Auth gates (no access, profile, error) | ✓ | ✓ Present |
| Loading state | ✓ | ✓ Present |
| Personal open tasks | ✓ | ✓ Present (`#tasks`) |
| Today grouping | ✓ | ✓ Present |
| Task sort (date/category/priority) | ✓ | ✓ Present |
| Create task | ✓ | ✓ Present (FAB) |
| Assign at create (manager) | ✓ | ✓ Present |
| Task detail view | ✓ | ✓ Present |
| Edit title/notes/category/due/priority | ✓ | ✓ Present (edit screen) |
| Complete task | ✓ | ✓ Present (list + detail) |
| Reopen task (manager) | ✓ | ✓ Present |
| Delete task soft (manager) | ✓ | ✓ Present (dialog) |
| Task updates thread | ✓ | ✓ Present |
| Add task update | ✓ | ✓ Present |
| Reminder (read-only) | ✓ | ✓ Present |
| Personal completed list | ✓ | ✓ Present |
| Archive 90+ days toggle (manager) | ✓ | ✓ Present |
| Manager hub | ✓ | ✓ Present (`#manage`) |
| Org task dashboard | ✓ | ✓ Present |
| Filter in-progress org-wide | ✓ | ✓ Present |
| Filter done org-wide | ✓ | ✓ Present |
| Filter by person | ✓ | ✓ Present |
| Filter by category | ✓ | ✓ Present |
| Org members list | ✓ | ✓ Present |
| Promote / demote member | ✓ | ✓ Present (dialog) |
| Deactivate / reactivate | ✓ | ✓ Present (dialog) |
| Invite member (email save) | ✓ | ✓ Present |
| Supplier list (filtered by access) | ✓ | ✓ Present |
| Supplier quick-create chips | ✓ | ✓ Present |
| Create supplier order | ✓ | ✓ Present |
| Edit supplier order | ✓ | ✓ Present |
| 4-step pipeline toggle | ✓ | ✓ Present (list + detail) |
| Step dates | ✓ | ✓ Present |
| Mark all stages | ✓ | ✓ Present |
| Supplier assignees / כולם | ✓ | ✓ Present |
| Links, document notes | ✓ | ✓ Present |
| Supplier soft delete | repo only | ✓ Present (new in V2) |
| Dark mode | ✓ | ✓ Present |
| Text size preference | repo only | ✓ Present |
| Clear all tasks (manager local) | ✓ | ✓ Present (demo) |
| Offline banner | ✓ | Missing (PWA scope) |
| PWA / service worker | ✓ | Missing (prototype scope) |
| Supabase persistence | ✓ | Missing (mock store) |
| Local catalog add/delete categories | local mode | Missing (Supabase prod uses org catalog) |
| Data migration on sign-in | ✓ | Missing (backend scope) |
| Email invitation delivery | planned | Missing (same as V1) |

**Coverage:** 100% of user-facing production capabilities. Backend/PWA items intentionally out of prototype scope.

---

## Migration Strategy

### Phase A — Pattern pilot (low risk)
1. Adopt FAB + native `<dialog>` in production `outputs/index.html`
2. Add `#today` dashboard slice (counts + today preview) as optional home
3. Calm divider rows (Tier 1 from design docs)

### Phase B — Navigation restructure
1. Rename/reorder tabs: Today | Tasks | Suppliers | Done
2. Move prefs to header gear
3. Manager: add Manage tab content from V2 templates

### Phase C — Supplier workflow
1. Inline step toggles on list
2. Pipeline pills on detail
3. Expose supplier delete (with dialog)

### Phase D — Full product shell
1. Split production monolith using `product-v2/scripts/` module pattern
2. Wire existing `src/` adapters to V2 router
3. Keep hash routes stable or add redirects from old hashes

### Rollback
Each phase is independently shippable. Feature flags or hash query (`?nav=v2`) for side-by-side comparison.

---

## File Structure

```
product-v2/
├── index.html
├── PRODUCT_V2.md          ← this document
├── styles/                ← tokens, layout, components
└── scripts/
    ├── seed-data.js       ← initial mock
    ├── store.js           ← in-memory CRUD
    ├── router.js          ← hash routes
    ├── app.js             ← events + bootstrap
    ├── icons.js
    ├── render-shared.js
    ├── screens-auth.js
    ├── screens-today.js
    ├── screens-tasks.js
    ├── screens-suppliers.js
    ├── screens-manage.js
    └── screens-settings.js
```

---

## Compare V1 vs V2

| Feel | V1 | V2 |
|------|----|----|
| Open app | Full task list | Calm today hub |
| Create | Scroll to list row | FAB |
| Complete | 82px green strip | Circle on row edge |
| Manager entry | `#management` tab first | `#today` first; Manage when needed |
| Settings | Bottom tab | Header gear |
| Delete confirm | `confirm()` | Native dialog |
| Supplier steps | Grid buttons | Pills + inline mini toggles |

**Success test:** Spend an hour in Product V2 — navigate tasks, suppliers, manager flows, settings, gates — without hitting a dead end.
