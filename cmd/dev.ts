import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { config } from "../js/config.js";

const PORT = config.port || 3055;
const ROOT_DIR = process.cwd();

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".ts": "text/plain; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.end("Method Not Allowed");
    return;
  }

  // Parse URL pathname, removing query strings & hashes
  const reqUrl = new URL(req.url || "/", `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(reqUrl.pathname);

  if (pathname === "/") {
    pathname = "/index.html";
  }

  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT_DIR, safePath);

  // Security check: ensure target stays inside project root
  if (!filePath.startsWith(ROOT_DIR)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end(`404 Not Found: ${pathname}`);
      return;
    }

    let finalFilePath = filePath;
    if (stats.isDirectory()) {
      finalFilePath = path.join(filePath, "index.html");
    }

    fs.readFile(finalFilePath, (readErr, content) => {
      if (readErr) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end(`404 Not Found: ${pathname}`);
        return;
      }

      const ext = path.extname(finalFilePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || "application/octet-stream";

      res.statusCode = 200;
      res.setHeader("Content-Type", contentType);
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Development server running at http://localhost:${PORT}`);
});
