# 🚀 QUICK START - Campus ERP

## ⚡ Get Running in 3 Steps

### Step 1: Setup Database (2 minutes)

1. Open: https://supabase.com/dashboard
2. Select project: `ojdxczneqaxbbvjdehro`
3. Click: **SQL Editor** → **New Query**
4. Copy ALL from: `campus-erp/backend/COMPLETE_DATABASE_SETUP.sql`
5. Paste and click **RUN**

✅ Done! All tables created.

---

### Step 2: Start Backend (1 minute)

```bash
cd campus-erp/backend
npm install
npm start
```

✅ Backend running on http://localhost:3000

---

### Step 3: Start Frontend (1 minute)

```bash
cd campus-erp/frontend
npm install
npm run dev
```

✅ Frontend running on http://localhost:5173

---

## 🎯 Login & Test

Open: http://localhost:5173

**Test Accounts:**
- Admin: `admin@campus.com` / `admin123`
- Faculty: `dr.patil@campus.com` / `faculty123`
- Student: `rahul.sharma@campus.edu` / `student123`

---

## 📝 Optional: Add Sample Data

```bash
cd campus-erp/backend
node src/seed.js
```

This adds test users, courses, and enrollments.

---

## ✅ That's It!

Your Campus ERP is ready to use.

**Need help?** Read `ALL_MIGRATIONS_COMPLETE.md` for full details.

