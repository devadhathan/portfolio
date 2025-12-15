# Vercel KV Setup Guide

This project uses Vercel KV for persistent IP-based prompt limiting. Follow these steps to set it up:

## Step 1: Create a Vercel KV Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to the **Storage** tab
4. Click **Create Database**
5. Select **KV** (Redis)
6. Choose a name for your database (e.g., "portfolio-kv")
7. Select a region (choose the closest to your users)
8. Click **Create**

## Step 2: Link KV to Your Project

1. After creating the KV database, you'll see connection details
2. Vercel will automatically add the following environment variables to your project:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN` (optional)

## Step 3: Verify Setup

The code automatically detects if KV is available by checking for these environment variables. If KV is not set up, it will fall back to in-memory storage (which resets on serverless cold starts).

## How It Works

- **With KV**: Prompt counts persist across serverless function restarts
- **Without KV**: Prompt counts reset when serverless functions restart (fallback mode)

## Testing

After deployment, the system will automatically use KV if the environment variables are present. No code changes needed!

## Notes

- KV is free for up to 256MB storage
- Perfect for tracking IP-based limits
- Data persists across deployments and serverless cold starts


















