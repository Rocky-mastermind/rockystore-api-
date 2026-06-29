const { readDB, writeDB } = require("../../../lib/db");

const SECRET_KEY = process.env.ROCKY_SECRET || "rockychowdhury_secret";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { action, id } = req.query;
  const db = readDB();
  const entry = db.commands.find(c => String(c.id) === String(id));

  // INSTALL
  if (action === "install") {
    if (req.method !== "POST") return res.status(405).json({ error: "POST required" });
    if (!entry) return res.status(404).json({ error: "Not found" });
    entry.installs = (entry.installs || 0) + 1;
    writeDB(db);
    return res.status(200).json({ success: true, installs: entry.installs });
  }

  // LIKE
  if (action === "like") {
    if (req.method !== "POST") return res.status(405).json({ error: "POST required" });
    if (!entry) return res.status(404).json({ error: "Not found" });
    const { userID } = req.body || {};
    if (!entry.likedBy) entry.likedBy = [];
    if (userID && entry.likedBy.includes(String(userID)))
      return res.status(200).json({ message: "Already liked", likes: entry.likes });
    if (userID) entry.likedBy.push(String(userID));
    entry.likes = (entry.likes || 0) + 1;
    writeDB(db);
    return res.status(200).json({ success: true, likes: entry.likes });
  }

  // DELETE
  if (action === "delete") {
    if (req.method !== "POST") return res.status(405).json({ error: "POST required" });
    const { secret } = req.body || {};
    if (secret !== SECRET_KEY)
      return res.status(403).json({ error: "Invalid secret key." });
    if (!entry) return res.status(404).json({ error: "Not found" });
    db.commands = db.commands.filter(c => String(c.id) !== String(id));
    writeDB(db);
    return res.status(200).json({ success: true, deleted: id });
  }

  return res.status(404).json({ error: "Unknown action." });
};
