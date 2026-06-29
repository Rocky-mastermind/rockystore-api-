const { readDB } = require("../../lib/db");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { limit = "10", offset = "0", type } = req.query;
  const lim = Math.min(parseInt(limit) || 10, 50);
  const off = parseInt(offset) || 0;

  const db = readDB();
  let pool = db.commands || [];
  if (type) pool = pool.filter(c => c.type === type);
  pool = [...pool].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

  const total = pool.length;
  const results = pool.slice(off, off + lim).map(({ rawCode, likedBy, ...rest }) => rest);
  return res.status(200).json({ commands: results, total, limit: lim, offset: off });
};
