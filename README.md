# 🏪 Rocky Store API
**Owner:** Rocky Chowdhury  
**Deploy URL:** `https://rockystore.vercel.app`

---

## 📁 Project Structure

```
rockystore-api/
├── api/
│   └── rockystore/
│       ├── upload.js          → POST /rockystore/upload
│       ├── list.js            → GET  /rockystore/list
│       ├── search.js          → GET  /rockystore/search
│       ├── trending.js        → GET  /rockystore/trending
│       └── [action]/
│           └── [id].js        → POST /rockystore/like/:id
│                                  POST /rockystore/install/:id
│                                  POST /rockystore/delete/:id
├── lib/
│   └── db.js                  → JSON storage helper
├── vercel.json                → Vercel routing config
└── package.json
```

---

## 🚀 Deploy to Vercel (Step by Step)

### 1. GitHub এ push করুন
```bash
git init
git add .
git commit -m "Rocky Store API - by Rocky Chowdhury"
git remote add origin https://github.com/YOUR_USERNAME/rockystore-api.git
git push -u origin main
```

### 2. Vercel এ deploy করুন
1. [vercel.com](https://vercel.com) এ যান
2. **New Project** → GitHub repo select করুন
3. Project name দিন: `rockystore`
4. **Environment Variables** এ add করুন:
   - `ROCKY_SECRET` = আপনার নিজের secret key (যেটা দিয়ে command delete করবেন)
5. **Deploy** চাপুন

### 3. Custom domain (optional)
Vercel dashboard → Settings → Domains → `rockystore.vercel.app` auto পাবেন

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/rockystore/upload` | Upload a GoatBot command/event |
| GET | `/rockystore/list?type=goat-command&limit=10&offset=0` | List all commands |
| GET | `/rockystore/search?q=ping&type=goat-command` | Search commands |
| GET | `/rockystore/trending?limit=5` | Trending commands |
| POST | `/rockystore/like/:id` | Like a command |
| POST | `/rockystore/install/:id` | Increment install count |
| POST | `/rockystore/delete/:id` | Delete (requires secret) |

---

## ⚠️ Important Note — Database

এই API `/tmp` folder use করে data store করে। Vercel serverless functions এ `/tmp` **temporary** — মানে restart হলে data যেতে পারে।

### Production এর জন্য Vercel KV ব্যবহার করুন:
1. Vercel Dashboard → Storage → **Create KV Database**
2. `lib/db.js` এ নিচের code দিয়ে replace করুন:

```js
const { kv } = require("@vercel/kv");

async function readDB() {
  const data = await kv.get("rockystore_db");
  return data || { commands: [], nextId: 1 };
}

async function writeDB(data) {
  await kv.set("rockystore_db", data);
}

module.exports = { readDB, writeDB };
```

3. `package.json` এ add করুন: `"@vercel/kv": "^1.0.0"`

---

## 🤖 GoatBot Command File

`goatstore.js` ফাইলটি আপনার bot এর `scripts/cmds/` folder এ রাখুন।

**Commands:**
```
!gs              → Menu
!gs n            → Today's updates
!gs list         → Command list
!gs list event   → Event list
!gs <name/id>    → Search
!gs install <id> → Install
!gs like <id>    → Like
!gs trending     → Trending
!gs upload <file>→ Upload
!gs sync         → Manual sync
!gs delete <id> <secret> → Delete
```

---

**© Rocky Chowdhury — All Rights Reserved**
