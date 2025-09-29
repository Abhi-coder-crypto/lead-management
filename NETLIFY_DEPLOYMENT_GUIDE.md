# Netlify Deployment Guide for LeadFlow

## Overview

LeadFlow is now configured as a complete serverless application that can be deployed entirely to Netlify. The backend has been converted to Netlify Functions, allowing you to deploy both frontend and backend together on a single platform.

## Prerequisites

1. Netlify account
2. MongoDB database (MongoDB Atlas recommended)

## Deployment Steps

### Method 1: Git Repository (Recommended)
1. Push your code to GitHub/GitLab
2. Connect your repository to Netlify
3. Netlify will automatically detect the configuration from `netlify.toml`

### Method 2: Manual Upload
1. Run `npm run build:netlify` locally
2. Upload the entire project folder to Netlify (not just dist/public)

## Configure Environment Variables

In your Netlify dashboard, go to **Site settings > Environment variables** and add:

```
MONGODB_URI=your-mongodb-connection-string
```

**Optional** (if you want to use a custom JWT secret):
```
JWT_SECRET=your-custom-secret-key
```

## How It Works

The application now uses **Netlify Functions** for the backend:
- All API endpoints (`/api/*`) are handled by serverless functions
- Functions are automatically deployed alongside your frontend
- No separate backend deployment needed

## Test Your Deployment

1. Visit your Netlify URL
2. Try to register/login
3. Test creating leads and other features
4. Check that all analytics and export features work

## Troubleshooting

### Build Fails with Dependency Conflicts
- The build uses `--legacy-peer-deps` to handle Vite version conflicts
- If issues persist, clear node_modules and reinstall

### Function Timeout Issues
- Netlify Functions have a 10-second timeout limit
- MongoDB queries should be optimized for serverless environments

### Environment Variables Not Working
- Make sure `MONGODB_URI` is set in Netlify dashboard
- Check that the MongoDB URI includes the database name
- Verify network access from Netlify (0.0.0.0/0 in MongoDB Atlas)

## Architecture Benefits

- **Simplified Deployment**: Everything deploys to one platform
- **Automatic Scaling**: Functions scale with traffic
- **Cost Effective**: Only pay for function execution time
- **Easy Maintenance**: No server infrastructure to manage

## Development vs Production

- **Development**: Runs full Express server locally
- **Production**: Uses Netlify Functions for API endpoints

The same frontend code works in both environments without changes.