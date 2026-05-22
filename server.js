const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const net = require("net");
const os = require("os");

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "0.0.0.0";
const PUBLIC_DIR = path.join(__dirname, "public");
const MAX_BODY_BYTES = 8 * 1024;

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".ico", "image/x-icon"]
]);

function getLanAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter(address => address && address.family === "IPv4" && !address.internal)
    .map(address => address.address);
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Request body is too large."), { statusCode: 413 }));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(Object.assign(new Error("Invalid JSON body."), { statusCode: 400 }));
      }
    });

    req.on("error", reject);
  });
}

function buildPingArgs(target, count, timeoutSeconds) {
  const timeoutMs = Math.max(1000, Math.round(timeoutSeconds * 1000));

  if (process.platform === "win32") {
    return ["-n", String(count), "-w", String(timeoutMs), target];
  }

  if (process.platform === "darwin") {
    return ["-c", String(count), "-W", String(timeoutMs), target];
  }

  return ["-c", String(count), "-W", String(Math.ceil(timeoutSeconds)), target];
}

function parsePingOutput(output) {
  const text = output.replace(/\r\n/g, "\n").trim();
  const result = {
    transmitted: null,
    received: null,
    lossPercent: null,
    minMs: null,
    avgMs: null,
    maxMs: null,
    address: null
  };

  const windowsPackets = text.match(/Packets:\s*Sent\s*=\s*(\d+),\s*Received\s*=\s*(\d+),\s*Lost\s*=\s*(\d+)\s*\((\d+)%\s*loss\)/i);
  if (windowsPackets) {
    result.transmitted = Number(windowsPackets[1]);
    result.received = Number(windowsPackets[2]);
    result.lossPercent = Number(windowsPackets[4]);
  }

  const unixPackets = text.match(/(\d+)\s+packets transmitted,\s+(\d+)(?:\s+packets)?\s+received.*?([\d.]+)%\s+packet loss/is);
  if (unixPackets) {
    result.transmitted = Number(unixPackets[1]);
    result.received = Number(unixPackets[2]);
    result.lossPercent = Number(unixPackets[3]);
  }

  const windowsTimes = text.match(/Minimum\s*=\s*(\d+)ms,\s*Maximum\s*=\s*(\d+)ms,\s*Average\s*=\s*(\d+)ms/i);
  if (windowsTimes) {
    result.minMs = Number(windowsTimes[1]);
    result.maxMs = Number(windowsTimes[2]);
    result.avgMs = Number(windowsTimes[3]);
  }

  const unixTimes = text.match(/(?:rtt|round-trip).*?=\s*([\d.]+)\/([\d.]+)\/([\d.]+)\/?[\d.]*\s*ms/i);
  if (unixTimes) {
    result.minMs = Number(unixTimes[1]);
    result.avgMs = Number(unixTimes[2]);
    result.maxMs = Number(unixTimes[3]);
  }

  const replyAddress = text.match(/Reply from\s+([^\s:]+)[:\s]/i);
  const windowsTarget = text.match(/Pinging\s+[^\s]+\s+\[([^\]]+)\]/i);
  const unixTarget = text.match(/PING\s+[^\s]+\s+\(([^)]+)\)/i);

  result.address = (replyAddress && replyAddress[1]) ||
    (windowsTarget && windowsTarget[1]) ||
    (unixTarget && unixTarget[1]) ||
    null;

  if (result.received === null) {
    result.received = (text.match(/time[=<]\s*[\d.]+\s*ms/gi) || []).length;
  }

  return result;
}

async function handlePing(req, res) {
  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (error) {
    sendJson(res, error.statusCode || 400, { ok: false, error: error.message });
    return;
  }

  const target = String(payload.target || "").trim();
  const count = Math.min(5, Math.max(1, Number.parseInt(payload.count, 10) || 4));
  const timeoutSeconds = Math.min(10, Math.max(1, Number.parseFloat(payload.timeout) || 3));

  if (!net.isIP(target)) {
    sendJson(res, 400, {
      ok: false,
      error: "Enter a valid IPv4 or IPv6 address."
    });
    return;
  }

  const args = buildPingArgs(target, count, timeoutSeconds);
  const executionTimeout = count * timeoutSeconds * 1000 + 2500;

  execFile("ping", args, { timeout: executionTimeout, windowsHide: true }, (error, stdout, stderr) => {
    const raw = `${stdout || ""}${stderr || ""}`.trim();
    const parsed = parsePingOutput(raw);
    const reachable = typeof parsed.received === "number" ? parsed.received > 0 : !error;

    if (error && !raw) {
      sendJson(res, 500, {
        ok: false,
        error: error.killed ? "Ping timed out." : "Ping command failed.",
        details: error.message
      });
      return;
    }

    sendJson(res, 200, {
      ok: reachable,
      target,
      count,
      timeoutSeconds,
      address: parsed.address || target,
      transmitted: parsed.transmitted,
      received: parsed.received,
      lossPercent: parsed.lossPercent,
      minMs: parsed.minMs,
      avgMs: parsed.avgMs,
      maxMs: parsed.maxMs,
      raw
    });
  });
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requestedPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const normalizedPath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, normalizedPath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (req.method === "GET" && !path.extname(filePath)) {
        fs.readFile(path.join(PUBLIC_DIR, "index.html"), (indexError, indexData) => {
          if (indexError) {
            res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Unable to load app");
            return;
          }

          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(indexData);
        });
        return;
      }

      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const contentType = mimeTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/ping") {
    handlePing(req, res);
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }

  sendJson(res, 405, { ok: false, error: "Method not allowed." });
});

server.listen(PORT, HOST, () => {
  console.log(`Ping Network is running at http://localhost:${PORT}`);
  getLanAddresses().forEach(address => {
    console.log(`LAN access: http://${address}:${PORT}`);
  });
});
