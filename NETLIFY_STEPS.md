# 🎯 Deploy to Netlify - Step by Step

## Follow These Exact Steps

### ✅ Step 1: Open Netlify

1. Go to: **https://app.netlify.com/**
2. Click **"Sign up"** (if you don't have an account)
3. Choose **"Sign up with GitHub"**
4. Authorize Netlify

---

### ✅ Step 2: Create New Site

1. Click **"Add new site"** button (top right)
2. Select **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. You'll see a list of your repositories
5. Find and click: **campus-erp**

---

### ✅ Step 3: Configure Build Settings

You'll see a form with these fields:

**Branch to deploy:**
```
master
```

**Base directory:**
```
frontend
```

**Build command:**
```
npm run build
```

**Publish directory:**
```
frontend/dist
```

---

### ✅ Step 4: Add Environment Variables

1. Click **"Show advanced"** button
2. Click **"New variable"** button

**Add Variable 1:**
- Key: `VITE_SUPABASE_URL`
- Value: `https://ojdxczneqaxbbvjdehro.supabase.co`

**Add Variable 2:**
- Key: `VITE_SUPABASE_ANON_KEY`  
- Value: `sb_publishable_egorp24lgLptjkiL3nZlcw_Mtz1ib2D`

---

### ✅ Step 5: Deploy!

1. Click **"Deploy campus-erp"** button
2. Wait 2-3 minutes
3. Watch the build logs

You'll see:
- ✅ Installing dependencies
- ✅ Building application
- ✅ Deploying to CDN
- ✅ Site is live!

---

### ✅ Step 6: Get Your Live URL

After deployment completes:

1. You'll see a URL like: `https://random-name-123456.netlify.app`
2. Click on it to open your live site
3. Test the login page

---

## 🎨 Optional: Change Site Name

1. Go to **Site settings**
2. Click **"Change site name"**
3. Enter: `my-campus-erp` (or any available name)
4. Your new URL: `https://my-campus-erp.netlify.app`

---

## 🧪 Test Your Live Site

**Login with:**
- Admin: `admin@campus.com` / `admin123`
- Faculty: `dr.patil@campus.com` / `faculty123`
- Student: `rahul.sharma@campus.edu` / `student123`

---

## 🔄 Auto-Deploy on Git Push

From now on, whenever you push to GitHub:
```bash
git add .
git commit -m "Update"
git push origin master
```

Netlify will automatically rebuild and deploy! 🚀

---

## 📊 Your Deployment Summary

**Repository**: https://github.com/HimanshuPache-Dev/campus-erp

**Build Settings:**
- Base: `frontend`
- Build: `npm run build`
- Publish: `frontend/dist`

**Environment:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## ✅ Done!

Your Campus ERP frontend is now live on the internet! 🎉

**Share your live URL with anyone!**

