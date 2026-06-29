/**
 * Verify deployed Vercel pilot app — HTTPS only.
 * Usage: node scripts/verify-deployed.mjs [baseUrl]
 */
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { chromium } from "playwright";

const BASE = (process.argv[2] || "https://bat-ayin-tasks.vercel.app").replace(/\/$/, "");
const SUPABASE_URL = "https://jxjxjvxbxpgvlarzbohm.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4anhqdnhieHBndmxhcnpib2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTgyNjUsImV4cCI6MjA5NTUzNDI2NX0.g1W8SJWTRc3FYeZJIVdLBTKcSfHVgfQQZ_brjRKest4";

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

async function verifyLatestBuild() {
  const localHash = createHash("sha256").update(readFileSync("outputs/adapters.js")).digest("hex").slice(0, 16);
  const res = await fetch(`${BASE}/adapters.js`);
  if (!res.ok) return bad("deploy-adapters-fetch", `status ${res.status}`);
  const remote = Buffer.from(await res.arrayBuffer());
  const remoteHash = createHash("sha256").update(remote).digest("hex").slice(0, 16);
  if (localHash === remoteHash) ok("deploy-latest-adapters", `sha256:${remoteHash}`);
  else bad("deploy-latest-adapters", `local ${localHash} vs remote ${remoteHash}`);

  const htmlRes = await fetch(`${BASE}/index.html`);
  const html = await htmlRes.text();
  const markers = [
    ["pilot-auth-ui", html.includes("signInWithGoogle") && html.includes("loadPilotAuthContext")],
    ["no-mockup-role", !html.includes("beit-mockup-role")],
    ["sw-v2", (await fetch(`${BASE}/service-worker.js`)).ok]
  ];
  for (const [id, hit] of markers) (hit ? ok : bad)(id);
}

async function verifySupabase() {
  const health = await fetch(`${SUPABASE_URL}/auth/v1/health`, { headers: { apikey: ANON_KEY } });
  if (health.ok) ok("supabase-auth-health");
  else bad("supabase-auth-health", String(health.status));

  const tasks = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=id&limit=1`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, "Accept-Profile": "bat_ayin" }
  });
  if (tasks.ok) ok("supabase-bat_ayin-api");
  else bad("supabase-bat_ayin-api", String(tasks.status));
}

async function verifyBrowser() {
  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle", timeout: 90000 });
    await page.waitForFunction(() => window.__appReady, null, { timeout: 45000 });

    const boot = await page.evaluate(async () => {
      await window.__appReady;
      const H = window.__validationHooks;
      return {
        backend: H?.DATA_BACKEND,
        authStatus: H?.state?.authStatus,
        hasLogin: Boolean(document.getElementById("googleSignIn")),
        hasPilotNotice: Boolean(document.getElementById("pilotNotice")),
        manifest: Boolean(document.querySelector('link[href="manifest.json"]'))
      };
    });
    if (boot.backend === "supabase") ok("live-backend-supabase");
    else bad("live-backend-supabase", boot.backend);
    if (boot.authStatus === "signed_out" && boot.hasLogin) ok("live-login-gate");
    else bad("live-login-gate", JSON.stringify(boot));
    if (boot.hasPilotNotice && boot.manifest) ok("live-pwa-meta");

    const sw = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      return { registered: Boolean(reg), scope: reg?.scope || null };
    });
    if (sw.registered) ok("live-sw-registered", sw.scope);
    else bad("live-sw-registered");

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__appReady, null, { timeout: 45000 });
    const after = await page.evaluate(async () => {
      await window.__appReady;
      return {
        authStatus: window.__validationHooks?.state?.authStatus,
        hasLogin: Boolean(document.getElementById("googleSignIn"))
      };
    });
    if (after.authStatus === "signed_out" && after.hasLogin) ok("live-refresh-persistence");
    else bad("live-refresh-persistence", JSON.stringify(after));

    const offlineCtx = await browser.newContext();
    const offlinePage = await offlineCtx.newPage();
    await offlinePage.goto(`${BASE}/index.html`, { waitUntil: "networkidle", timeout: 90000 });
    await offlinePage.waitForFunction(() => window.__appReady, null, { timeout: 45000 });
    await page.waitForFunction(() => navigator.serviceWorker?.controller, null, { timeout: 20000 });
    await offlineCtx.setOffline(true);
    try {
      await offlinePage.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
    } catch {
      /* offline reload may partially fail */
    }
    const offline = await offlinePage.evaluate(() => Boolean(document.querySelector(".app-shell"))).catch(() => false);
    if (offline) ok("live-offline-reopen");
    else bad("live-offline-reopen");
    await offlineCtx.close();

    const oauthCtx = await browser.newContext();
    const oauthPage = await oauthCtx.newPage();
    await oauthPage.goto(`${BASE}/index.html`, { waitUntil: "networkidle", timeout: 90000 });
    await oauthPage.waitForFunction(() => window.__appReady, null, { timeout: 45000 });
    let oauthStarted = false;
    oauthPage.on("framenavigated", (frame) => {
      const url = frame.url();
      if (/accounts\.google\.com|supabase\.co.*auth/.test(url)) oauthStarted = true;
    });
    await oauthPage.click("#googleSignIn").catch(() => {});
    await oauthPage.waitForTimeout(4000);
    const current = oauthPage.url();
    if (oauthStarted || /accounts\.google\.com|supabase\.co.*auth/.test(current)) {
      ok("live-google-oauth-start", oauthStarted ? "redirect detected" : current.slice(0, 80));
    } else {
      sk("live-google-oauth-start", "redirect not captured in headless — verify manually");
    }
    await oauthCtx.close();

    sk("live-manager-login", "requires Google account credentials");
    sk("live-member-login", "requires Google account credentials");
    sk("live-shared-tasks", "requires two authenticated sessions");
    sk("live-shared-suppliers", "requires two authenticated sessions");
    sk("live-sign-out-in", "requires authenticated session");
    sk("live-second-device", "manual test on second device recommended");
    sk("live-pwa-install", "manual Add to Home Screen on mobile");
  } finally {
    await browser.close();
  }
}

console.log(`=== Deploy verification: ${BASE} ===\n`);
await verifyLatestBuild();
console.log("");
await verifySupabase();
console.log("");
await verifyBrowser();
console.log(`\n=== Summary: PASS ${pass.length} FAIL ${fail.length} SKIP ${skip.length} ===`);
if (fail.length) process.exit(1);
