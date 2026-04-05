# Vercel Deployment Guide

## Quick Deploy Steps

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your `campus-erp` repository
   - Click "Import"

3. **Configure Project** (IMPORTANT!)
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` ← CRITICAL: Set this to "frontend"
   - **Build Command**: Leave empty (uses package.json)
   - **Output Directory**: Leave empty (uses "dist")
   - **Install Command**: Leave empty (uses npm install)

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   VITE_SUPABASE_URL=https://ojdxczneqaxbbvjdehro.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at `https://your-project.vercel.app`

## Configuration Files

No `vercel.json` is needed. Configure everything in the Vercel dashboard:
- Set Root Directory to `frontend`
- Vercel will auto-detect Vite and use the correct build settings

## Troubleshooting

### Permission Denied Error
✅ **FIXED** - Removed root `package.json` that was causing conflicts

### "No such file or directory" Error
✅ **FIXED** - Set Root Directory to `frontend` in Vercel dashboard settings

### Build Fails
- Check that environment variables are set correctly
- Ensure Supabase credentials are valid
- Check build logs for specific errors

### 404 on Routes
- Vercel automatically handles SPA routing
- The `_redirects` file in `frontend/public` handles fallback

## Auto-Deploy

Vercel will automatically deploy when you push to the `master` branch on GitHub.

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
