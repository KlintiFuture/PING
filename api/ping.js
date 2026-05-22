import net from "net";

const MAX_BODY_BYTES = 8 * 1024;

function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk;

      if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
        reject(new Error("Request body too large"));
      }
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });

    req.on("error", reject);
  });
}

function tcpPing(host, port = 80, timeout = 3000) {
  return new Promise(resolve => {
    const start = Date.now();
    const socket = new net.Socket();

    let finished = false;

    const finalize = result => {
      if (!finished) {
        finished = true;
        socket.destroy();
        resolve(result);
      }
    };

    socket.setTimeout(timeout);

    socket.connect(port, host, () => {
      const latency = Date.now() - start;

      finalize({
        ok: true,
        latency
      });
    });

    socket.on("timeout", () => {
      finalize({
        ok: false,
        error: "Connection timeout"
      });
    });

    socket.on("error", error => {
      finalize({
        ok: false,
        error: error.message
      });
    });
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, {
      ok: false,
      error: "Method not allowed"
    });
  }

  try {
    const body = await readJsonBody(req);

    const target = String(body.target || "").trim();
    const port = Number(body.port || 80);
    const timeout = Number(body.timeout || 3000);

    if (!target) {
      return sendJson(res, 400, {
        ok: false,
        error: "Target is required"
      });
    }

    const result = await tcpPing(target, port, timeout);

    return sendJson(res, 200, {
      target,
      port,
      ...result
    });
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      error: error.message
    });
  }
}