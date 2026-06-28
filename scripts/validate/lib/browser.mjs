import { chromium } from "playwright";

/** פותח דפדפן ומריץ validation harness בדף */
export async function withBrowserPage(baseUrl, fn, { headless = true, query = "" } = {}) {
  const browser = await chromium.launch({ headless });
  try {
    const page = await browser.newPage();
    const url = `${baseUrl}/index.html${query}`;
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForFunction(
      () => window.__appReady && window.__validation?.ready,
      null,
      { timeout: 30000 }
    );
    return await fn(page);
  } finally {
    await browser.close();
  }
}

/** מריץ suite בודד או runAll בדפדפן */
export async function runBrowserValidation(page, options = {}) {
  return page.evaluate(async (opts) => {
    if (!window.__validation?.runAll) {
      return [{ suite: "browser", ok: false, steps: [{ id: "harness", label: "harness loaded", ok: false, error: "__validation missing" }], failed: ["harness"] }];
    }
    return window.__validation.runAll(opts);
  }, options);
}
