# Fix CORS Issue - Quick Steps

## The Problem
The Candy Inventory app at https://candy.firefetch.org cannot connect to Appwrite backend because the origin is not registered.

## The Fix (5 minutes)

### 1. Open Appwrite Console
Go to: **https://backend.firefetch.org/console**

### 2. Login
Use your Appwrite admin credentials

### 3. Select Project
Click on: **candy-inventory** (or find project ID: `69373be900166fcb421c`)

### 4. Go to Settings
- Click the **Settings** icon (gear) in the left sidebar

### 5. Open Platforms Tab
- Click on **Platforms** tab

### 6. Add Web Platform
Click **Add Platform** button, then:
- Select **Web App**
- **Name**: `Candy Inventory Production`
- **Hostname**: `candy.firefetch.org` (NO https://, NO trailing slash)
- Click **Next** or **Create**

### 7. (Optional) Add More Platforms
Repeat for:
- Hostname: `localhost` (for local development)
- Hostname: `*.firefetch.org` (for all subdomains)

### 8. Test
1. Open https://candy.firefetch.org
2. Open browser console (F12)
3. CORS errors should be gone
4. App should work!

---

## What You're Adding

You're telling Appwrite: "Allow requests from candy.firefetch.org to access this project's API"

---

## Need More Help?
See: `/home/ubuntu/ai/candy-inventory/CORS-FIX-GUIDE.md`
