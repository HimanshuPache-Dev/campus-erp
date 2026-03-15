# 🚀 Deploy to Netlify NOW - Quick Guide

## ⚡ 5-Minute Deployment

### Step 1: Go to Netlify (1 minute)
1. Open: https://app.netlify.com/
2. Sign up with GitHub
3. Click **"Add new site"** → **"Import an existing project"**

### Step 2: Connect Repository (1 minute)
1. Choose **"Deploy with GitHub"**
2. Find: **campus-erp**
3. Click on it

### Step 3: Configure Build (2 minutes)
**Build settings:**
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `frontend/dist`

**Environment variables** (click "Add environment variable"):
- `VITE_SUPABASE_URL` = Your Supabase URL
- `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

### Step 4: Deploy (1 minute)
1. Click **"Deploy campus-erp"**
2. Wait 2-3 minutes
3. Done! 🎉

### Step 5: Test Your Live Site
Open the URL Netlify gives you (like `https://xxx.netlify.app`)

---

## 🔑 Get Your Supabase Credentials

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **Settings** → **API**
4. Copy:
   - **Project URL** (for VITE_SUPABASE_URL)
   - **anon public** key (for VITE_SUPABASE_ANON_KEY)

---

## ✅ That's It!

Your Campus ERP frontend is now live on the internet!

**Full Guide**: See NETLIFY_DEPLOYMENT.md for detailed instructions

---

**Quick Links:**
- Netlify: https://app.netlify.com/
- Your Repo: https://github.com/HimanshuPache-Dev/campus-erp
- Supabase: https://supabase.com/dashboard

