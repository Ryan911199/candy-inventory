================================================================================
  CANDY INVENTORY - CORS FIX REQUIRED
================================================================================

PROBLEM: App cannot connect to Appwrite backend (CORS error)

QUICK FIX (5 minutes):
1. Go to: https://backend.firefetch.org/console
2. Login with admin credentials
3. Select project: "candy-inventory" (ID: 69373be900166fcb421c)
4. Click Settings (gear icon) → Platforms tab
5. Click "Add Platform" → Select "Web App"
6. Enter:
   - Name: Candy Inventory Production
   - Hostname: candy.firefetch.org
   (NO https://, NO www, NO trailing slash)
7. Click Create/Next
8. Test: Open https://candy.firefetch.org (should work now!)

OPTIONAL: Add these too:
- Hostname: localhost (for local development)
- Hostname: *.firefetch.org (for all subdomains)

================================================================================

MORE INFO:
- Quick Guide: ./FIX-CORS-NOW.md
- Detailed Guide: ./CORS-FIX-GUIDE.md
- Investigation Summary: ./CORS-FIX-SUMMARY.md
- Troubleshooting: ./CLAUDE.md (Troubleshooting section)

================================================================================

WHAT YOU'RE DOING:
Telling Appwrite: "Allow candy.firefetch.org to access this project's API"

WHY IT'S NEEDED:
Browsers block cross-origin requests unless the server explicitly allows them.
This is a security feature. You're just adding your domain to the allowlist.

================================================================================

STATUS:
- App: Running (https://candy.firefetch.org)
- Container: candy-inventory (healthy)
- Backend: Running (https://backend.firefetch.org)
- Issue: CORS - needs manual fix in Console
- Fix Time: ~5 minutes
- Code Changes: None needed

================================================================================
