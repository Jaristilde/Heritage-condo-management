# 🚀 Render Deployment Guide

## Current Issue: CORS & Authentication Errors

Your partner is seeing these errors:
- ❌ CORS errors (blocked cross-origin requests)
- ❌ 401 Invalid credentials
- ❌ 403 Forbidden for dashboard

## ✅ Solution: Follow these steps

---

## Step 1: Push Latest Code to GitHub

The latest code with CORS fixes is ready. Just push:

```bash
cd ~/Desktop/Heritage-condo-management
git add -A
git commit -m "Fix CORS for Netlify deployment and add production user seeding"
git push origin main
```

---

## Step 2: Update Render Deployment

### A. Go to Render Dashboard
1. Visit https://dashboard.render.com
2. Find your service: **heritage-condo-management**
3. Click on it

### B. Redeploy with Latest Code
1. Click **Manual Deploy** → **Deploy latest commit**
2. Wait for deployment to finish (2-3 minutes)
3. Check logs for any errors

---

## Step 3: Set Environment Variables on Render

Make sure these environment variables are set in Render:

### Required Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Sets production mode |
| `PORT` | `10000` | Render's required port |
| `DATABASE_URL` | `postgresql://...` | Your Neon database URL |
| `JWT_SECRET` | (your secret key) | For authentication tokens |
| `FRONTEND_URL` | `https://heritage-condo-management-north-miami.netlify.app` | Your Netlify URL |

### How to set them:
1. In Render dashboard, go to your service
2. Click **Environment** tab
3. Add/update variables
4. Click **Save Changes**
5. Render will auto-redeploy

---

## Step 4: Run Production User Seeding

After deployment, you need to seed demo users in production database:

### Option A: Via Render Shell (Recommended)
1. In Render dashboard, click **Shell** tab
2. Run this command:
```bash
npm run seed:production-users
```

### Option B: Locally (if you have prod DB access)
```bash
# Make sure .env has production DATABASE_URL
npm run seed:production-users
```

This creates/updates:
- **board** / board1806
- **management** / management1806
- **owner201** / owner1806

---

## Step 5: Test the Deployment

### Test Login:
1. Go to: https://heritage-condo-management-north-miami.netlify.app
2. Try logging in with:
   - Username: `board`
   - Password: `board1806`
3. Should successfully login and see dashboard

### Check CORS:
- Open browser console (F12)
- Should see NO CORS errors
- API calls should succeed

---

## Common Issues & Fixes

### Issue 1: Still getting CORS errors
**Solution:** Make sure `FRONTEND_URL` environment variable is set in Render to your Netlify URL

### Issue 2: Invalid credentials
**Solution:** Run `npm run seed:production-users` on Render

### Issue 3: 500 Internal Server Error
**Solution:** Check Render logs:
1. Go to Render dashboard
2. Click **Logs** tab
3. Look for error messages
4. Share error with developer

---

## Verify Everything Works

### ✅ Checklist:
- [ ] Render deployed latest code
- [ ] Environment variables set
- [ ] Production users seeded
- [ ] Can login from Netlify URL
- [ ] Dashboard loads without errors
- [ ] No CORS errors in console

---

## Quick Reference

### Your URLs:
- **Frontend (Netlify):** https://heritage-condo-management-north-miami.netlify.app
- **Backend (Render):** https://heritage-condo-management.onrender.com
- **GitHub Repo:** https://github.com/Jaristilde/Heritage-condo-management

### Demo Credentials:
```
Board Member:
  Username: board
  Password: board1806

Management (Jorge):
  Username: management
  Password: management1806

Owner Portal:
  Username: owner201
  Password: owner1806
```

---

## Need Help?

If you still see errors:

1. **Check Render Logs:**
   - Go to Render dashboard → Logs
   - Screenshot any errors
   - Share with developer

2. **Check Browser Console:**
   - Press F12 on Netlify site
   - Go to Console tab
   - Screenshot any errors
   - Share with developer

3. **Verify Environment Variables:**
   - Make sure all variables are set correctly
   - No typos in URLs
   - DATABASE_URL is from Neon production DB

---

## Next Steps After This Works

Once login works, we'll implement:
1. ✅ Email notifications for invoice approvals
2. ✅ Board approval workflow
3. ✅ Payment processing
4. ✅ Bank reconciliation
5. ✅ AI-powered financial insights

**The foundation is solid - just need to get CORS and authentication working! 🚀**
