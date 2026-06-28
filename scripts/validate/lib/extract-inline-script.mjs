import { readFileSync } from "node:fs";

/** מחלץ inline script בלבד (ללא src) מתוך index.html */
export function extractInlineScript(html) {
  const blocks = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
  if (!blocks.length) throw new Error("inline script not found");
  return blocks[0][1];
}

export function checkIndexHtmlSyntax(path = "outputs/index.html") {
  new Function(extractInlineScript(readFileSync(path, "utf8")));
}
