# CORS Configuration Fix

## Problem
The backend was blocking requests from `http://localhost:3000` because it was only configured to allow requests from the production frontend URL (`https://crm-system-1-ii1t.onrender.com`).

## Solution
Updated the backend CORS configuration to allow multiple origins:
- `http://localhost:3000` (local development)
- `http://localhost:5173` (Vite default port)
- `http://127.0.0.1:3000` (alternative localhost)
- `http://127.0.0.1:5173` (alternative localhost)
- Production frontend URL from `FRONTEND_URL` environment variable
- Additional URLs from `FRONTEND_URLS` environment variable (comma-separated)

## Backend Environment Variables (Render)

In your Render backend service, make sure to set the following environment variables:

### Required:
- `FRONTEND_URL` - Your production frontend URL (e.g., `https://crm-system-1-ii1t.onrender.com`)

### Optional:
- `FRONTEND_URLS` - Additional frontend URLs (comma-separated) if you have multiple frontend deployments
  - Example: `https://crm-frontend.onrender.com,https://crm-staging.onrender.com`

## How to Update Render Environment Variables

1. Go to your Render dashboard
2. Select your backend service (the one running at `https://crm-system-73ir.onrender.com`)
3. Go to the "Environment" tab
4. Add or update the `FRONTEND_URL` variable:
   - Key: `FRONTEND_URL`
   - Value: Your production frontend URL (e.g., `https://crm-system-1-ii1t.onrender.com`)
5. Save the changes
6. Render will automatically redeploy your backend

## Testing

After updating the environment variables and redeploying:

1. **Local Development**: You can now test locally at `http://localhost:3000` against the production backend
2. **Production**: Your production frontend will continue to work

## Important Notes

- The backend now automatically allows `localhost` origins for local development
- Make sure to set `FRONTEND_URL` in Render to your actual production frontend URL
- The backend will log all allowed CORS origins on startup for debugging
- If you see CORS errors, check the backend logs to see which origins are allowed

## Next Steps

1. **Commit and push** the updated `backend/server.js` to your repository
2. **Update Render environment variables** as described above
3. **Wait for Render to redeploy** your backend service
4. **Test** your local frontend against the production backend

