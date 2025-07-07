# 🚀 ReGenAI Frontend Deployment Guide

## Deploy to Render (Recommended)

### Step 1: Prepare for Deployment
The frontend is already configured for Render deployment with:
- ✅ `render.yaml` configuration
- ✅ `_redirects` file for client-side routing
- ✅ API service that works with both local and production backends
- ✅ Updated `package.json` for production

### Step 2: Deploy to Render

1. **Go to [Render.com](https://render.com)** and sign up/login
2. **Click "New +"** and select "Static Site"
3. **Connect your GitHub repository** (you'll need to push this code to GitHub first)
4. **Configure the deployment:**
   - **Name**: `regen-ai-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `REACT_APP_API_URL`: `https://your-backend-url.onrender.com` (update this later)

### Step 3: Update API URL
Once deployed, update the `REACT_APP_API_URL` environment variable in Render to point to your backend.

### Alternative: Deploy Backend to Render Too

If you want to deploy the backend as well:

1. **Create a new Web Service** on Render
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`
4. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`

### Local Development vs Production

- **Local**: Frontend connects to `http://localhost:3000`
- **Production**: Frontend connects to your Render backend URL

## Features Available in Demo

✅ **Complete UI with all pages accessible**
✅ **Dark/Light mode toggle**
✅ **Responsive design**
✅ **All navigation items working**
✅ **Vector database dashboard**
✅ **AI safety monitoring**
✅ **Lead management interface**
✅ **Campaign management**
✅ **Analytics dashboards**
✅ **Persona training interface**

## Demo URL
Once deployed, your partner can access the demo at:
`https://your-app-name.onrender.com`

## Notes for Demo

1. **Backend Connection**: The frontend will work without a backend for UI demonstration
2. **Mock Data**: All pages use mock data for demonstration
3. **Real Backend**: Connect to your local backend or deploy backend to Render for full functionality

## Quick Deploy Commands

```bash
# Build for production
npm run build

# Test production build locally
npx serve -s build -l 3001
``` 