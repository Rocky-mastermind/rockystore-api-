const axios = require("axios");
const { readDB, writeDB } = require("../../lib/db");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // GET request আসলে HTML form দেখাও
  if (req.method === "GET") {
    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(`<!DOCTYPE html>
<html>
<head><title>Rocky Store Upload</title>
<style>
body{font-family:sans-serif;max-width:500px;margin:50px auto;padding:20px;background:#111;color:#fff}
input,select{width:100%;padding:10px;margin:8px 0;background:#222;color:#fff;border:1px solid #444;border-radius:6px;box-sizing:border-box}
button{width:100%;padding:12px;background:#6c63ff;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:16px}
button:hover{background:#574fd6}
pre{background:#222;padding:15px;border-radius:6px;white-space:pre-wrap;word-break:break-all}
h2{color:#6c63ff}
</style>
</head>
<body>
<h2>🛒 Rocky Store Upload</h2>
<input id="rawUrl" placeholder="GitHub Raw URL (https://raw.githubusercontent.com/...)" />
<select id="kind"><option value="command">Command</option><option value="event">Event</option></select>
<input id="author" placeholder="Author (optional)" />
<input id="category" placeholder="Category (optional)" />
<button onclick="upload()">⬆️ Upload</button>
<pre id="result">Result will appear here...</pre>
<script>
async function upload(){
  const rawUrl=document.getElementById('rawUrl').value.trim();
  const kind=document.getElementById('kind').value;
  const author=document.getElementById('author').value.trim();
  const category=document.getElementById('category').value.trim();
  if(!rawUrl){document.getElementById('result').textContent='❌ rawUrl দাও!';return;}
  document.getElementById('result').textContent='⏳ Uploading...';
  try{
    const r=await fetch('/rockystore/upload',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({rawUrl,framework:'goat',kind,author,category})
    });
    const d=await r.json();
    document.getElementById('result').textContent=JSON.stringify(d,null,2);
  }catch(e){
    document.getElementById('result').textContent='❌ Error: '+e.message;
  }
}
</script>
</body>
</html>`);
  }

  // POST — actual upload logic
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { rawUrl, framework, kind, author, category } = req.body || {};

  if (!rawUrl || !framework || !kind)
    return res.status(400).json({ error: "rawUrl, framework, kind required." });
  if (framework !== "goat")
    return res.status(400).json({ error: "Only framework: goat accepted." });
  if (!["command", "event"].includes(kind))
    return res.status(400).json({ error: "kind must be 'command' or 'event'." });

  let rawCode = "";
  try {
    const r = await axios.get(rawUrl, {
      timeout: 10000,
      responseType: "text",
      transformResponse: [(d) => d],
    });
    rawCode = String(r.data || "");
  } catch (err) {
    return res.status(400).json({
      error: "rawUrl fetch failed: " + (err.response?.status ? `HTTP ${err.response.status}` : err.message),
    });
  }

  if (!rawCode.trim()) return res.status(400).json({ error: "File is empty." });

  const extract = (code, field) =>
    code.match(new RegExp(`${field}\\s*:\\s*["'\`](.*?)["'\`]`))?.[1]?.trim() || null;

  const name             = extract(rawCode, "name")            || "Unknown";
  const version          = extract(rawCode, "version")         || "1.0.0";
  const resolvedAuthor   = author   || extract(rawCode, "author")   || extract(rawCode, "credits") || "Unknown";
  const resolvedCategory = category || extract(rawCode, "category") || "Uncategorized";
  const description      = extract(rawCode, "longDescription") || extract(rawCode, "shortDescription") || "";

  const db = readDB();

  const duplicate = db.commands.find((c) => c.rawUrl === rawUrl);
  if (duplicate)
    return res.status(409).json({ error: `Already exists as ID ${duplicate.id}.` });

  const newEntry = {
    id: db.nextId++,
    name, version,
    author: resolvedAuthor,
    category: resolvedCategory,
    description,
    type: `goat-${kind}`,
    rawUrl,
    likes: 0, views: 0, installs: 0,
    likedBy: [],
    uploadDate: new Date().toISOString(),
    owner: "Rocky Chowdhury",
  };

  db.commands.push(newEntry);
  const saved = writeDB(db);
  if (!saved) return res.status(500).json({ error: "Database write failed." });

  return res.status(200).json({
    success: true,
    id: newEntry.id,
    name: newEntry.name,
    type: newEntry.type,
    author: newEntry.author,
    version: newEntry.version,
    category: newEntry.category,
    owner: newEntry.owner,
  });
};
