# Vercel Deployment Guide

## Quick Deploy Steps

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your `campus-erp` repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Other (or leave as detected)
   - **Root Directory**: Leave as `.` (root)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `cd frontend && npm install`

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

The `vercel.json` file is already configured with:
- Correct build command pointing to frontend folder
- Output directory set to `frontend/dist`
- Install command for frontend dependencies

## Troubleshooting

### Permission Denied Error
✅ **FIXED** - Removed root `package.json` that was causing conflicts

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
