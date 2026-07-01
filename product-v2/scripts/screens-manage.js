/** מסכי ניהול — hub, משימות ארגון, חברים */
var ManageScreens = {};

ManageScreens.hub = () => {
  if (!Store.isManager()) return `<div class="screen"><h1>אין הרשאה</h1></div>`;
  const orgOpen = Store.openTasks(true);
  const orgUrgent = orgOpen.filter((t) => t.priority === "high");
  const openSuppliers = Store.visibleSuppliers().filter((s) => Store.supplierProgress(s.steps) < 100);
  return `
    <div class="screen">
      <div class="screen-section">
        <h1>ניהול</h1>
        <p class="muted small">מרכז שליטה ארגוני</p>
        ${statCards([
    [orgOpen.length, "משימות פתוחות", "manage/filter/progress"],
    [orgUrgent.length, "משימות דחופות", "manage/filter/urgent"]
  ], true)}
        ${moduleCard("manage/tasks", "tasks", "ניהול משימות", "לפי קטגוריה, מבצע וסטטוס")}
        ${moduleCard("manage/members", "users", "חברי ארגון", "תפקידים, הזמנות וניהול")}
      </div>
      <div class="screen-section">
        <span class="section-label">ספקים</span>
        ${statCards([[openSuppliers.length, "ספקים פתוחים", "suppliers"]], true)}
        ${moduleCard("suppliers", "suppliers", "ספקים", "הזמנות, תשלומים וחשבוניות")}
      </div>
    </div>`;
};

ManageScreens.tasksDashboard = () => {
  if (!Store.isManager()) return `<div class="screen"><h1>אין הרשאה</h1></div>`;
  const open = Store.openTasks(true);
  const done = Store.doneTasks(true);
  const byCat = Store.categories.map((c) => [open.filter((t) => t.category === c.id).length, c.label, `manage/category/${c.id}`]);
  const byPerson = Store.people.map((p) => [open.filter((t) => t.owner === p).length, p === Store.displayName ? "אני" : p, `manage/person/${encodeURIComponent(p)}`]);

  return `
    <div class="screen">
      ${backBar("ניהול", "manage")}
      <div class="screen-section">
        <h1>ניהול משימות</h1>
        ${statCards([
    [open.length, "בתהליך", "manage/filter/progress"],
    [done.length, "הושלמו", "manage/filter/done"]
  ], true)}
        <button class="btn btn--primary btn--block" type="button" data-route="task/create">${icon("add")} משימה חדשה</button>
      </div>
      <div class="screen-section"><span class="section-label">לפי קטגוריה</span>
        ${statCards(byCat, true)}</div>
      <div class="screen-section"><span class="section-label">לפי מבצע</span>
        ${statCards(byPerson, true)}</div>
    </div>`;
};

ManageScreens.filterList = (filter) => {
  if (!Store.isManager()) return `<div class="screen"><h1>אין הרשאה</h1></div>`;
  const isDone = filter === "done";
  const isUrgent = filter === "urgent";
  const tasks = isDone
    ? Store.doneTasks(true)
    : isUrgent
      ? Store.openTasks(true).filter((t) => t.priority === "high")
      : Store.openTasks(true);
  const title = isDone ? "משימות שהושלמו" : isUrgent ? "משימות דחופות" : "משימות בתהליך";
  Store.lastList = `manage/filter/${filter}`;
  return `
    <div class="screen">
      ${backBar("ניהול משימות", "manage/tasks")}
      <div class="screen-section"><h1>${title}</h1><p class="muted small">${tasks.length} משימות</p></div>
      ${taskList(tasks, "אין משימות", "task/create")}
    </div>`;
};

ManageScreens.personList = (name) => {
  if (!Store.isManager()) return `<div class="screen"><h1>אין הרשאה</h1></div>`;
  const tasks = Store.openTasks(true).filter((t) => t.owner === name);
  Store.lastList = `manage/person/${encodeURIComponent(name)}`;
  return `
    <div class="screen">
      ${backBar("ניהול משימות", "manage/tasks")}
      <h1>${esc(name === Store.displayName ? "אני" : name)}</h1>
      ${taskList(tasks, "אין משימות פתוחות", null)}
    </div>`;
};

ManageScreens.categoryList = (id) => {
  if (!Store.isManager()) return `<div class="screen"><h1>אין הרשאה</h1></div>`;
  const tasks = Store.openTasks(true).filter((t) => t.category === id);
  Store.lastList = `manage/category/${id}`;
  return `
    <div class="screen">
      ${backBar("ניהול משימות", "manage/tasks")}
      <h1>${esc(Store.catLabel(id))}</h1>
      ${taskList(tasks, "אין משימות בקטגוריה", null)}
    </div>`;
};

ManageScreens.members = () => {
  if (!Store.isManager()) return `<div class="screen"><h1>אין הרשאה</h1></div>`;
  const activeManagers = Store.members.filter((m) => m.isActive && m.role === "manager").length;

  const rows = Store.members.map((m) => {
    const roleLabel = m.role === "manager" ? "מנהל" : "משתמש";
    const status = m.isActive ? "" : " · לא פעיל";
    const actions = m.isActive ? `
      ${m.role === "user" ? `<button class="chip" type="button" data-action="member-promote" data-id="${m.userId}">קידום</button>` : ""}
      ${m.role === "manager" && activeManagers > 1 ? `<button class="chip" type="button" data-action="member-demote" data-id="${m.userId}">הורדה</button>` : ""}
      ${activeManagers > 1 || m.role !== "manager" ? `<button class="chip" type="button" data-action="member-deactivate" data-id="${m.userId}">השבת</button>` : ""}
    ` : `<button class="chip" type="button" data-action="member-reactivate" data-id="${m.userId}">הפעלה</button>`;
    return `<div class="member-row">
      <div><strong>${esc(m.displayName)}</strong><span class="muted small">${esc(m.email)} · ${roleLabel}${status}</span></div>
      <div class="chip-row">${actions}</div>
      <div id="confirm-${m.userId}"></div>
    </div>`;
  }).join("");

  return `
    <div class="screen">
      ${backBar("ניהול", "manage")}
      <div class="screen-section">
        <h1>חברי ארגון</h1>
        <button class="btn btn--ghost btn--block" type="button" data-action="toggle-invite">${icon("add")} הזמנת חבר</button>
        <div id="inviteForm" hidden>
          <form id="inviteFormEl" class="form-field">
            <label for="inviteEmail">אימייל</label>
            <input class="form-input" id="inviteEmail" type="email" placeholder="name@example.com" required>
            <button class="btn btn--primary btn--block" type="submit">שמירת הזמנה</button>
          </form>
        </div>
      </div>
      <div class="member-list">${rows}</div>
    </div>`;
};
