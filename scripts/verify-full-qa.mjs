/**
 * Full functional QA — UI workflows via debugBackend=local.
 * Run: node scripts/verify-full-qa.mjs
 */
import { chromium } from "playwright";
import { startStaticServer } from "./validate/lib/static-server.mjs";

const bugs = [];
const pass = [];
const skip = [];

function ok(id, detail) {
  pass.push({ id, detail });
  console.log(`[PASS] ${id}${detail ? ` — ${detail}` : ""}`);
}
function reportBug(id, rootCause, detail) {
  bugs.push({ id, rootCause, detail });
  console.error(`[BUG] ${id} — ${detail}`);
}
function sk(id, detail) {
  skip.push({ id, detail });
  console.log(`[SKIP] ${id}${detail ? ` — ${detail}` : ""}`);
}

const PILOT_PEOPLE = ["עדינה", "אבי", "חיה", "צבי"];
const PILOT_TASKS = [
  { id: "p1", title: "ניקוי בית מדרש", owner: "עדינה", category: "maintenance", status: "progress", notes: "", updates: [], due: "today", dueLabel: "היום", priority: "normal", reminder: { enabled: false }, created_at: "2026-06-29" },
  { id: "p2", title: "הזמנת ציוד למטבח", owner: "אבי", category: "kitchen", status: "progress", notes: "", updates: [], due: "tomorrow", dueLabel: "מחר", priority: "normal", reminder: { enabled: false }, created_at: "2026-06-29" },
  { id: "p3", title: "תיקון מזגן", owner: "צבי", category: "maintenance", status: "progress", notes: "", updates: [], due: "none", dueLabel: "ללא יעד", priority: "high", reminder: { enabled: false }, created_at: "2026-06-28" },
  { id: "p4", title: "סידור מחסן", owner: "חיה", category: "office", status: "progress", notes: "", updates: [], due: "none", dueLabel: "ללא יעד", priority: "normal", reminder: { enabled: false }, created_at: "2026-06-28" },
  { id: "p5", title: "רכישת חומרי ניקיון", owner: "עדינה", category: "kitchen", status: "done", notes: "", updates: [], due: "done", dueLabel: "הושלם", priority: "normal", reminder: { enabled: false }, created_at: "2026-06-27", completed_at: "2026-06-28" }
];
const PILOT_SUPPLIERS = [
  { id: "s1", supplier: "אייס", description: "חלב וגבינות", amount: "₪420", due_date: "2026-07-01", notes: "", document_notes: "", links: [], assignees: ["עדינה"], allAssignees: false, steps: { order: true, received: false, payment: false, invoice: false }, step_dates: { order: "2026-06-29", received: "", payment: "", invoice: "" }, created_at: "2026-06-29" },
  { id: "s2", supplier: "הום סנטר", description: "כלים למטבח", amount: "₪890", due_date: "2026-07-05", notes: "", document_notes: "", links: ["https://example.com/order"], assignees: [], allAssignees: true, steps: { order: false, received: false, payment: false, invoice: false }, step_dates: { order: "", received: "", payment: "", invoice: "" }, created_at: "2026-06-29" }
];

