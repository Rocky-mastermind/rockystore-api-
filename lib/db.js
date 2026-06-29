const https = require("https");

// GitHub Gist - Free persistent storage
// GITHUB_TOKEN = তোমার GitHub personal access token (gist scope)
// GIST_ID = একবার create করলেই হবে
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GIST_ID      = process.env.GIST_ID      || "";
const GIST_FILE    = "rockystore_db.json";
const DEFAULT_DB   = { commands: [], nextId: 1 };

function httpsRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function readDB() {
  if (!GITHUB_TOKEN || !GIST_ID) return { ...DEFAULT_DB };
  try {
    const res = await httpsRequest({
      hostname: "api.github.com",
      path: `/gists/${GIST_ID}`,
      method: "GET",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "User-Agent": "rockystore-api",
        Accept: "application/vnd.github.v3+json",
      },
    });
    const content = res.body?.files?.[GIST_FILE]?.content;
    if (!content) return { ...DEFAULT_DB };
    const db = JSON.parse(content);
    if (!db.commands) db.commands = [];
    if (!db.nextId) db.nextId = 1;
    return db;
  } catch (e) {
    console.error("[DB] readDB:", e.message);
    return { ...DEFAULT_DB };
  }
}

async function writeDB(data) {
  if (!GITHUB_TOKEN || !GIST_ID) return false;
  try {
    const body = JSON.stringify({
      files: { [GIST_FILE]: { content: JSON.stringify(data) } },
    });
    const res = await httpsRequest({
      hostname: "api.github.com",
      path: `/gists/${GIST_ID}`,
      method: "PATCH",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "User-Agent": "rockystore-api",
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
        "Content-Length": Buffer.byteLength(body),
      },
    }, body);
    return res.status === 200;
  } catch (e) {
    console.error("[DB] writeDB:", e.message);
    return false;
  }
}

module.exports = { readDB, writeDB };
