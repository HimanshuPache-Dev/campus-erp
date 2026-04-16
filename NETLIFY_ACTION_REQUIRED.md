# ⚠️ ACTION REQUIRED: Netlify Environment Variables

## 🚨 IMPORTANT: Your deployment will fail without these steps!

Your code is deploying to Netlify, but you **MUST** add environment variables for the app to work.

## 📋 Quick Steps (5 minutes)

### Step 1: Open Netlify Dashboard
1. Go to https://app.netlify.com
2. Select your site (campus-erp)

### Step 2: Add Environment Variables
1. Click **Site settings** (in top navigation)
2. Click **Environment variables** (left sidebar under "Build & deploy")
3. Click **Add a variable** button

### Step 3: Add First Variable
- **Key:** `VITE_SUPABASE_URL`
- **Value:** `https://xwlglapzycdseitkwqlr.supabase.co`
- **Scopes:** Check all boxes (Production, Deploy Previews, Branch deploys)
- Click **Create variable**

### Step 4: Add Second Variable
- **Key:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `sb_publishable_RtV3uo_NTL5HqtDI1i85Cw_tEnwulUM`
- **Scopes:** Check all boxes (Production, Deploy Previews, Branch deploys)
- Click **Create variable**

### Step 5: Trigger New Deploy
1. Go to **Deploys** tab (top navigation)
2. Click **Trigger deploy** button (top right)
3. Select **Deploy site**
4. Wait for build to complete (2-3 minutes)

## ✅ Verification

After deployment completes:
1. Click on the site URL (e.g., `https://your-site.netlify.app`)
2. You should see the login page
3. Try logging in as admin:
   - Email: `admin@campus.com`
   - Password: `admin123`
4. If login works, you're done! 🎉

## 🔍 If Build Fails

### Check Build Logs:
1. Go to **Deploys** tab
2. Click on the failed deploy
3. Scroll down to see error messages

### Common Issues:

**"VITE_SUPABASE_URL is not defined"**
- Solution: Add environment variables (see steps above)

**"Module not found"**
- Solution: Should auto-resolve, Netlify installs dependencies automatically

**"Build command failed"**
- Solution: Check if `base = "frontend"` in netlify.toml (it is!)

## 📸 Visual Guide

### Where to Find Environment Variables:
```
Netlify Dashboard
└── Your Site
    └── Site settings (top nav)
        └── Environment variables (left sidebar)
            └── Add a variable (button)
```

### What It Should Look Like:
```
Environment variables
┌─────────────────────────────────────────────────────┐
│ VITE_SUPABASE_URL                                   │
│ https://xwlglapzycdseitkwqlr.supabase.co           │
│ Scopes: Production, Deploy Previews, Branch deploys│
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ VITE_SUPABASE_ANON_KEY                              │
│ sb_publishable_RtV3uo_NTL5HqtDI1i85Cw_tEnwulUM      │
│ Scopes: Production, Deploy Previews, Branch deploys│
└─────────────────────────────────────────────────────┘
```

## 🎯 Expected Timeline

- **Now:** Build is running (will fail without env vars)
- **+2 min:** Add environment variables
- **+3 min:** Trigger new deploy
- **+6 min:** Build completes successfully
- **+7 min:** Site is live and working! 🚀

## 🔐 Security Note

These environment variables are **safe to use**:
- ✅ `VITE_SUPABASE_URL` - Public URL, safe to expose
- ✅ `VITE_SUPABASE_ANON_KEY` - Public key, safe to expose
- ✅ Protected by Supabase Row Level Security (RLS)
- ✅ No sensitive data exposed

**DO NOT** add:
- ❌ `VITE_API_URL` - Not needed, app uses Supabase directly
- ❌ Service role key - Never expose this!

## 📞 Need Help?

If you're stuck:
1. Check `NETLIFY_DEPLOYMENT_COMPLETE.md` for detailed guide
2. Check Netlify build logs for specific errors
3. Verify environment variables are spelled correctly
4. Make sure you clicked "Create variable" for each one

## 🎉 Success!

Once environment variables are added and site is deployed:
- ✅ Site will be live at your Netlify URL
- ✅ Admin can login and manage students
- ✅ Students can login and change passwords
- ✅ All features working
- ✅ No API connection errors

**Next:** Share your Netlify URL with users! 🚀
