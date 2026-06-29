const { readDB } = require("../../lib/db");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { limit = "5" } = req.query;
  const lim = Math.min(parseInt(limit) || 5, 20);

  const db = readDB();
  const sorted = [...(db.commands || [])]
    .sort((a, b) =>
      ((b.likes||0)+(b.views||0)+(b.installs||0)) -
      ((a.likes||0)+(a.views||0)+(a.installs||0))
    )
    .slice(0, lim)
    .map(({ rawCode, likedBy, ...rest }) => rest);

  return res.status(200).json(sorted);
};
