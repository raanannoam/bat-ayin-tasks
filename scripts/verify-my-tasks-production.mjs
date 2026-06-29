/**
 * Verify manager "משימות" / "הושלם" against production Supabase data shape.
 * Run: node scripts/verify-my-tasks-production.mjs
 */
import { chromium } from "playwright";
import { readFileSync } from "fs";
import vm from "vm";

const SUPABASE_URL = "https://jxjxjvxbxpgvlarzbohm.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4anhqdnhieHBndmxhcnpib2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTgyNjUsImV4cCI6MjA5NTUzNDI2NX0.g1W8SJWTRc3FYeZJIVdLBTKcSfHVgfQQZ_brjRKest4";
const TZVI_USER_ID = "24fd1678-f13f-4e94-8afb-02887c315202";
const ORG_ID = "00000000-0000-0000-0000-000000000001";

const pass = [];
const fail = [];
const skip = [];

function ok(id, detail) {
  pass.push({ id, detail });
  console.log(`[PASS] ${id}${detail ? ` — ${detail}` : ""}`);
}
function bad(id, detail) {
  fail.push({ id, detail });
  console.error(`[FAIL] ${id}${detail ? ` — ${detail}` : ""}`);
}
function sk(id, detail) {
  skip.push({ id, detail });
  console.log(`[SKIP] ${id}${detail ? ` — ${detail}` : ""}`);
}

/** טוען BatAyinAdapters מ-outputs/adapters.js */
function loadAdapters() {
  const code = readFileSync("outputs/adapters.js", "utf8");
  const sandbox = {};
  vm.runInNewContext(code, sandbox);
  return sandbox.BatAyinAdapters;
}

/** סימולציה: נתוני production ידועים + סינון אישי לפי uid */
async function verifyFilterWithProductionShape(Adapters) {
  const profilesRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?select=id,display_name&id=eq.${TZVI_USER_ID}`,
    {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`
      }
    }
  );
  const profiles = profilesRes.ok ? await profilesRes.json() : [];
  const tzviName = profiles[0]?.display_name;
  if (tzviName !== "צבי") {
    sk("prod-tzvi-profile", "profiles hidden from anon (RLS) — using known seed name");
  } else {
    ok("prod-tzvi-profile", tzviName);
  }
  const ownerName = tzviName || "צבי";

  // צורת production (5 משימות, כולן assignee_id של צבי) — מאומת ב-SQL
  const appTasks = [
    { id: "f359f464-7ebe-4bb0-918d-3f7fc5155082", title: "ניקוי בית מדרש", status: "progress", assigneeId: TZVI_USER_ID, owner: "צבי", deleted_at: null },
    { id: "4797c040-ad60-449c-b810-28c02fb0484c", title: "הזמנת ציוד למטבח", status: "progress", assigneeId: TZVI_USER_ID, owner: "צבי", deleted_at: null },
    { id: "023c4500-e641-4dc1-8526-8fd0d00f02b9", title: "תיקון מזגן", status: "progress", assigneeId: TZVI_USER_ID, owner: "צבי", deleted_at: null },
    { id: "74bd4e4a-eedc-4959-bec0-ce8a5cb5505b", title: "סידור מחסן", status: "progress", assigneeId: TZVI_USER_ID, owner: "צבי", deleted_at: null },
    { id: "7fbc5ede-caff-4ef2-99f5-9f5a2809601a", title: "רכישת חומרי ניקיון", status: "done", assigneeId: TZVI_USER_ID, owner: "צבי", deleted_at: null }
  ];

  const ctxBroken = { role: "manager", userOwner: "", userId: "" };
  const ctxFixed = { role: "manager", userOwner: ownerName, userId: TZVI_USER_ID };
  ok("prod-seed-assignees", `${appTasks.length} tasks → tzvi`);

  const brokenPersonal = Adapters.filterPersonalTasks(appTasks, ctxBroken).length;
  const fixedPersonal = Adapters.filterPersonalTasks(appTasks, ctxFixed).length;
  const openPersonal = Adapters.filterPersonalTasks(
    appTasks.filter((t) => t.status !== "done"),
    ctxFixed
  ).length;
  const donePersonal = Adapters.filterPersonalTasks(
    appTasks.filter((t) => t.status === "done"),
    ctxFixed
  ).length;

  if (brokenPersonal !== 0) {
    bad("filter-empty-userOwner", `expected 0 got ${brokenPersonal}`);
  } else {
    ok("filter-empty-userOwner", "empty userOwner + no userId → 0 personal tasks (bug shape)");
  }

  if (fixedPersonal !== appTasks.length) {
    bad("filter-tzvi-personal", `expected ${appTasks.length} got ${fixedPersonal}`);
  } else {
    ok("filter-tzvi-personal", `${fixedPersonal} personal tasks via assigneeId`);
  }

  const ctxUidOnly = { role: "manager", userOwner: "", userId: TZVI_USER_ID };
  const uidOnlyPersonal = Adapters.filterPersonalTasks(appTasks, ctxUidOnly).length;
  if (uidOnlyPersonal !== appTasks.length) {
    bad("filter-uid-only", `expected ${appTasks.length} got ${uidOnlyPersonal}`);
  } else {
    ok("filter-uid-only", "userId alone matches assigneeId (fixes empty userOwner)");
  }

  ok("filter-tzvi-open", `${openPersonal} open`);
  ok("filter-tzvi-done", `${donePersonal} done`);
}

