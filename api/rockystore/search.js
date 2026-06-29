const { readDB, writeDB } = require("../../lib/db");
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const { q, limit = "10", offset = "0", type } = req.query;
  const lim = Math.min(parseInt(limit) || 10, 50);
  const off = parseInt(offset) || 0;
  const db = await readDB();
  let pool = db.commands || [];
  if (q && !isNaN(q)) {
    const found = db.commands.find(c => String(c.id) === String(q));
    if (!found) return res.status(404).json({ message: "Not found" });
    found.views = (found.views || 0) + 1;
    await writeDB(db);
    const { rawCode, likedBy, ...safe } = found;
    return res.status(200).json(safe);
  }
  if (type) pool = pool.filter(c => c.type === type);
  if (q) {
    const lower = q.toLowerCase();
    pool = pool.filter(c =>
      c.name?.toLowerCase().includes(lower) ||
      c.author?.toLowerCase().includes(lower) ||
      c.category?.toLowerCase().includes(lower) ||
      c.description?.toLowerCase().includes(lower)
    );
  }
  const total = pool.length;
  const results = pool.slice(off, off + lim).map(({ rawCode, likedBy, ...rest }) => rest);
  return res.status(200).json({ commands: results, total, limit: lim, offset: off });
};
