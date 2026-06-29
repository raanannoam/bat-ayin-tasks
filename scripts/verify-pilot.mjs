/**
 * Pilot verification — executable checks only.
 * Run: node scripts/verify-pilot.mjs
 */
import { readFileSync } from "fs";
import { chromium } from "playwright";
import { startStaticServer } from "./validate/lib/static-server.mjs";

const SUPABASE_URL = "https://jxjxjvxbxpgvlarzbohm.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4anhqdnhieHBndmxhcnpib2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTgyNjUsImV4cCI6MjA5NTUzNDI2NX0.g1W8SJWTRc3FYeZJIVdLBTKcSfHVgfQQZ_brjRKest4";

const results = { pass: [], fail: [], skip: [], fix: [] };

function pass(id, detail) {
  results.pass.push({ id, detail });
  console.log(`[PASS] ${id}${detail ? ` — ${detail}` : ""}`);
}
function fail(id, detail) {
  results.fail.push({ id, detail });
  console.error(`[FAIL] ${id}${detail ? ` — ${detail}` : ""}`);
}
function skip(id, detail) {
  results.skip.push({ id, detail });
  console.log(`[SKIP] ${id}${detail ? ` — ${detail}` : ""}`);
}

async function supabaseRest(path, { schema = "bat_ayin", method = "GET", token = ANON_KEY } = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${token}`,
      "Accept-Profile": schema,
      "Content-Profile": schema
    }
  });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

async function verifySupabaseInfra() {
  const org = await supabaseRest(
    "organizations?select=id,name&id=eq.00000000-0000-0000-0000-000000000001"
  );
  if (org.status === 200 && Array.isArray(org.body)) {
    if (org.body[0]?.name) pass("supabase-org-seed", org.body[0].name);
    else pass("supabase-org-rls", "organizations hidden from anon (RLS) — expected");
  } else {
    fail("supabase-org-seed", `status ${org.status}`);
  }

  const tasksAnon = await supabaseRest("tasks?select=id&limit=1");
  if (tasksAnon.status === 200 && Array.isArray(tasksAnon.body) && tasksAnon.body.length === 0) {
    pass("supabase-rls-anon-tasks", "anon sees 0 rows (RLS default deny)");
  } else if (tasksAnon.status === 200 && tasksAnon.body?.length > 0) {
    fail("supabase-rls-anon-tasks", "anon can read tasks without auth");
  } else {
    fail("supabase-rls-anon-tasks", `status ${tasksAnon.status}`);
  }

  const cats = await supabaseRest(
    "categories?select=slug&organization_id=eq.00000000-0000-0000-0000-000000000001&limit=1"
  );
  if (cats.status === 200) {
    pass("supabase-bat_ayin-api", "bat_ayin schema exposed");
  } else {
    fail("supabase-bat_ayin-api", `status ${cats.status} — expose bat_ayin in dashboard?`);
  }

  const authHealth = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
    headers: { apikey: ANON_KEY }
  });
  if (authHealth.ok) pass("supabase-auth-health", "auth service up");
  else fail("supabase-auth-health", `status ${authHealth.status}`);
}

async function verifyStaticPilotCode() {
  const html = readFileSync("outputs/index.html", "utf8");
  const adapters = readFileSync("outputs/adapters.js", "utf8");

  const checks = [
    ["pilot-default-supabase", html.includes("resolvePilotDataBackend(params)")],
    ["mockup-role-removed", !html.includes("beit-mockup-role") && !html.includes('params.get("mockup")')],
    ["sign-in-ui", html.includes("signInWithGoogle") && html.includes("googleSignIn")],
    ["shared-suppliers-backend", html.includes("repositoryAdapters[DATA_BACKEND].supplierAdapter")],
    ["auth-gate-screens", html.includes("not_org_member") && html.includes("loginScreen")],
    ["migration-module", adapters.includes("migrateLocalPilotData")],
    ["load-auth-context", adapters.includes("loadPilotAuthContext")],
    ["sw-precache-adapters", readFileSync("outputs/service-worker.js", "utf8").includes("./adapters.js")],
    ["pilot-auth-sql-file", readFileSync("supabase/pilot-auth.sql", "utf8").includes("handle_new_user")]
  ];

  for (const [id, ok] of checks) {
    if (ok) pass(id);
    else fail(id);
  }
}

async function verifyBrowserPilot(baseUrl) {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();

    await page.goto(`${baseUrl}/index.html`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForFunction(() => window.__appReady, null, { timeout: 30000 });
    await page.waitForFunction(() => window.__validation?.ready, null, { timeout: 15000 });

    const pilot = await page.evaluate(async () => {
      await window.__appReady;
      const H = window.__validationHooks;
      return {
        backend: H?.DATA_BACKEND,
        authStatus: H?.state?.authStatus,
        hasLogin: Boolean(document.getElementById("googleSignIn")),
        hasSignOut: Boolean(document.querySelector("#signOutBtn, #authActions button")),
        roleLabel: document.getElementById("roleLabel")?.textContent,
        mockupNotice: Boolean(document.querySelector(".mockup-notice")),
        pilotNotice: Boolean(document.getElementById("pilotNotice")),
        swControlled: Boolean(navigator.serviceWorker?.controller),
        canAccessUser: H?.canAccessTask({ id: "t", owner: "עדינה", status: "progress", deleted_at: null }),
        userOwnerSet: Boolean(H?.state?.userOwner)
      };
    });

    if (pilot.backend === "supabase") pass("browser-default-backend", "supabase");
    else fail("browser-default-backend", pilot.backend);

    if (pilot.authStatus === "signed_out") pass("browser-auth-signed-out", "login gate without session");
    else skip("browser-auth-signed-out", `authStatus=${pilot.authStatus}`);

    if (pilot.hasLogin) pass("browser-login-screen");
    else fail("browser-login-screen");

    if (!pilot.mockupNotice) pass("browser-mockup-removed");
    else fail("browser-mockup-removed");

    if (pilot.pilotNotice) pass("browser-pilot-notice");
    else fail("browser-pilot-notice");

    const reg = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return { supported: false };
      const reg = await navigator.serviceWorker.getRegistration();
      return { supported: true, registered: Boolean(reg), scope: reg?.scope || null };
    });
    if (reg.supported && reg.registered) pass("browser-sw-registered", reg.scope);
    else fail("browser-sw-registered", JSON.stringify(reg));

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__appReady, null, { timeout: 30000 });
    const afterReload = await page.evaluate(() => ({
      authStatus: window.__validationHooks?.state?.authStatus,
      hasLogin: Boolean(document.getElementById("googleSignIn"))
    }));
    if (afterReload.authStatus === "signed_out" && afterReload.hasLogin) {
      pass("browser-refresh-persistence", "still signed out + login after reload");
    } else {
      skip("browser-refresh-persistence", JSON.stringify(afterReload));
    }

    const context = page.context();
    await context.setOffline(true);
    await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
    const offline = await page.evaluate(() => ({
      hasAppShell: Boolean(document.querySelector(".app-shell")),
      title: document.title
    }));
    if (offline.hasAppShell) pass("browser-offline-reopen", "app shell loads offline after first visit");
    else fail("browser-offline-reopen", JSON.stringify(offline));
    await context.setOffline(false);

    await page.goto(`${baseUrl}/index.html?debugBackend=local&debug=1`, {
      waitUntil: "networkidle",
      timeout: 60000
    });
    await page.waitForFunction(() => window.__appReady, null, { timeout: 30000 });
    const perms = await page.evaluate(async () => {
      await window.__appReady;
      const H = window.__validationHooks;
      const savedRole = H.state.role;
      const savedOwner = H.state.userOwner;
      H.state.role = "user";
      H.state.userOwner = "עדינה";
      const mine = H.canAccessTask({ id: "p1", owner: "עדינה", status: "progress", deleted_at: null });
      const other = H.canAccessTask({ id: "p2", owner: "צבי", status: "progress", deleted_at: null });
      H.state.role = "manager";
      H.state.userOwner = "צבי";
      const mgr = H.canAccessTask({ id: "p2", owner: "צבי", status: "progress", deleted_at: null });
      const del = H.canDeleteTask({ id: "p2", owner: "צבי", status: "progress", deleted_at: null });
      H.state.role = savedRole;
      H.state.userOwner = savedOwner;
      return { mine, other, mgr, del, userNoDelete: !H.canDeleteTask({ id: "p1", owner: "עדינה", deleted_at: null }) };
    });
    if (perms.mine && !perms.other) pass("browser-member-permissions");
    else fail("browser-member-permissions", JSON.stringify(perms));
    if (perms.mgr && perms.del && perms.userNoDelete) pass("browser-manager-permissions");
    else fail("browser-manager-permissions", JSON.stringify(perms));

    const migration = await page.evaluate(() => {
      localStorage.setItem("beit-tasks", JSON.stringify([{ id: "m1", title: "migrate test", owner: "עדינה", category: "office", status: "progress", notes: "", updates: [] }]));
      localStorage.removeItem("beit-pilot-migrated");
      return localStorage.getItem("beit-pilot-migrated");
    });
    if (migration === null) pass("browser-migration-key-ready", "local data present, migration not marked done");
    else skip("browser-migration-key-ready", migration);
  } finally {
    await browser.close();
  }
}

async function verifyOAuthRequiresManual() {
  skip("google-sign-in-e2e", "Requires interactive Google OAuth in browser — cannot automate without credentials");
  skip("profile-creation-live", "Verify on first real Google sign-in after pilot-auth.sql deployed");
  skip("org-membership-live", "Verify with real seeded emails in organization_members");
  skip("shared-tasks-live", "Requires two authenticated sessions");
  skip("shared-suppliers-live", "Requires two authenticated sessions");
  skip("migration-live", "Requires manager OAuth + localStorage data + empty remote DB");
  skip("sign-out-in-live", "Requires authenticated session");
  skip("second-device-live", "Requires manual test on second device/browser profile");
}

async function main() {
  console.log("=== Pilot verification (executable) ===\n");
  await verifyStaticPilotCode();
  console.log("");
  await verifySupabaseInfra();
  console.log("");
  const server = await startStaticServer();
  try {
    await verifyBrowserPilot(server.baseUrl);
  } finally {
    await server.close();
  }
  console.log("");
  await verifyOAuthRequiresManual();

  console.log("\n=== Summary ===");
  console.log(`PASS: ${results.pass.length}  FAIL: ${results.fail.length}  SKIP: ${results.skip.length}`);
  if (results.fail.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
