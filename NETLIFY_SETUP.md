# Netlify Environment Variables Setup

## Critical Fix: API Connection Issue

If you're seeing a blank page when clicking on invoices or getting React error #301, it's because the frontend doesn't know where the backend API is located.

## Step-by-Step Fix for Netlify

### 1. Go to Netlify Dashboard
1. Open https://app.netlify.com
2. Click on your site: **heritage-condo-management-north-miami**
3. Click **Site settings** in the top navigation

### 2. Add Environment Variable
1. In the left sidebar, click **Environment variables** (or **Build & deploy** → **Environment**)
2. Click **Add a variable** or **New variable**
3. Add the following:

   **Key**: `VITE_API_URL`

   **Value**: `https://heritage-condo-management.onrender.com`

4. Click **Save**

### 3. Trigger a New Deploy
1. Go to **Deploys** in the top navigation
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the deploy to finish (usually 1-2 minutes)

### 4. Clear Browser Cache and Test
1. Open your site: https://heritage-condo-management-north-miami.netlify.app
2. **Clear browser cache**:
   - Chrome/Edge: Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Select "Cookies and other site data" and "Cached images and files"
   - Click "Clear data"
3. **Clear localStorage**:
   - Open Developer Tools (F12)
   - Go to **Application** tab → **Local Storage**
   - Right-click on your site → **Clear**
4. Refresh the page (F5 or Cmd+R)
5. Log in again
6. Click on **Invoices** - it should work now!

## Why This Happens

The frontend (Netlify) needs to know where the backend (Render) is hosted. Without `VITE_API_URL`, it defaults to `http://localhost:5001`, which doesn't exist in production.

When you added SMTP environment variables to Render, it triggered a redeploy of the backend, but the frontend was still trying to connect to the wrong URL.

## All Required Netlify Environment Variables

For reference, here are all the environment variables that should be set in Netlify:

| Variable | Value | Required? |
|----------|-------|-----------|
| `VITE_API_URL` | `https://heritage-condo-management.onrender.com` | ✅ **CRITICAL** |
| `NODE_ENV` | `production` | Recommended |

That's it! Vite environment variables must be prefixed with `VITE_` to be accessible in the frontend.

## Troubleshooting

### Still seeing blank page after deploy?
1. Check browser console for errors (F12 → Console)
2. Verify the deploy completed successfully in Netlify
3. Make sure you cleared browser cache AND localStorage
4. Try in an incognito/private window

### Getting "Invalid credentials" when logging in?
This means your login credentials are incorrect. Try:
- Username: `joane` (or your username)
- Check that you're using the correct password
- If you forgot your password, you'll need to reset it in the database

### Still getting React error #301?
This usually means:
1. The `VITE_API_URL` environment variable is not set in Netlify
2. The backend (Render) is not running
3. There's a CORS issue (but we already have CORS configured)

Check that your Render backend is running: https://heritage-condo-management.onrender.com/api

## Need Help?

If you're still having issues after following these steps, check:
1. Netlify deploy logs for build errors
2. Render deploy logs for backend errors
3. Browser console for frontend errors (F12 → Console)
