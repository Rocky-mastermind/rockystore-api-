const fs = require("fs");

const DB_PATH = "/tmp/rockystore_db.json";

function readDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    }
  } catch (_) {}
  return { commands: [], nextId: 1 };
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (_) {}
}

module.exports = { readDB, writeDB };
