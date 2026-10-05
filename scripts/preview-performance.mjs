// Local production-build benchmark. Never deploy this instrumented server.
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { resolve, extname, sep } from "node:path";

const root = resolve(process.argv[2] || "dist");
const port = Number(process.argv[3] || 4173);
const slow = process.argv.includes("--slow");
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Choose a port between 1024 and 65535.");
await stat(resolve(root, "index.html"));

// Inject before the app starts; collect only timings and public asset sizes.
const metrics = `<script>
(() => {
  const measurements = { lcp: null, longTasks: 0, longTaskMs: 0, card: null, actionEnabled: null };
  for (const type of ["largest-contentful-paint", "longtask"]) {
    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (type === "longtask") {
            measurements.longTasks++;
            measurements.longTaskMs += entry.duration;
          } else measurements.lcp = entry.startTime;
        }
      }).observe({ type, buffered: true });
    } catch { /* Not all browsers support these entry types. */ }
  }
  const observer = new MutationObserver(() => {
    if (!measurements.card && document.getElementById("active-tip-title")) measurements.card = performance.now();
    const button = document.querySelector(".tip-card .primary-button");
    if (!measurements.actionEnabled && button && !button.disabled) measurements.actionEnabled = performance.now();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
  window.addEventListener("load", () => setTimeout(() => {
    observer.disconnect();
    const navigation = performance.getEntriesByType("navigation")[0];
    document.documentElement.dataset.perf = JSON.stringify({
      ...measurements,
      fcp: performance.getEntriesByName("first-contentful-paint")[0]?.startTime,
      domContentLoaded: navigation.domContentLoadedEventEnd,
      load: navigation.loadEventEnd,
      resources: performance.getEntriesByType("resource")
        .filter(resource => resource.name.startsWith(location.origin + "/"))
        .map(resource => ({
          name: resource.name.split("/").pop(), bytes: resource.encodedBodySize,
          decoded: resource.decodedBodySize, end: resource.responseEnd, duration: resource.duration,
        })),
    });
  }, 2000));
})();
</script>`;

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
http.createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (pathname === "/" || !extname(pathname)) pathname = "/index.html";
    const file = resolve(root, `.${pathname}`);
    if (!file.startsWith(root + sep)) throw new Error("Invalid path");
    let data = await readFile(file);
    const ext = extname(file);
    if (ext === ".html") data = Buffer.from(data.toString().replace("<head>", "<head>" + metrics));
    const compress = [".html", ".js", ".css"].includes(ext);
    if (compress) data = gzipSync(data);
    res.setHeader("Content-Type", types[ext] || "application/octet-stream");
    res.setHeader("Cache-Control", "no-store");
    if (compress) res.setHeader("Content-Encoding", "gzip");
    res.setHeader("Content-Length", data.length);
    if (!slow) { res.end(data); return; }
    // Per-response shaping, not a shared bandwidth cap or a mobile simulation.
    let interval;
    const delay = setTimeout(() => {
      let offset = 0;
      interval = setInterval(() => {
        res.write(data.subarray(offset, offset + 4000));
        offset += 4000;
        if (offset >= data.length) { clearInterval(interval); res.end(); }
      }, 20);
    }, 150);
    res.on("close", () => { clearTimeout(delay); clearInterval(interval); });
  } catch {
    res.writeHead(404);
    res.end();
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Measuring ${root} at http://127.0.0.1:${port}${slow ? " (delayed delivery)" : ""}`);
  console.log("After loading, read JSON.parse(document.documentElement.dataset.perf) in browser DevTools.");
});
