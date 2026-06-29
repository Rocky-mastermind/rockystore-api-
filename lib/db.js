const fs = require("fs");
const path = require("path");

// Data file - Vercel /tmp এ store হবে (per-instance, but good enough for testing)
// Production এ GitHub Gist use করা হবে - no key needed for public gists
const DB_PATH = "/tmp/rockystore_db.json";
const DEFAULT = { commands: [], nextId: 1 };

function readDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf8");
      const db = JSON.parse(raw);
      if (!Array.isArray(db.commands)) db.commands = [];
      if (!db.nextId) db.nextId = 1;
      return db;
    }
  } catch (e) {
    console.error("[DB] readDB:", e.message);
  }
  return { ...DEFAULT, commands: [] };
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data), "utf8");
    return true;
  } catch (e) {
    console.error("[DB] writeDB:", e.message);
    return false;
  }
}

module.exports = { readDB, writeDB };
