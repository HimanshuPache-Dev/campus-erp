# 🚀 Deploy to Netlify - Campus ERP Frontend

## Complete Guide to Deploy Your Frontend on Netlify

---

## 📋 Prerequisites

- GitHub repository (✅ Already done!)
- Netlify account (free)
- Supabase project with database setup

---

## 🎯 Deployment Steps

### Step 1: Create Netlify Account

1. Go to: https://www.netlify.com/
2. Click **"Sign up"**
3. Choose **"Sign up with GitHub"** (recommended)
4. Authorize Netlify to access your GitHub

---

### Step 2: Create New Site

1. After login, click **"Add new site"**
2. Select **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify (if asked)
5. Search for: **campus-erp**
6. Click on your repository

---

### Step 3: Configure Build Settings

**Site settings:**
- **Branch to deploy**: `master` (or `main`)
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`

Click **"Show advanced"** to add environment variables.

---

### Step 4: Add Environment Variables

Click **"Add environment variable"** and add these:

**Variable 1:**
- **Key**: `VITE_SUPABASE_URL`
- **Value**: Your Supabase URL (e.g., `https://xxxxx.supabase.co`)

**Variable 2:**
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: Your Supabase anon key

**Where to find these:**
1. Go to Supabase Dashboard
2. Select your project
3. Click Settings → API
4. Copy "Project URL" and "anon public" key

---

### Step 5: Deploy!

1. Click **"Deploy campus-erp"** button
2. Wait 2-3 minutes for build to complete
3. You'll see build logs in real-time

**Build process:**
- Installing dependencies
- Building with Vite
- Optimizing assets
- Deploying to CDN

---

### Step 6: Access Your Live Site

After successful deployment:

1. You'll get a URL like: `https://random-name-123456.netlify.app`
2. Click the URL to open your live site
3. Test the login page

**Test with:**
- Admin: `admin@campus.com` / `admin123`
- Faculty: `dr.patil@campus.com` / `faculty123`
- Student: `rahul.sharma@campus.edu` / `student123`

---

## 🎨 Customize Your Site URL

### Change Site Name

1. Go to **Site settings**
2. Click **"Change site name"**
3. Enter new name (e.g., `my-campus-erp`)
4. Your URL becomes: `https://my-campus-erp.netlify.app`

### Add Custom Domain (Optional)

1. Go to **Domain settings**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `campus.yourdomain.com`)
4. Follow DNS configuration instructions

---

## 🔧 Build Configuration

Your `netlify.toml` file is already configured with:

```toml
[build]
  base = "frontend/"
  publish = "dist/"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This ensures:
- ✅ Correct build directory
- ✅ Client-side routing works
- ✅ All routes redirect to index.html

---

## 🐛 Troubleshooting

### Build Fails with "Command not found"

**Solution:**
- Check "Base directory" is set to `frontend`
- Verify "Build command" is `npm run build`

### Build Fails with "Module not found"

**Solution:**
- Check all dependencies are in `package.json`
- Try clearing cache: Site settings → Build & deploy → Clear cache

### Site Loads but Shows Errors

**Solution:**
- Check environment variables are set correctly
- Verify Supabase URL and keys
- Check browser console for errors

### Routes Don't Work (404 errors)

**Solution:**
- Verify `netlify.toml` exists in frontend folder
- Check redirects configuration
- Redeploy the site

### Environment Variables Not Working

**Solution:**
- Must start with `VITE_` prefix
- Redeploy after adding variables
- Check spelling and values

---

## 🔄 Automatic Deployments

### Enable Continuous Deployment

Netlify automatically deploys when you push to GitHub!

**How it works:**
1. You make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update frontend"
   git push origin master
   ```
3. Netlify detects the push
4. Automatically builds and deploys
5. Live site updates in 2-3 minutes

### Deploy Previews

For branches other than master:
- Netlify creates preview deployments
- Each branch gets its own URL
- Perfect for testing before merging

---

## 📊 Netlify Features You Get

