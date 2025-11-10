# SPA Routing 404 Fix

## Problem
When deploying a React SPA (Single Page Application) and refreshing the page or directly accessing a route (like `/dashboard`), you get a **404 Not Found** error. This happens because the server tries to find a file at that path, but React Router handles routing on the client side.

## Solution
We've converted the frontend from a static site to a Node.js web service that serves the built files with a fallback to `index.html` for all routes.

## Changes Made

### 1. Created `frontend/server.js`
- Simple Express server that serves static files from the `dist` directory
- Catch-all route (`*`) that serves `index.html` for any route
- This allows React Router to handle routing on the client side

### 2. Updated `frontend/package.json`
- Added `express` as a dependency
- Added `start` script: `node server.js`

### 3. Updated `render.yaml`
- Changed from `env: static` to `env: node`
- Added `startCommand: cd frontend && npm start`
- Removed `staticPublishPath` (not needed for web services)
- PORT is automatically provided by Render, no need to set it

## How It Works

1. **Build Phase**: `npm run build` creates the production build in the `dist` folder
2. **Start Phase**: `npm start` runs the Express server
3. **Static Files**: Express serves files from the `dist` directory
4. **Fallback**: Any route that doesn't match a file serves `index.html`
5. **React Router**: Takes over and handles the routing on the client side

## Deployment Steps

1. **Commit and push** the changes:
   ```bash
   git add frontend/server.js frontend/package.json render.yaml
   git commit -m "Fix SPA routing 404 error by adding Express server"
   git push
   ```

2. **Update Render Service** (if needed):
   - If your Render service is still configured as a static site, you may need to:
     - Delete the old static site service
     - Create a new web service
     - Or update the existing service settings:
       - Change type from "Static Site" to "Web Service"
       - Set Build Command: `cd frontend && npm install && npm run build`
       - Set Start Command: `cd frontend && npm start`
       - Set Root Directory: `frontend` (if deploying from repo root)

3. **Environment Variables** (set in Render dashboard):
   - `VITE_API_URL` = `https://crm-system-73ir.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://crm-system-73ir.onrender.com`
   - `NODE_ENV` = `production` (optional, Render may set this automatically)

4. **Wait for deployment** - Render will automatically redeploy

## Testing

After deployment:
1. Navigate to your frontend URL
2. Click on different routes (Dashboard, Leads, etc.)
3. Refresh the page on any route - it should work without 404 errors
4. Try directly accessing a route like `/dashboard` - it should load correctly

## Alternative Solutions (if needed)

If you prefer to keep it as a static site:

### Option 1: Use HashRouter (not recommended)
Change `BrowserRouter` to `HashRouter` in `frontend/src/main.jsx`:
```javascript
import { HashRouter } from 'react-router-dom';
```
This adds `#` to URLs (e.g., `https://yourapp.com/#/dashboard`)

### Option 2: Configure Render Redirects (if supported)
Some hosting providers support redirect rules. Check Render's documentation for static site redirect configuration.

## Notes

- The Express server is lightweight and only serves static files
- This solution works for all React Router routes
- No changes needed to your React code
- The server automatically handles all routes and serves `index.html` for client-side routing

