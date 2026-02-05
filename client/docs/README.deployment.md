# Deployment Guide - Resolver Frontend

**Status:** ✅ Production Ready  
**Updated:** February 3, 2026

> **Note:** For detailed Vercel deployment checklist, see `VERCEL_DEPLOYMENT.md`

## Quick Deploy

### Prerequisites
- Vercel account connected to GitHub repository
- Backend deployed on Render at `https://django-resolver.onrender.com`

### One-Command Deploy
```bash
# Deploy to Vercel
npm run build && vercel --prod

# Or push to main branch for auto-deploy
git add .
git commit -m "Deploy to production"
git push origin main
```

### Environment Variables
Required for production:
```bash
VITE_API_URL=https://django-resolver.onrender.com/api
```

## Production Architecture

```
Frontend (Vercel)     Backend (Render)      Database
     ↓                       ↓                  ↓
React + Vite    ←→    Django REST API    ←→  PostgreSQL
TypeScript           Python 3.11+           Cloud Database
TailwindCSS          JWT Auth
```

## Performance Optimizations Active

### **Pagination System**
- ✅ Backend supports flexible page sizes (up to 500)
- ✅ Client-side pagination for better UX
- ✅ SharedDataContext eliminates duplicate API calls

### **Build Optimizations**
- ✅ TypeScript compilation with strict checking
- ✅ Vite bundling with code splitting
- ✅ TailwindCSS purging for minimal CSS

### **API Efficiency** 
- ✅ ~65% fewer reference data calls
- ✅ Optimized ticket fetching per role
- ✅ Smart caching via SharedDataContext

---

For detailed deployment steps, troubleshooting, and configuration options, see `VERCEL_DEPLOYMENT.md`.

### Step 2: Import Project to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the `client` directory as the root

### Step 3: Configure Build Settings
Vercel should auto-detect these settings, but verify:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 4: Add Environment Variables
In Vercel project settings → Environment Variables, add:

```
VITE_ENV=production
VITE_API_URL_DEV=http://localhost:8000/api
VITE_API_URL_PROD=https://django-resolver.onrender.com/api
```

### Step 5: Deploy
Click "Deploy" and wait for the build to complete.

### Step 6: Update Backend CORS
After deployment, update your Django backend's CORS settings to include your Vercel domain:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://your-project.vercel.app",  # Add your Vercel domain
]
```

Or set this environment variable on Render:
```
ALLOWED_ORIGINS=http://localhost:5173,https://your-project.vercel.app
```

## Local Development

### Environment Switching

**Development (localhost backend):**
```env
VITE_ENV=development
```

**Production (Render backend):**
```env
VITE_ENV=production
```

### Run Locally
```bash
npm install
npm run dev
```

### Build Locally
```bash
npm run build
npm run preview
```

## Troubleshooting

### CORS Issues
- Ensure your Vercel domain is added to Django's `CORS_ALLOWED_ORIGINS`
- Check browser console for specific CORS errors
- Verify backend is returning proper CORS headers

### API Connection Issues
- Verify environment variables are set in Vercel dashboard
- Check that `VITE_ENV=production` is set
- Ensure backend is running on Render

### Build Failures
- Check TypeScript errors: `npm run build` locally first
- Verify all dependencies are in `package.json`
- Check Vercel build logs for specific errors