### Free Plan Includes:
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Continuous deployment
- ✅ Deploy previews
- ✅ Custom domain support
- ✅ Form handling
- ✅ Analytics (basic)

### Performance Features:
- ✅ Global CDN
- ✅ Automatic asset optimization
- ✅ Instant cache invalidation
- ✅ HTTP/2 support
- ✅ Brotli compression

---

## 🔐 Security Features

### Automatic HTTPS
- Free SSL certificate
- Automatic renewal
- Force HTTPS redirect

### Security Headers
Already configured in `netlify.toml`:
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Referrer-Policy

---

## 📈 Monitoring Your Site

### Build Status
- View build logs
- See deployment history
- Check build time

### Analytics (Optional)
1. Go to Site settings → Analytics
2. Enable Netlify Analytics ($9/month)
3. View traffic, page views, bandwidth

### Functions (If Needed Later)
- Netlify supports serverless functions
- Can replace some backend endpoints
- Located in `netlify/functions/`

---

## 🌐 What About the Backend?

### Option 1: Deploy Backend Separately

**Railway (Recommended):**
1. Go to: https://railway.app
2. Import GitHub repo
3. Select `backend` folder
4. Add environment variables
5. Deploy

**Render:**
1. Go to: https://render.com
2. New Web Service
3. Connect GitHub repo
4. Configure backend settings
5. Deploy

### Option 2: Use Supabase Directly

Your frontend already uses Supabase directly for most operations!
- Authentication
- Database queries
- Real-time updates

Backend is optional for:
- Complex business logic
- Custom API endpoints
- File uploads
- Email notifications

---

## 📝 Deployment Checklist

Before deploying:
- [ ] Supabase database is set up
- [ ] Environment variables are ready
- [ ] Code is pushed to GitHub
- [ ] `netlify.toml` exists in frontend folder
- [ ] Build works locally (`npm run build`)

After deploying:
- [ ] Site loads without errors
- [ ] Can login successfully
- [ ] All pages are accessible
- [ ] Data loads from Supabase
- [ ] No console errors

---

## 🎯 Quick Deploy Commands

### Local Build Test
```bash
cd frontend
npm run build
npm run preview
```

### Push to GitHub (Triggers Deploy)
```bash
git add .
git commit -m "Deploy to Netlify"
git push origin master
```

### Manual Deploy via Netlify CLI (Optional)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd frontend
netlify deploy --prod
```

---

## 🔗 Useful Links

- **Netlify Dashboard**: https://app.netlify.com/
- **Netlify Docs**: https://docs.netlify.com/
- **Your Repository**: https://github.com/HimanshuPache-Dev/campus-erp
- **Supabase Dashboard**: https://supabase.com/dashboard

---

## 💡 Pro Tips

### 1. Use Deploy Previews
- Create a new branch for features
- Push to GitHub
- Get preview URL before merging

### 2. Environment Variables
- Use different Supabase projects for staging/production
- Keep production keys secure
- Never commit `.env` files

### 3. Performance
- Netlify automatically optimizes images
- Uses global CDN for fast loading
- Caches static assets

### 4. Custom Domain
- Add your own domain for professional look
- Free SSL included
- Easy DNS configuration

---

## 🎉 Success!

After deployment, you'll have:
- ✅ Live website on Netlify
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Continuous deployment
- ✅ Professional URL

**Your Campus ERP is now live on the internet!** 🌐

---

## 📞 Support

### Netlify Issues
- Check build logs in Netlify dashboard
- Visit: https://answers.netlify.com/

### Application Issues
- Check browser console
- Verify Supabase connection
- Review environment variables

---

## 🔄 Update Your Deployment

To update your live site:

```bash
# 1. Make changes
# 2. Test locally
npm run dev

# 3. Commit and push
git add .
git commit -m "Update feature"
git push origin master

# 4. Netlify auto-deploys!
# Check dashboard for build status
```

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: March 15, 2026  
**Status**: ✅ Ready to Deploy

