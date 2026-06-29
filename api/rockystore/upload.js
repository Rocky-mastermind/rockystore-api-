const axios = require("axios");
const { readDB, writeDB } = require("../../lib/db");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { rawUrl, framework, kind, author, category } = req.body || {};
  if (!rawUrl || !framework || !kind)
    return res.status(400).json({ error: "rawUrl, framework, and kind are required." });

  if (framework !== "goat")
    return res.status(400).json({ error: "Only GoatBot (framework: goat) files are accepted." });

  if (!["command", "event"].includes(kind))
    return res.status(400).json({ error: "kind must be 'command' or 'event'." });

  let rawCode;
  try {
    const r = await axios.get(rawUrl, { timeout: 10000 });
    rawCode = typeof r.data === "string" ? r.data : JSON.stringify(r.data);
  } catch (err) {
    return res.status(400).json({ error: "Failed to fetch rawUrl: " + err.message });
  }

  const extract = (code, field) =>
    code.match(new RegExp(`${field}\\s*:\\s*["'\`](.*?)["'\`]`))?.[1] || null;

  const name             = extract(rawCode, "name")            || "Unknown";
  const version          = extract(rawCode, "version")         || "1.0.0";
  const resolvedAuthor   = author   || extract(rawCode, "author")   || extract(rawCode, "credits") || "Unknown";
  const resolvedCategory = category || extract(rawCode, "category") || "Uncategorized";
  const description      = extract(rawCode, "longDescription") || extract(rawCode, "shortDescription") || "";

  const db = readDB();

  const duplicate = db.commands.find(c => c.rawUrl === rawUrl);
  if (duplicate)
    return res.status(409).json({ error: `Already exists as ID ${duplicate.id}.` });

  const type = `goat-${kind}`;
  const newEntry = {
    id: db.nextId++,
    name,
    version,
    author: resolvedAuthor,
    category: resolvedCategory,
    description,
    type,
    rawUrl,
    rawCode,
    likes: 0,
    views: 0,
    installs: 0,
    likedBy: [],
    uploadDate: new Date().toISOString(),
    owner: "Rocky Chowdhury"
  };

  db.commands.push(newEntry);
  writeDB(db);

  return res.status(200).json({
    success: true,
    id: newEntry.id,
    name: newEntry.name,
    type: newEntry.type,
    author: newEntry.author,
    version: newEntry.version,
    category: newEntry.category,
    owner: newEntry.owner
  });
};
