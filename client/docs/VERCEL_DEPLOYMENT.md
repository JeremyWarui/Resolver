# ✅ Vercel Deployment Checklist

## Pre-Deployment
- [x] Production build passes (`npm run build`)
- [x] Environment configuration set up (`.env`, `.env.production`)
- [x] Backend API accessible at `https://django-resolver.onrender.com/api`
- [x] CORS configured on backend for `localhost:5173`
- [x] `vercel.json` configured for SPA routing

## Deployment Steps

### 1. Push to GitHub (if not already done)
```bash
git init  # if new repo
git add .
git commit -m "Ready for Vercel deployment"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Import to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. **Important:** Set Root Directory to `client` (if monorepo) or `.` (if this is root)
4. Framework: Vite (auto-detected)

### 3. Configure Environment Variables in Vercel
Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_ENV` | `production` | Production |
| `VITE_API_URL_DEV` | `http://localhost:8000/api` | All |
| `VITE_API_URL_PROD` | `https://django-resolver.onrender.com/api` | Production |

### 4. Deploy
Click "Deploy" button in Vercel

### 5. Post-Deployment - Update Backend CORS
After getting your Vercel URL (e.g., `https://resolver-xyz.vercel.app`), update Django backend:

**Option A: Update `settings.py`**
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://resolver-xyz.vercel.app",  # Your actual Vercel URL
]
```

**Option B: Use Environment Variable on Render**
Add to Render environment variables:
```
ALLOWED_ORIGINS=http://localhost:5173,https://resolver-xyz.vercel.app
```

Then update `settings.py` to use it:
```python
CORS_ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', '').split(',')
```

### 6. Test Deployment
- [ ] Visit your Vercel URL
- [ ] Check browser console for environment logs (`🔧 Environment: production`)
- [ ] Test login functionality
- [ ] Verify data loads from Neon database
- [ ] Test ticket creation/editing
- [ ] Check all role dashboards (Admin, User, Technician)

## Troubleshooting

### Issue: CORS Error
**Symptom:** `Access-Control-Allow-Origin` error in browser console

**Solution:**
1. Check your Vercel domain is in backend's `CORS_ALLOWED_ORIGINS`
2. Redeploy backend on Render after CORS update
3. Hard refresh browser (Ctrl+Shift+R)

### Issue: API Connection Failed
**Symptom:** Network errors, data not loading

**Solution:**
1. Verify environment variables in Vercel dashboard
2. Ensure `VITE_ENV=production` is set
3. Check Render backend is running (not sleeping)

### Issue: Build Failed on Vercel
**Symptom:** Deployment fails during build

**Solution:**
1. Test build locally: `npm run build`
2. Check Vercel build logs for specific error
3. Verify all dependencies are in `package.json`
4. Ensure Node version compatibility

### Issue: Routes Return 404
**Symptom:** Direct URL navigation shows 404

**Solution:**
- Verify `vercel.json` exists with SPA rewrites
- Check Vercel routing configuration

## Current Configuration Summary

### Frontend (Vercel)
- **URL:** `https://your-project.vercel.app` (after deployment)
- **Environment:** Production
- **API URL:** `https://django-resolver.onrender.com/api`

### Backend (Render)
- **URL:** `https://django-resolver.onrender.com`
- **Database:** Neon PostgreSQL
- **Status:** ✅ Running (verified)

### Environment Switching (Local Development)
Edit `.env` file:
- **Development:** `VITE_ENV=development` → connects to `localhost:8000`
- **Production:** `VITE_ENV=production` → connects to Render backend

## Commands Reference
```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel (via CLI)
npm install -g vercel
vercel --prod
```

## Next Steps After Deployment
1. [ ] Update README.md with live Vercel URL
2. [ ] Set up custom domain (optional)
3. [ ] Configure Vercel Analytics (optional)
4. [ ] Set up deployment previews for PRs
5. [ ] Add status badge to README
