import { chromium } from "playwright";

const url = "http://127.0.0.1:8899/index.html?debugBackend=supabase";
const authLogs = [];

const browser = await chromium.launch();
const page = await browser.newPage();
page.on("console", (msg) => {
  const text = msg.text();
  if (text.includes("[debug][auth]")) authLogs.push(text);
});
await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(4000);
const liveTrace = await page.evaluate(() => window.__cp32LiveTrace || null);
const first10 = await page.evaluate(() => window.__authDebugLogsFirst10 || null);
await browser.close();
console.log(JSON.stringify({ liveTrace, first10, authLogs: authLogs.slice(0, 10) }, null, 2));
