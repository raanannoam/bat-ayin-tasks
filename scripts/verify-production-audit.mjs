/**
 * Production audit smoke — https://bat-ayin-tasks.vercel.app only.
 * Unauthenticated + polluted localStorage; no localhost.
 */
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { chromium } from "playwright";

const BASE = "https://bat-ayin-tasks.vercel.app";
const DEMO_PEOPLE = ["עדינה", "אבי", "חיה"];
const DEMO_CATEGORY_LABELS = ["מטבח", "תחזוקה"]; // base labels ok if from org — demo leak is custom-only paths

const pass = [];
const fail = [];
const skip = [];

function ok(id, d) {
  pass.push({ id, d });
  console.log(`[PASS] ${id}${d ? ` — ${d}` : ""}`);
}
function bad(id, d) {
  fail.push({ id, d });
  console.error(`[FAIL] ${id}${d ? ` — ${d}` : ""}`);
}
function sk(id, d) {
  skip.push({ id, d });
  console.log(`[SKIP] ${id}${d ? ` — ${d}` : ""}`);
}

async function verifyDeployedArtifacts() {
  const localHash = createHash("sha256").update(readFileSync("outputs/adapters.js")).digest("hex").slice(0, 16);
  const adaptersRes = await fetch(`${BASE}/adapters.js`);
  if (!adaptersRes.ok) return bad("prod-adapters-fetch", String(adaptersRes.status));
  const adaptersBody = await adaptersRes.text();
  const remoteHash = createHash("sha256").update(adaptersBody).digest("hex").slice(0, 16);
  if (localHash === remoteHash) ok("prod-adapters-hash", remoteHash);
  else bad("prod-adapters-hash", `local ${localHash} remote ${remoteHash}`);

  const html = await (await fetch(`${BASE}/index.html`)).text();
  const markers = [
    ["prod-sync-people-catalog", html.includes("syncPeopleCatalog")],
    ["prod-sync-categories-catalog", html.includes("syncCategoriesCatalog")],
    ["prod-org-categories-state", html.includes("orgCategories")],
    ["prod-no-init-loadCategories", !html.includes("let categories = loadCategories()")],
    ["prod-supabase-category-guard", html.includes("DATA_BACKEND !== \"supabase\"") && html.includes("saveCategory")]
  ];
  for (const [id, hit] of markers) (hit ? ok : bad)(id);

  if (adaptersBody.includes("orgCategories") && adaptersBody.includes("categoryCatalog")) {
    ok("prod-adapters-org-categories");
  } else {
    bad("prod-adapters-org-categories");
  }
}

async function verifyPollutedLocalStorage() {
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext();
    await ctx.addInitScript(() => {
      localStorage.setItem("beit-people", JSON.stringify(["עדינה", "אבי", "חיה", "צבי"]));
      localStorage.setItem("beit-hidden-people", "[]");
      localStorage.setItem(
        "beit-categories",
        JSON.stringify([{ id: "custom-leak-test", label: "קטגוריה דמו", icon: "office" }])
      );
      localStorage.setItem("beit-hidden-categories", "[]");
      localStorage.setItem(
        "beit-tasks",
        JSON.stringify([{ id: "local-leak", title: "משימה מקומית", owner: "עדינה", category: "office", status: "progress" }])
      );
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle", timeout: 90000 });
    await page.waitForFunction(() => window.__appReady, null, { timeout: 45000 });

    const boot = await page.evaluate(async () => {
      await window.__appReady;
      const H = window.__validationHooks;
      return {
        backend: H?.DATA_BACKEND,
        authStatus: H?.state?.authStatus,
        orgPeople: H?.state?.orgPeople || [],
        orgCategories: H?.state?.orgCategories || [],
        appText: document.getElementById("app")?.innerText || ""
      };
    });

    if (boot.backend === "supabase") ok("prod-runtime-supabase");
    else bad("prod-runtime-supabase", boot.backend);

    if (boot.authStatus === "signed_out") ok("prod-login-gate-active");
    else bad("prod-login-gate-active", boot.authStatus);

    const leakedDemo = DEMO_PEOPLE.some((name) => boot.appText.includes(name));
    if (!leakedDemo) ok("prod-no-demo-people-on-login");
    else bad("prod-no-demo-people-on-login", "demo names in login UI");

    if (!boot.appText.includes("קטגוריה דמו")) ok("prod-no-custom-category-on-login");
    else bad("prod-no-custom-category-on-login");

    if (boot.orgPeople.length === 0 && boot.orgCategories.length === 0) {
      ok("prod-catalogs-empty-before-auth");
    } else {
      bad("prod-catalogs-empty-before-auth", JSON.stringify(boot));
    }

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__appReady, null, { timeout: 45000 });
    const afterRefresh = await page.evaluate(async () => {
      await window.__appReady;
      return {
        authStatus: window.__validationHooks?.state?.authStatus,
        hasLogin: Boolean(document.getElementById("googleSignIn")),
        appText: document.getElementById("app")?.innerText || ""
      };
    });
    if (afterRefresh.authStatus === "signed_out" && afterRefresh.hasLogin) ok("prod-hard-refresh-login");
    else bad("prod-hard-refresh-login", JSON.stringify(afterRefresh));

    const leakedAfter = DEMO_PEOPLE.some((name) => afterRefresh.appText.includes(name));
    if (!leakedAfter) ok("prod-no-demo-after-refresh");
    else bad("prod-no-demo-after-refresh");

    let oauthStarted = false;
    page.on("framenavigated", (frame) => {
      const url = frame.url();
      if (/accounts\.google\.com|supabase\.co.*auth/.test(url)) oauthStarted = true;
    });
    await page.click("#googleSignIn").catch(() => {});
    await page.waitForTimeout(4000);
    const oauthUrl = page.url();
    if (oauthStarted || /accounts\.google\.com|supabase\.co.*auth/.test(oauthUrl)) {
      ok("prod-google-oauth-redirect", oauthStarted ? "redirect" : oauthUrl.slice(0, 72));
    } else {
      bad("prod-google-oauth-redirect");
    }
  } finally {
    await browser.close();
  }
}

console.log(`=== Production audit smoke: ${BASE} ===\n`);
await verifyDeployedArtifacts();
console.log("");
await verifyPollutedLocalStorage();

sk("prod-task-create-live", "requires Google OAuth session");
sk("prod-supplier-create-live", "requires Google OAuth session");
sk("prod-manager-org-members-ui", "requires manager OAuth session");
sk("prod-member-rls-scope", "requires member OAuth session");

console.log(`\n=== Summary: PASS ${pass.length} FAIL ${fail.length} SKIP ${skip.length} ===`);
if (fail.length) process.exit(1);
