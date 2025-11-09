# Render Deployment Guide

## Frontend Deployment on Render

### Option 1: Using Render Dashboard (Recommended)

1. **Create a new Static Site** in Render dashboard
2. **Connect your GitHub repository**
3. **Configure the following settings:**
   - **Name**: `crm-frontend` (or any name you prefer)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Node Version**: `18` or `22` (check your package.json)

4. **Add Environment Variables** in Render dashboard:
   - `VITE_API_URL` = `https://crm-system-73ir.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://crm-system-73ir.onrender.com`

5. **Deploy**

### Option 2: Using render.yaml (If deploying from root)

If you want to deploy from the repository root, you can use the `render.yaml` file. However, you'll need to:

1. Set the **Root Directory** to `frontend` in Render dashboard, OR
2. Update the render.yaml to specify the correct paths

### Important Notes:

- The build command must be `npm run build` (NOT `npm install`)
- The publish directory must be `dist` (this is where Vite outputs the built files)
- Environment variables must be set in Render dashboard for the build to work correctly
- After deployment, your frontend will be available at a Render URL (e.g., `https://crm-frontend.onrender.com`)

### Troubleshooting:

- **"Publish directory dist does not exist"**: Make sure the build command is `npm run build` and not `npm install`
- **Build fails**: Check that all environment variables are set correctly
- **API calls not working**: Verify that `VITE_API_URL` is set correctly in Render environment variables

