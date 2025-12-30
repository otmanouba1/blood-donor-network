# Vercel Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project root**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub Integration

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub: `otmanouba1/blood-donor-network`

2. **Configure Build Settings**
   - Framework Preset: `Other`
   - Root Directory: `./`
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`

3. **Environment Variables**
   Add these in Vercel dashboard:
   ```
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=production
   VITE_API_URL=https://your-vercel-app.vercel.app/api
   ```

### Backend Deployment (Separate)

For the backend API, deploy to:
- **Railway**: Connect GitHub repo, auto-deploy backend folder
- **Render**: Connect GitHub repo, set build command to `cd backend && npm install`
- **Heroku**: Use git subtree to push backend folder

### Environment Setup

1. **MongoDB Atlas** (Required)
   - Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
   - Get connection string
   - Add to MONGO_URI environment variable

2. **Update API URL**
   - Set VITE_API_URL to your backend deployment URL
   - Format: `https://your-backend-url.com/api`

### Post-Deployment

1. **Seed Admin Account**
   ```bash
   # Run this once after backend is deployed
   node backend/seedAdmin.js
   ```

2. **Test Login**
   - Email: `atmane@admin.com`
   - Password: `atmane@admin`

## Troubleshooting

- **Build Errors**: Check Node.js version (use 18.x)
- **API Errors**: Verify CORS settings and environment variables
- **Database Issues**: Ensure MongoDB Atlas IP whitelist includes 0.0.0.0/0