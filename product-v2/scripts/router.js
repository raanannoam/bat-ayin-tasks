/** ניתוב — hash-based עם כל מסכי ייצור */
var Screens = {};

const USER_NAV = [
  { route: "today", label: "היום", icon: "today" },
  { route: "tasks", label: "משימות", icon: "tasks" },
  { route: "suppliers", label: "ספקים", icon: "suppliers" }
];

const MANAGER_NAV = [
  ...USER_NAV,
  { route: "manage", label: "ניהול", icon: "manager" }
];

function navItems() {
  return Store.isManager() ? MANAGER_NAV : USER_NAV;
}

function parseRoute(hash) {
  const raw = (hash || "#today").replace(/^#/, "");
  const parts = raw.split("/");
  const base = parts[0] || "today";

  if (base === "login") return { name: "login", params: {} };
  if (base === "gate") return { name: "gate", params: { type: parts[1] || "no-access" } };
  if (base === "loading") return { name: "loading", params: {} };
  if (base === "settings") return { name: "settings", params: {} };
  if (base === "demo") return { name: parts[1] || "empty", params: {} };

  if (base === "task" && parts[1] === "create") return { name: "taskCreate", params: {} };
  if (base === "task" && parts[2] === "edit") return { name: "taskEdit", params: { id: parts[1] } };
  if (base === "task") return { name: "taskDetail", params: { id: parts[1] } };

  if (base === "supplier" && parts[1] === "create") return { name: "supplierCreate", params: {} };
  if (base === "supplier" && parts[2] === "edit") return { name: "supplierEdit", params: { id: parts[1] } };
  if (base === "supplier") return { name: "supplierDetail", params: { id: parts[1] } };

  if (base === "manage") {
    if (parts[1] === "tasks") return { name: "manageTasks", params: {} };
    if (parts[1] === "members") return { name: "manageMembers", params: {} };
    if (parts[1] === "filter") return { name: "manageFilter", params: { filter: parts[2] } };
    if (parts[1] === "person") return { name: "managePerson", params: { name: decodeURIComponent(parts[2] || "") } };
    if (parts[1] === "category") return { name: "manageCategory", params: { id: parts[2] } };
    return { name: "manage", params: {} };
  }

  if (base === "tasks") return { name: "tasks", params: { sort: parts[1] || "date" } };
  if (base === "today") return { name: "today", params: {} };
  if (base === "done") {
    Store.showCompletedTasks = true;
    return { name: "tasks", params: { sort: "date" } };
  }
  if (base === "suppliers") return { name: "suppliers", params: {} };

  return { name: "today", params: {} };
}

function renderRoute(hash) {
  const { name, params } = parseRoute(hash);
  const map = {
    login: () => AuthScreens.login(),
    gate: () => AuthScreens.gate(params.type),
    loading: () => loadingState("טוען נתונים..."),
    settings: () => SettingsScreens.main(),
    today: () => TodayScreens.main(),
    tasks: () => TaskScreens.list(params.sort),
    taskDetail: () => TaskScreens.detail(params.id),
    taskCreate: () => TaskScreens.form(null),
    taskEdit: () => TaskScreens.form(params.id),
    suppliers: () => SupplierScreens.list(),
    supplierDetail: () => SupplierScreens.detail(params.id),
    supplierCreate: () => SupplierScreens.form(null, sessionStorage.getItem("pv2_prefill") || ""),
    supplierEdit: () => SupplierScreens.form(params.id),
    manage: () => ManageScreens.hub(),
    manageTasks: () => ManageScreens.tasksDashboard(),
    manageMembers: () => ManageScreens.members(),
    manageFilter: () => ManageScreens.filterList(params.filter),
    managePerson: () => ManageScreens.personList(params.name),
    manageCategory: () => ManageScreens.categoryList(params.id),
    empty: () => emptyState("inbox", "אין משימות להצגה", "task/create")
  };
  const fn = map[name];
  return fn ? fn() : TodayScreens.main();
}

function activeNavRoute(name) {
  if (["taskDetail", "taskEdit", "taskCreate"].includes(name)) return "tasks";
  if (["supplierDetail", "supplierCreate"].includes(name)) return "suppliers";
  if (name.startsWith("manage")) return Store.isManager() ? "manage" : "today";
  if (["login", "gate", "loading", "settings", "empty"].includes(name)) return "today";
  return name === "tasks" ? "tasks" : name;
}

function showFab(name) {
  return ["today", "tasks", "suppliers", "manage", "manageTasks"].includes(name);
}

function fabRoute(name) {
  if (name.startsWith("supplier") || name === "suppliers") return "supplier/create";
  return "task/create";
}

function isDetailScreen(name) {
  return ["taskDetail", "taskEdit", "taskCreate", "supplierDetail", "supplierCreate", "supplierEdit", "settings", "login", "gate", "loading"].includes(name)
    || name.startsWith("manage");
}

function isAuthScreen(name) {
  return ["login", "gate", "loading"].includes(name);
}

function parentRoute(name, params) {
  const parents = {
    manageTasks: "manage", manageMembers: "manage",
    manageFilter: "manage/tasks", managePerson: "manage/tasks", manageCategory: "manage/tasks",
    taskCreate: Store.lastList || "tasks", taskEdit: `task/${params?.id}`,
    supplierCreate: "suppliers", supplierDetail: "suppliers"
  };
  return parents[name] || null;
}

function sortTasks(tasks, mode) {
  const copy = [...tasks];
  if (mode === "category") return copy.sort((a, b) => Store.catLabel(a.category).localeCompare(Store.catLabel(b.category), "he"));
  if (mode === "priority") return copy.sort((a, b) => (b.priority === "high") - (a.priority === "high"));
  return copy.sort((a, b) => (a.due === "today" ? 0 : 1) - (b.due === "today" ? 0 : 1));
}
