import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const outputsDir = join(root, "outputs");

const MIME = {
  html: "text/html; charset=utf-8",
  js: "application/javascript; charset=utf-8",
  json: "application/json; charset=utf-8",
  png: "image/png",
  webmanifest: "application/manifest+json"
};

/** שרת סטטי ל-outputs/ — לבדיקות Playwright */
export function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      try {
        const path = (req.url?.split("?")[0] || "/").replace(/^\//, "") || "index.html";
        const filePath = join(outputsDir, path);
        if (!existsSync(filePath)) {
          res.writeHead(404);
          res.end("not found");
          return;
        }
        const body = readFileSync(filePath);
        const ext = path.split(".").pop() || "html";
        res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
        res.end(body);
      } catch (error) {
        reject(error);
      }
    });
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      resolve({
        server,
        port,
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise(r => server.close(() => r()))
      });
    });
  });
}
