/** מצב האפליקציה — CRUD בזיכרון (ללא שמירה) */
const Store = {
  auth: "signed_in",
  role: "manager",
  userId: "u1",
  displayName: "עדינה",
  prefs: { dark: false, text: "רגיל" },
  showCompletedTasks: false,
  showTaskDoneArchive: false,
  showCompletedSuppliers: false,
  showSupplierDoneArchive: false,
  lastList: "tasks",
  DONE_RECENT_DAYS: 30,
  tasks: [],
  suppliers: [],
  members: [],
  categories: [],
  people: [],
  stepLabels: [],
  pendingConfirm: null,

  init() {
    const c = JSON.parse(JSON.stringify(SEED));
    this.tasks = c.tasks;
    this.suppliers = c.suppliers;
    this.members = c.members;
    this.categories = c.categories;
    this.people = c.people;
    this.stepLabels = c.stepLabels;
  },

  isManager() { return this.role === "manager"; },

  currentUser() {
    return { name: this.displayName, role: this.role, userId: this.userId };
  },

  catLabel(id) {
    return this.categories.find((c) => c.id === id)?.label || id;
  },

  getTask(id) { return this.tasks.find((t) => t.id === id && !t.deleted_at); },

  getSupplier(id) { return this.suppliers.find((s) => s.id === id && !s.deleted_at); },

  visibleTasks(allOrg = false) {
    const list = this.tasks.filter((t) => !t.deleted_at);
    if (allOrg && this.isManager()) return list;
    return list.filter((t) => t.owner === this.displayName || t.assigneeId === this.userId);
  },

  openTasks(allOrg) { return this.visibleTasks(allOrg).filter((t) => t.status !== "done"); },

  todayTasks(allOrg) { return this.openTasks(allOrg).filter((t) => t.due === "today" || t.dueLabel === "היום"); },

  doneTasks(allOrg) {
    return this.visibleTasks(allOrg).filter((t) => t.status === "done");
  },

  daysBetween(isoDate) {
    if (!isoDate) return Infinity;
    try {
      return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86400000);
    } catch { return Infinity; }
  },

  isArchivedTask(task) {
    return this.daysBetween(task?.completed_at) >= this.DONE_RECENT_DAYS;
  },

  supplierCompletedAt(item) {
    const dates = this.stepLabels.map((st) => item.step_dates?.[st.key]).filter(Boolean);
    if (dates.length) return dates.sort().at(-1) || "";
    return item.due_date || "";
  },

  isArchivedSupplier(item) {
    if (this.supplierProgress(item.steps) < 100) return false;
    return this.daysBetween(this.supplierCompletedAt(item)) >= this.DONE_RECENT_DAYS;
  },

  splitDoneItems(items, isArchivedFn) {
    const archived = items.filter((item) => isArchivedFn(item));
    const recent = items.filter((item) => !isArchivedFn(item));
    return { recent, archived };
  },

  visibleSuppliers() {
    return this.suppliers.filter((s) => {
      if (s.deleted_at) return false;
      if (this.isManager()) return true;
      if (s.allAssignees) return true;
      return s.assignees.includes(this.displayName);
    });
  },

  canAccessTask(task) {
    if (!task) return false;
    if (this.isManager()) return true;
    return task.owner === this.displayName || task.assigneeId === this.userId;
  },

  canAccessSupplier(s) {
    if (!s) return false;
    if (this.isManager()) return true;
    if (s.allAssignees) return true;
    return s.assignees.includes(this.displayName);
  },

  supplierProgress(steps) {
    const keys = ["order", "received", "payment", "invoice"];
    return Math.round((keys.filter((k) => steps[k]).length / keys.length) * 100);
  },

  nextId(prefix) {
    return `${prefix}${Date.now().toString(36)}`;
  },

  completeTask(id) {
    const t = this.getTask(id);
    if (!t || t.status === "done") return;
    t.status = "done";
    t.completed_at = new Date().toISOString().slice(0, 10);
    t.dueLabel = "הושלם";
  },

  reopenTask(id) {
    const t = this.getTask(id);
    if (!t || !this.isManager()) return;
    t.status = "progress";
    t.completed_at = null;
    t.dueLabel = t.due === "today" ? "היום" : t.due === "tomorrow" ? "מחר" : "ללא תאריך";
  },

  deleteTaskSoft(id) {
    const t = this.getTask(id);
    if (!t || !this.isManager()) return;
    t.deleted_at = new Date().toISOString();
    t.deleted_by = this.displayName;
  },

  deleteSupplierSoft(id) {
    const s = this.getSupplier(id);
    if (!s) return;
    s.deleted_at = new Date().toISOString();
    s.deleted_by = this.displayName;
  },

  toggleSupplierStep(id, stepKey) {
    const s = this.getSupplier(id);
    if (!s) return false;
    s.steps[stepKey] = !s.steps[stepKey];
    if (s.steps[stepKey]) s.step_dates[stepKey] = new Date().toISOString().slice(0, 10);
    else s.step_dates[stepKey] = "";
    return this.supplierProgress(s.steps) === 100;
  },

  markAllSupplierStages(id) {
    const s = this.getSupplier(id);
    if (!s) return;
    const today = new Date().toISOString().slice(0, 10);
    ["order", "received", "payment", "invoice"].forEach((k) => {
      s.steps[k] = true;
      if (!s.step_dates[k]) s.step_dates[k] = today;
    });
  }
};

Store.init();