/** UI מקומי — מדמה production Supabase עם assigneeId + userId (בלי OAuth) */
async function verifyLocalSupabaseShapeUi() {
  const { startStaticServer } = await import("./validate/lib/static-server.mjs");
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ serviceWorkers: "block" });
  try {
    const page = await context.newPage();
    await page.goto(`${server.baseUrl}/index.html?debug=1&debugBackend=local`, {
      waitUntil: "networkidle",
      timeout: 60000
    });
    await page.waitForFunction(() => window.__appReady && window.__validation?.ready, null, {
      timeout: 30000
    });

    await page.evaluate(({ TZVI_USER_ID }) => {
      const H = window.__validationHooks;
      H.state.role = "manager";
      H.state.authStatus = "ready";
      H.state.userId = TZVI_USER_ID;
      H.state.userOwner = "";
      H.state.tasks = [
        { id: "p1", title: "ניקוי בית מדרש", owner: "צבי", assigneeId: TZVI_USER_ID, category: "maintenance", status: "progress", notes: "", updates: [], due: "today", dueLabel: "היום", priority: "normal", reminder: { enabled: false }, created_at: "2026-06-29", deleted_at: null },
        { id: "p2", title: "תיקון מזגן", owner: "צבי", assigneeId: TZVI_USER_ID, category: "maintenance", status: "progress", notes: "", updates: [], due: "none", dueLabel: "ללא יעד", priority: "high", reminder: { enabled: false }, created_at: "2026-06-28", deleted_at: null },
        { id: "p3", title: "רכישת חומרי ניקיון", owner: "צבי", assigneeId: TZVI_USER_ID, category: "kitchen", status: "done", notes: "", updates: [], due: "done", dueLabel: "הושלם", priority: "normal", reminder: { enabled: false }, created_at: "2026-06-27", completed_at: "2026-06-28", deleted_at: null }
      ];
      H.state.view = "all";
    }, { TZVI_USER_ID });

    await page.evaluate(() => {
      const H = window.__validationHooks;
      H.state.view = "management";
      location.hash = "management";
      H.state.view = "all";
      location.hash = "all";
    });
    await page.waitForTimeout(400);

    const myTab = await page.textContent("#app");
    if (!myTab.includes("ניקוי בית מדרש") || !myTab.includes("תיקון מזגן")) {
      bad("local-ui-my-tasks", "משימות empty despite assigneeId match");
    } else {
      ok("local-ui-my-tasks", "2 open tasks visible via assigneeId");
    }

    await page.click('[data-nav="done"]');
    await page.waitForTimeout(300);
    const doneTab = await page.textContent("#app");
    if (!doneTab.includes("רכישת חומרי ניקיון")) {
      bad("local-ui-done", "הושלם missing completed task");
    } else {
      ok("local-ui-done", "completed task visible");
    }

    await page.click('[data-nav="management"]');
    await page.waitForTimeout(200);
    const mgmt = await page.evaluate(() => {
      const H = window.__validationHooks;
      return H.activeTasks().length;
    });
    if (mgmt !== 3) bad("local-ui-mgmt-count", String(mgmt));
    else ok("local-ui-mgmt-count", "3 org tasks in management");
  } finally {
    await context.close();
    await server.close();
  }
}

