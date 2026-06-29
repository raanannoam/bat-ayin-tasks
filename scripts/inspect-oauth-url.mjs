/** בודק ש-OAuth מ-production שולח redirect_to ל-Vercel (לא localhost) */
import { chromium } from "playwright";

const BASE = (process.argv[2] || "https://bat-ayin-tasks.vercel.app").replace(/\/$/, "");
const PROD = "https://bat-ayin-tasks.vercel.app/index.html";

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  let oauthUrl = null;
  page.on("request", (req) => {
    const u = req.url();
    if (u.includes("/auth/v1/authorize") && u.includes("provider=google")) oauthUrl = u;
  });
  await page.goto(`${BASE}/index.html`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForFunction(() => window.__appReady, null, { timeout: 45000 });
  await page.click("#googleSignIn");
  await page.waitForTimeout(3000);
  if (!oauthUrl) {
    console.error("[FAIL] no authorize request captured");
    process.exit(1);
  }
  const parsed = new URL(oauthUrl);
  const redirectTo = parsed.searchParams.get("redirect_to");
  console.log("redirect_to:", redirectTo);
  if (redirectTo === PROD) {
    console.log("[OK] OAuth redirect_to is production Vercel URL");
  } else if (redirectTo?.includes("127.0.0.1") || redirectTo?.includes("localhost")) {
    console.error("[FAIL] redirect_to points to localhost — client bug or stale deploy");
    process.exit(1);
  } else {
    console.error("[FAIL] unexpected redirect_to:", redirectTo);
    process.exit(1);
  }
} finally {
  await browser.close();
}
