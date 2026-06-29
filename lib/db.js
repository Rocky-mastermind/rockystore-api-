const fs = require("fs");

const DB_PATH = "/tmp/rockystore_db.json";

function readDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf8");
      const parsed = JSON.parse(raw);
      if (!parsed.commands) parsed.commands = [];
      if (!parsed.nextId) parsed.nextId = 1;
      return parsed;
    }
  } catch (err) {
    console.error("[DB] readDB error:", err.message);
  }
  return { commands: [], nextId: 1 };
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("[DB] writeDB error:", err.message);
    return false;
  }
}

module.exports = { readDB, writeDB };
