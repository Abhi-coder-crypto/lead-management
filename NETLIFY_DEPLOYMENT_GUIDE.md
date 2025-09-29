# Netlify Deployment Guide for LeadFlow

## Overview

This guide explains how to deploy LeadFlow to Netlify. Since LeadFlow is a full-stack application, you'll deploy the frontend to Netlify and the backend separately.

## Prerequisites

1. Netlify account
2. Separate backend deployment (Heroku, Railway, DigitalOcean, etc.)
3. MongoDB database (MongoDB Atlas recommended)

## Step 1: Deploy the Backend

First, deploy your backend server to a hosting service:

### Recommended Backend Hosting Options:
- **Heroku**: Free tier available, easy setup
- **Railway**: Modern deployment platform
- **DigitalOcean App Platform**: Reliable and affordable
- **Render**: Good free tier

### Backend Environment Variables:
Set these on your backend hosting platform:
```
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key-for-jwt
NODE_ENV=production
PORT=5000
```

## Step 2: Deploy Frontend to Netlify

### Method 1: Git Repository (Recommended)
1. Push your code to GitHub/GitLab
2. Connect your repository to Netlify
3. Configure build settings:
   - **Build command**: `npm run build:netlify`
   - **Publish directory**: `dist/public`

### Method 2: Manual Upload
1. Run `npm run build:netlify` locally
2. Upload the `dist/public` folder to Netlify

## Step 3: Configure Environment Variables

In your Netlify dashboard, go to **Site settings > Environment variables** and add:

```
VITE_API_URL=https://your-backend-deployment.herokuapp.com
```

**Important**: Replace `your-backend-deployment.herokuapp.com` with your actual backend URL.

## Step 4: Configure Redirects (Optional)

The `netlify.toml` file includes:
- SPA routing support (redirects all routes to index.html)
- Security headers
- Static asset caching

## Step 5: Test Your Deployment

1. Visit your Netlify URL
2. Try to register/login
3. Test creating leads and other features

## Troubleshooting

### Build Fails with Dependency Conflicts
- The build uses `--legacy-peer-deps` to handle Vite version conflicts
- If issues persist, try updating package dependencies

### API Calls Fail
- Verify `VITE_API_URL` is set correctly in Netlify
- Ensure your backend is deployed and accessible
- Check browser console for specific errors

### CORS Issues
- Make sure your backend allows requests from your Netlify domain
- Update CORS settings in your Express server

## Development vs Production

- **Development**: API calls go to `localhost:5000` (relative URLs)
- **Production**: API calls go to `VITE_API_URL` environment variable

The app automatically detects the environment and uses the appropriate API URL.