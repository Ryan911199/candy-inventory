# CORS Fix Guide for Candy Inventory

## Problem
The Candy Inventory app cannot connect to the Appwrite backend due to CORS (Cross-Origin Resource Sharing) errors. Browsers block requests from `candy.firefetch.org` to `backend.firefetch.org` because the origin is not registered in Appwrite.

## Solution
Add web platforms to the Appwrite project to allow requests from the app's domains.

---

## Manual Fix (REQUIRED)

Since the API key doesn't have permissions to manage platforms programmatically, you need to manually add the platforms through the Appwrite Console.

### Step 1: Login to Appwrite Console
1. Open: https://backend.firefetch.org/console
2. Login with your admin credentials

### Step 2: Select Project
1. Navigate to the **candy-inventory** project
2. Project ID: `69373be900166fcb421c`

### Step 3: Add Web Platforms
1. Go to **Settings** (gear icon in sidebar)
2. Click on **Platforms** tab
3. Click **Add Platform** button
4. Select **Web App**
5. Fill in the form:
   - **Name**: `Candy Inventory Production`
   - **Hostname**: `candy.firefetch.org`
6. Click **Next** or **Save**

### Step 4: Add Additional Platforms (Optional but Recommended)
Repeat step 3 for these additional hostnames:

**For localhost development:**
- **Name**: `Candy Inventory Local`
- **Hostname**: `localhost`

**For wildcard subdomain support:**
- **Name**: `All Firefetch Subdomains`
- **Hostname**: `*.firefetch.org`

---

## Verification

After adding the platforms:

### 1. Check the App
1. Open https://candy.firefetch.org in your browser
2. Open browser DevTools (F12)
3. Go to the Console tab
4. Look for CORS errors - they should be gone
5. The app should successfully connect to Appwrite

### 2. Test Functionality
1. Enter a store number (e.g., `1234`)
2. The app should create/load the store and display locations
3. Try adding inventory items - they should save to Appwrite

---

## Technical Details

### What are Web Platforms?
Web platforms in Appwrite define which hostnames are allowed to make requests to your backend. This is a security feature that prevents unauthorized websites from accessing your API.

### Why Does This Happen?
When a browser makes a request from `candy.firefetch.org` to `backend.firefetch.org`, it performs a CORS check. The browser asks the backend: "Is candy.firefetch.org allowed to make requests?" If the hostname isn't registered as a platform, the backend says "no" and the browser blocks the request.

### What Gets Registered?
- The **hostname** (without protocol): `candy.firefetch.org`
- NOT the full URL: ~~`https://candy.firefetch.org`~~
- You can use wildcards: `*.firefetch.org` (allows all subdomains)

---

## Troubleshooting

### Error: "The current user is not authorized..."
- The API key in the project doesn't have Console-level permissions
- This is normal - platform management requires Console access
- Use the manual fix above

### Still Getting CORS Errors After Adding Platform?
1. Clear browser cache and cookies
2. Do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check that the hostname matches exactly (no http://, no trailing slash)
4. Verify you're accessing the app from the correct URL
5. Check browser console for the exact error message

### App Works on Localhost but Not on candy.firefetch.org?
- Make sure you added `candy.firefetch.org` as a platform (not just `localhost`)
- Check that the Traefik routing is working correctly
- Verify the app is actually being served from candy.firefetch.org

---

## Alternative: API Fix (When You Have Console API Access)

If you later get a Console API key with proper permissions, you can use this curl command:

```bash
# Add candy.firefetch.org platform
curl -X POST 'https://backend.firefetch.org/v1/projects/69373be900166fcb421c/platforms' \
  -H 'X-Appwrite-Project: console' \
  -H 'X-Appwrite-Key: YOUR_CONSOLE_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "web",
    "name": "Candy Inventory Production",
    "hostname": "candy.firefetch.org"
  }'
```

Replace `YOUR_CONSOLE_API_KEY` with a Console-level API key.

---

## Prevention for Future Projects

When creating new projects that use Appwrite:

1. **During project setup**, immediately add web platforms:
   - Production hostname
   - `localhost` for development
   - Wildcard domain if needed

2. **Document in CLAUDE.md** which hostnames are registered

3. **Create a setup script** that reminds developers to add platforms

4. **Consider using Console API keys** for automation (with proper security)

---

## Related Files

- `/home/ubuntu/ai/candy-inventory/src/lib/appwrite.ts` - Appwrite client configuration
- `/home/ubuntu/ai/candy-inventory/CLAUDE.md` - Project documentation
- `/home/ubuntu/ai/backend/CLAUDE.md` - Backend documentation

---

## Status

- [ ] Web platform for `candy.firefetch.org` added
- [ ] Web platform for `localhost` added (optional)
- [ ] Web platform for `*.firefetch.org` added (optional)
- [ ] App tested and connecting successfully
- [ ] CLAUDE.md updated with platform information

---

**Last Updated**: 2025-12-09
**Issue**: CORS blocking requests from candy.firefetch.org
**Resolution**: Add web platform through Appwrite Console