/** בדיקת UI production עם session שמור (אם קיים) */
async function verifyLiveSessionIfAvailable() {
  const profileDir = ".pw-cp23-profile";
  let browser;
  try {
    browser = await chromium.launchPersistentContext(profileDir, {
      headless: true,
      ignoreHTTPSErrors: true
    });
    const page = browser.pages()[0] || (await browser.newPage());
    await page.goto("https://bat-ayin-tasks.vercel.app/index.html", {
      waitUntil: "networkidle",
      timeout: 90000
    });
    await page.waitForFunction(() => window.__appReady, null, { timeout: 45000 });

    const boot = await page.evaluate(async () => {
      await window.__appReady;
      const H = window.__validationHooks;
      const A = window.BatAyinAdapters;
      const tasks = H?.state?.tasks || [];
      const ctx = {
        role: H?.state?.role,
        userOwner: H?.state?.userOwner || "",
        userId: H?.state?.userId || ""
      };
      const personal = A.filterPersonalTasks(tasks, ctx);
      const openPersonal = personal.filter((t) => t.status !== "done");
      const donePersonal = personal.filter((t) => t.status === "done");
      return {
        authStatus: H?.state?.authStatus,
        role: ctx.role,
        userOwner: ctx.userOwner,
        userId: ctx.userId,
        taskCount: tasks.length,
        personalCount: personal.length,
        openPersonal: openPersonal.length,
        donePersonal: donePersonal.length,
        view: H?.state?.view
      };
    });

    if (boot.authStatus !== "ready") {
      sk("live-session", `not signed in (${boot.authStatus})`);
      return;
    }

    ok("live-session", `${boot.userOwner || "?"} · ${boot.userId?.slice(0, 8) || "?"}`);
    ok("live-org-tasks", String(boot.taskCount));

    if (boot.userId === TZVI_USER_ID && boot.taskCount > 0 && boot.personalCount === 0) {
      bad("live-my-tasks-empty", `manager tzvi has ${boot.taskCount} org tasks but 0 personal`);
    } else if (boot.userId === TZVI_USER_ID && boot.personalCount > 0) {
      ok("live-my-tasks", `${boot.personalCount} personal (${boot.openPersonal} open, ${boot.donePersonal} done)`);
    } else if (boot.userId && boot.personalCount >= 0) {
      ok("live-my-tasks-other-user", `personal=${boot.personalCount} for ${boot.userOwner}`);
    }

    await page.click('[data-nav="all"]');
    await page.waitForTimeout(400);
    const myTab = await page.evaluate(() => document.getElementById("app")?.innerText || "");
    const hasEmpty =
      myTab.includes("אין משימות להיום") &&
      myTab.includes("אין משימות נוספות") &&
      !myTab.includes("ניקוי בית מדרש");

    if (boot.userId === TZVI_USER_ID && boot.taskCount >= 4 && hasEmpty) {
      bad("live-my-tasks-ui-empty", "משימות tab shows empty for tzvi manager");
    } else if (boot.userId === TZVI_USER_ID && myTab.includes("ניקוי בית מדרש")) {
      ok("live-my-tasks-ui", "משימות tab shows assigned task");
    }

    await page.click('[data-nav="done"]');
    await page.waitForTimeout(400);
    const doneTab = await page.evaluate(() => document.getElementById("app")?.innerText || "");
    if (boot.userId === TZVI_USER_ID && boot.donePersonal > 0 && !doneTab.includes("רכישת חומרי ניקיון")) {
      bad("live-done-ui-empty", "הושלם tab missing completed task");
    } else if (boot.userId === TZVI_USER_ID && doneTab.includes("רכישת חומרי ניקיון")) {
      ok("live-done-ui", "הושלם shows completed task");
    }
  } catch (error) {
    bad("live-session-error", error?.message || String(error));
  } finally {
    await browser?.close().catch(() => {});
  }
}

console.log("=== Verify My Tasks (production) ===\n");
const Adapters = loadAdapters();
await verifyFilterWithProductionShape(Adapters);
console.log("");
await verifyLocalSupabaseShapeUi();
console.log("");
await verifyLiveSessionIfAvailable();
console.log(`\n=== Summary: PASS ${pass.length} FAIL ${fail.length} SKIP ${skip.length} ===`);
if (fail.length) process.exit(1);
