const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DASHBOARD_ROOT = path.join(ROOT, "dashboard");
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "127.0.0.1";

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

function send(response, statusCode, body, contentType) {
  response.writeHead(statusCode, { "Content-Type": contentType });
  response.end(body);
}

function safeResolve(requestPath) {
  const normalized = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const stripped = normalized.replace(/^[/\\]+/, "");
  const target = stripped === "" ? path.join(DASHBOARD_ROOT, "index.html") : path.join(ROOT, stripped);

  if (!target.startsWith(ROOT)) {
    return null;
  }

  return target;
}

function getFilePath(urlPath) {
  if (urlPath === "/" || urlPath === "/dashboard") {
    return path.join(DASHBOARD_ROOT, "index.html");
  }

  if (urlPath.startsWith("/dashboard/")) {
    return safeResolve(urlPath.slice(1));
  }

  return safeResolve(urlPath.slice(1));
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, "http://localhost");
  const filePath = getFilePath(requestUrl.pathname);

  if (!filePath) {
    send(response, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError) {
      send(response, 404, "Not found", "text/plain; charset=utf-8");
      return;
    }

    const finalPath = stats.isDirectory() ? path.join(filePath, "index.html") : filePath;
    fs.readFile(finalPath, (readError, fileBuffer) => {
      if (readError) {
        send(response, 500, "Unable to read file", "text/plain; charset=utf-8");
        return;
      }

      const extension = path.extname(finalPath).toLowerCase();
      const contentType = CONTENT_TYPES[extension] || "application/octet-stream";
      send(response, 200, fileBuffer, contentType);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`FRUS dashboard available at http://${HOST}:${PORT}`);
});
