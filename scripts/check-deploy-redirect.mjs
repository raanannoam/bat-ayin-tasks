#!/usr/bin/env node
/** בדיקה שה-deploy לא משתמש ב-origin/localhost ל-OAuth redirect */
const BASE = process.argv[2] || "https://bat-ayin-tasks.vercel.app";
const adapters = await fetch(`${BASE}/adapters.js`).then((r) => r.text());
const html = await fetch(`${BASE}/index.html`).then((r) => r.text());
const sw = await fetch(`${BASE}/service-worker.js`).then((r) => r.text());

const checks = [
  ["PILOT_APP_URL in adapters", adapters.includes("bat-ayin-tasks.vercel.app")],
  ["getPilotOAuthRedirectUrl in adapters", adapters.includes("getPilotOAuthRedirectUrl")],
  ["html uses getPilotOAuthRedirectUrl", html.includes("getPilotOAuthRedirectUrl")],
  ["no location.origin redirect", !html.includes("window.location.origin}${window.location.pathname}")],
  ["createClient redirectTo", html.includes("redirectTo: OAUTH_REDIRECT_URL")],
  ["sw cache v19+", /beit-tasks-pwa-v19/.test(sw)]
];

for (const [label, ok] of checks) {
  console.log(ok ? "[OK]" : "[FAIL]", label);
}
if (checks.some(([, ok]) => !ok)) process.exit(1);