async function bootSession(page, baseUrl, role, userOwner) {
  await page.goto(`${baseUrl}/index.html?debug=1&debugBackend=local`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForFunction(() => window.__appReady && window.__validation?.ready, null, { timeout: 30000 });
  await page.evaluate(({ role, userOwner, tasks, suppliers, people }) => {
    localStorage.setItem("beit-people", JSON.stringify(people));
    localStorage.setItem("beit-hidden-people", "[]");
    localStorage.removeItem("beit-categories");
    localStorage.removeItem("beit-hidden-categories");
    localStorage.setItem("beit-tasks", JSON.stringify(tasks));
    localStorage.setItem("beit-suppliers", JSON.stringify(suppliers));
    localStorage.setItem("beit-version", "mockup-v3");
    localStorage.removeItem("beit-pilot-migrated");
    const H = window.__validationHooks;
    H.state.role = role;
    H.state.userOwner = userOwner;
    H.state.authStatus = "ready";
  }, { role, userOwner, tasks: PILOT_TASKS, suppliers: PILOT_SUPPLIERS, people: PILOT_PEOPLE });
  await page.evaluate(async ({ role }) => {
    const H = window.__validationHooks;
    await H.bootstrapTasks();
    await H.bootstrapSuppliers();
    H.state.view = role === "manager" ? "management" : "all";
    location.hash = H.state.view;
  }, { role });
  await page.waitForTimeout(350);
}

async function runManagerQa(page, baseUrl) {
  await bootSession(page, baseUrl, "manager", "צבי");

  const consistency = await page.evaluate(() => {
    const H = window.__validationHooks;
    const A = window.BatAyinAdapters;
    const visible = H.activeTasks();
    const mgrOwnOpen = visible.filter((t) => t.owner === "צבי" && t.status === "progress").length;
    const myOpen = A.filterPersonalTasks(visible, { role: "manager", userOwner: "צבי" }).filter((t) => t.status !== "done").length;
    const progress = visible.filter((t) => t.status === "progress").length;
    const uiProgress = document.querySelector(".mgmt-row .big")?.textContent?.trim();
    return { mgrOwnOpen, myOpen, progress, uiProgress, appText: document.getElementById("app")?.innerText || "" };
  });

  if (consistency.mgrOwnOpen !== consistency.myOpen) {
    reportBug("mgr-my-tasks-count-mismatch", "My Tasks uses personalOwner filter; manager own-task count should match", `mgrOwn=${consistency.mgrOwnOpen} myOpen=${consistency.myOpen}`);
  } else ok("mgr-my-tasks-consistency", `own open=${consistency.myOpen}`);

  await page.click('[data-nav="management"]');
  await page.click('[data-nav="mgmt-tasks"]');
  await page.waitForTimeout(200);
  const progressUi = await page.evaluate(() => document.querySelector(".management-tiles .mgmt-row .big")?.textContent?.trim());
  if (progressUi !== String(consistency.progress)) {
    reportBug("mgmt-counter-mismatch", "management progress tile != computed count", `UI=${progressUi} calc=${consistency.progress}`);
  } else ok("mgmt-progress-counter", progressUi);

  if (/CRUD|validation|DEBUG|משימת בדיקה/i.test(consistency.appText)) {
    reportBug("demo-data-visible", "stale demo/test titles rendered", consistency.appText.slice(0, 80));
  } else ok("no-demo-titles-manager");

  await page.click('[data-nav="all"]');
  await page.waitForTimeout(250);
  const myTasksText = await page.textContent("#app");
  if (myTasksText.includes("תיקון מזגן")) ok("mgr-my-tasks-shows-own");
  else reportBug("mgr-missing-own-task", "manager own task missing from My Tasks tab", "תיקון מזגן not found");
  if (myTasksText.includes("ניקוי בית מדרש")) {
    reportBug("mgr-sees-member-task-in-my-tasks", "My Tasks should only show manager's own tasks", "ניקוי בית מדרש visible");
  } else ok("mgr-my-tasks-isolation");

  await page.click('[data-nav="management"]');
  await page.click('[data-nav="mgmt-tasks"]');
  await page.waitForTimeout(200);
  await page.click('[data-nav="create"]');
  await page.waitForTimeout(200);
  await page.fill("#newTitle", "בדיקת QA — משימה חדשה");
  await page.locator('input[name="owner"][value="חיה"]').check();
  await page.locator("#createForm button.primary[type='submit']").click();
  await page.waitForTimeout(500);

  const created = await page.evaluate(() => {
    const H = window.__validationHooks;
    return H.state.tasks.find((t) => t.title === "בדיקת QA — משימה חדשה");
  });
  if (created?.owner === "חיה") ok("mgr-create-task", `id=${created.id}`);
  else reportBug("mgr-create-failed", "create form did not persist task with correct owner", JSON.stringify(created));

  if (created?.id) {
    await page.click(`[data-status="${created.id}:done"]`);
    await page.waitForTimeout(400);
    const done = await page.evaluate((id) => window.__validationHooks.state.tasks.find((t) => t.id === id)?.status, created.id);
    if (done === "done") ok("mgr-complete-task");
    else reportBug("mgr-complete-failed", "complete from detail screen failed", String(done));
  }

  await page.click('[data-nav="suppliers"]');
  await page.waitForTimeout(250);
  const supText = await page.textContent("#app");
  if (supText.includes("אייס") && supText.includes("הום סנטר")) ok("mgr-suppliers-visible");
  else reportBug("mgr-suppliers-missing", "pilot suppliers not listed", supText.slice(0, 120));

  await page.click('[data-nav="supplier-create"]');
  await page.waitForTimeout(200);
  await page.fill("#supplierName", "שופרסל");
  await page.fill("#supplierDescription", "מוצרי מזון");
  await page.fill("#supplierAmount", "₪250");
  await page.locator('input[name="supplierAll"]').check();
  await page.locator("#supplierForm button.primary[type='submit']").click();
  await page.waitForTimeout(500);
  const hasShufersal = await page.evaluate(() => window.__validationHooks.state.suppliers.some((s) => s.supplier === "שופרסל"));
  if (hasShufersal) ok("mgr-create-supplier");
  else reportBug("mgr-supplier-create-failed", "supplier create form failed", "");
}

async function runMemberQa(page, baseUrl) {
  await bootSession(page, baseUrl, "user", "עדינה");
  const scope = await page.evaluate(() => {
    const H = window.__validationHooks;
    const visible = H.state.tasks.filter((t) => H.canAccessTask(t));
    const denied = H.state.tasks.filter((t) => !H.canAccessTask(t) && !t.deleted_at);
    return { visible: visible.length, denied: denied.length, canDelete: H.canDeleteTask(visible[0]) };
  });
  if (scope.visible === 2 && scope.denied >= 2) ok("member-task-scope", `sees ${scope.visible}`);
  else reportBug("member-scope-wrong", "canAccessTask filter incorrect", JSON.stringify(scope));
  if (!scope.canDelete) ok("member-no-delete");
  else reportBug("member-can-delete", "user must not delete tasks", "");

  await page.click('[data-nav="all"]');
  await page.waitForTimeout(250);
  const myText = await page.textContent("#app");
  if (!myText.includes("תיקון מזגן")) ok("member-isolation");
  else reportBug("member-sees-other-task", "member sees task owned by צבי", "");
  if (myText.includes("ניקוי בית מדרש")) ok("member-sees-own-open");
  else reportBug("member-missing-own-open", "open own task missing", "");

  await page.click('[data-nav="done"]');
  await page.waitForTimeout(250);
  const doneText = await page.textContent("#app");
  if (doneText.includes("רכישת חומרי ניקיון")) ok("member-completed-visible");
  else reportBug("member-completed-missing", "completed own task not in done view", "");
}

async function runNavigationQa(page, baseUrl) {
  await bootSession(page, baseUrl, "manager", "צבי");
  for (const nav of ["management", "all", "suppliers", "done", "prefs"]) {
    await page.click(`[data-nav="${nav}"]`);
    await page.waitForTimeout(150);
    const view = await page.evaluate(() => window.__validationHooks.state.view);
    if (view === nav) ok(`nav-${nav}`);
    else reportBug(`nav-${nav}-broken`, "nav click did not update view", `expected ${nav} got ${view}`);
  }
}

async function runMgmtCategoryQa(page, baseUrl) {
  await bootSession(page, baseUrl, "manager", "צבי");
  await page.click('[data-nav="management"]');
  await page.click('[data-nav="mgmt-tasks"]');
  await page.waitForTimeout(200);

  const summary = await page.evaluate(() => {
    const H = window.__validationHooks;
    const rows = H.buildMgmtCategoryRows();
    const ui = {};
    for (const row of rows) ui[row.category.label] = row.count;
    const kitchenExpected = H.mgmtVisibleCategoryTasks("kitchen").length;
    const officeExpected = H.mgmtVisibleCategoryTasks("office").length;
    return { rows, ui, kitchenExpected, officeExpected };
  });

  const kitchenUi = summary.ui["מטבח"];
  const kitchenExpected = summary.kitchenExpected;
  if (kitchenUi === kitchenExpected) ok("mgmt-kitchen-count", `${kitchenUi}`);
  else reportBug("mgmt-kitchen-count-wrong", "category summary counted done tasks or duplicates", `UI=${kitchenUi} expected=${kitchenExpected}`);

  const officeUi = summary.ui["משרד"];
  const officeExpected = summary.officeExpected;
  if (officeExpected > 0 && officeUi === officeExpected) ok("mgmt-office-visible", `${officeUi}`);
  else if (officeExpected > 0) reportBug("mgmt-office-missing", "office category hidden by slice(0,5) cap", `UI=${officeUi} expected=${officeExpected}`);
  else ok("mgmt-office-absent-ok");

  const zeroRows = Object.entries(summary.ui).filter(([, count]) => count === 0);
  if (zeroRows.length) reportBug("mgmt-empty-category-shown", "zero-task categories should be hidden", zeroRows.map(([n]) => n).join(", "));
  else ok("mgmt-no-empty-categories");

  await page.click('[data-nav="category:kitchen"]');
  await page.waitForTimeout(200);
  const listCount = await page.locator(".list-row").count();
  if (listCount === kitchenExpected) ok("mgmt-kitchen-list-match", `${listCount}`);
  else reportBug("mgmt-kitchen-list-mismatch", "summary count != rendered category tasks", `list=${listCount} summary=${kitchenExpected}`);

  const backFromCategory = await page.evaluate(() => window.__validationHooks.parentRoute("category:kitchen"));
  if (backFromCategory === "mgmt-tasks") ok("back-category-parent");
  else reportBug("back-category-parent-wrong", "category back should go to mgmt-tasks", backFromCategory);

  await page.click(".back");
  await page.waitForTimeout(150);
  const afterCategoryBack = await page.evaluate(() => window.__validationHooks.state.view);
  if (afterCategoryBack === "mgmt-tasks") ok("back-category-to-tasks");
  else reportBug("back-category-skipped-tasks", "back from category skipped mgmt-tasks", afterCategoryBack);

  await page.click('[data-nav="category:kitchen"]');
  await page.waitForTimeout(150);
  await page.locator(".list-row").first().click();
  await page.waitForTimeout(200);
  const taskReturn = await page.evaluate(() => window.__validationHooks.state.taskReturnRoute);
  if (taskReturn === "category:kitchen") ok("task-return-route-set");
  else reportBug("task-return-route-wrong", "task detail should remember category list", taskReturn);

  await page.click(".back");
  await page.waitForTimeout(150);
  const afterTaskBack = await page.evaluate(() => window.__validationHooks.state.view);
  if (afterTaskBack === "category:kitchen") ok("back-task-to-category");
  else reportBug("back-task-skipped-list", "back from task skipped intermediate list", afterTaskBack);

  await page.click(".back");
  await page.waitForTimeout(150);
  const afterTaskListBack = await page.evaluate(() => window.__validationHooks.state.view);
  if (afterTaskListBack === "mgmt-tasks") ok("back-task-list-to-mgmt-tasks");
  else reportBug("back-task-list-to-management", "back from category skipped mgmt-tasks", afterTaskListBack);
}

async function main() {
  console.log("=== Full Functional QA (local debug harness) ===\n");
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await runManagerQa(page, server.baseUrl);
    console.log("");
    await runMemberQa(page, server.baseUrl);
    console.log("");
    await runNavigationQa(page, server.baseUrl);
    console.log("");
    await runMgmtCategoryQa(page, server.baseUrl);
  } finally {
    await browser.close();
    await server.close();
  }

  sk("login-oauth-live", "requires Google OAuth on production");
  sk("second-device-live", "manual multi-device test");
  sk("pwa-install-mobile", "manual Add to Home Screen");

  console.log("\n=== QA Summary ===");
  console.log(`PASS: ${pass.length}  BUGS: ${bugs.length}  SKIP: ${skip.length}`);
  if (bugs.length) {
    console.log("\n--- Bugs ---");
    for (const b of bugs) console.log(`• ${b.id}: ${b.detail}\n  Root: ${b.rootCause}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
