# Candy Inventory (Pallet Tracker)

| Property | Value |
|----------|-------|
| **Path** | `/home/ubuntu/ai/candy-inventory/` |
| **URL** | https://candy.firefetch.org |
| **Port** | 3004 |
| **Status** | Active |
| **Tech** | React 19, TypeScript, Vite, Tailwind v4, Appwrite |
| **Repo** | https://github.com/Ryan911199/candy-inventory |

## Quick Commands

| Action | Command |
|--------|---------|
| Dev | `cd /home/ubuntu/ai/candy-inventory && npm run dev` |
| Build | `npm run build` |
| Deploy | `docker compose up -d --build` |
| Logs | `docker logs candy-inventory --tail 50` |
| Status | `docker ps \| grep candy` |

## Overview

Christmas pallet inventory tracker with real-time sync. Features:
- Multi-store support (4-digit store numbers)
- Real-time sync via Appwrite
- Location-based inventory tracking (6 default locations)
- Candy, Popcorn, Gingerbread item types
- Daily clearance rate calculations
- PWA with offline support

## Directory Structure

```
/home/ubuntu/ai/candy-inventory/
├── src/
│   ├── components/
│   │   ├── StoreSelect.tsx    # Store number entry screen
│   │   └── Inventory.tsx      # Main inventory tracker
│   ├── lib/
│   │   └── appwrite.ts        # Appwrite client & data services
│   ├── App.tsx                # Main app with routing
│   ├── main.tsx               # React entry point
│   └── index.css              # Tailwind styles
├── index.html                 # HTML entry point
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── CLAUDE.md                  # This file
└── README.md                  # User documentation
```

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4
- **Backend:** Appwrite (hosted at backend.firefetch.org)
- **Database:** Appwrite Document Database
- **Icons:** Lucide React

## Development Workflows

### Running the App
```bash
npm run dev              # Start dev server (auto-selects available port)
npm run dev -- --port 3003  # Specify port
```

### Building
```bash
npm run build           # TypeScript compile + Vite build
npm run preview         # Preview production build
```

### Testing
```bash
# Manual testing via dev server
npm run dev
```

## Available Agents

<!-- Add project-specific agents as needed -->
None configured yet. Add agents to `.claude/agents/` as needed.

## Available Commands

<!-- Add project-specific commands as needed -->
None configured yet. Add commands to `.claude/commands/` as needed.

## Backend Integration

This project uses the centralized Appwrite backend.

**Appwrite Backend:**
- **URL:** https://backend.firefetch.org
- **Console:** https://backend.firefetch.org/console
- **API Endpoint:** https://backend.firefetch.org/v1

**Project Credentials:**
- **Project ID:** `69373be900166fcb421c`
- **API Key:** `standard_42196009213653bf938590819d94d60170251a74703a9f4ed6f7aa66fee0c2e1d6e1efea36ec5fce090c7b8020c0ad74cc6ea298ad4b0dfcb04c81113ed8c1b23cebc69439b68b0f3231ae1d1247ca874f677799dc191a9572697dab812b1182fd8629b00e343a726f6caeccb101d7714c864e9bef4f509dc5ba3aea82f36d04`

**Available Services:**
- User authentication
- Document databases with realtime
- File storage
- Serverless functions

**SDK Setup Example:**
```javascript
import { Client, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint('https://backend.firefetch.org/v1')
    .setProject('69373be900166fcb421c');

const databases = new Databases(client);
```

**Server-side with API Key:**
```javascript
import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://backend.firefetch.org/v1')
    .setProject('69373be900166fcb421c')
    .setKey('standard_42196009213653bf938590819d94d60170251a74703a9f4ed6f7aa66fee0c2e1d6e1efea36ec5fce090c7b8020c0ad74cc6ea298ad4b0dfcb04c81113ed8c1b23cebc69439b68b0f3231ae1d1247ca874f677799dc191a9572697dab812b1182fd8629b00e343a726f6caeccb101d7714c864e9bef4f509dc5ba3aea82f36d04');

const databases = new Databases(client);
```

See `/home/ubuntu/ai/backend/CLAUDE.md` for full integration instructions.

## Database Schema

**Database ID:** `candy-inventory`

### Collections

**stores**
- `storeNumber` (string, 4 chars, required) - 4-digit store identifier
- `name` (string, 100 chars, optional) - Store name

**locations**
- `storeNumber` (string, 4 chars, required) - Links to store
- `name` (string, 100 chars, required) - Location name (e.g., "Grocery Back Room")
- `icon` (string, 10 chars, required) - Emoji icon
- `order` (integer, 0-100, required) - Display order

**items**
- `locationId` (string, 36 chars, required) - Links to location document ID
- `storeNumber` (string, 4 chars, required) - For querying by store
- `name` (string, 100 chars, required) - Item name (e.g., "Candy")
- `type` (string, 20 chars, required) - Item type (candy, popcorn, gingerbread)
- `icon` (string, 10 chars, required) - Emoji icon
- `count` (integer, 0-10000, required) - Current count

### Indexes
- `stores.storeNumber_idx` - Quick store lookup
- `locations.storeNumber_idx` - Get locations by store
- `items.storeNumber_idx` - Get items by store
- `items.locationId_idx` - Get items by location

## Homebase Integration

This project is part of the AI Homebase ecosystem:
- **Homebase:** `/home/ubuntu/ai/`
- **Project Registry:** `/home/ubuntu/ai/memories/project-registry.json`

### Routing (When Ready for Deployment)

To expose this app publicly via `*.firefetch.org`:
1. See `/home/ubuntu/ai/infrastructure/CLAUDE.md`
2. Use the `/add-route` command from infrastructure
3. Configure Traefik and Cloudflare tunnel

## Working in This Project

When working here, Claude Code should:
- Follow existing code patterns in the codebase
- Keep inventory logic simple and maintainable
- Use clear naming for candy-related entities
- Test changes before committing

## Troubleshooting

### CORS Errors (Cannot connect to Appwrite)

**Symptom:** Browser console shows errors like:
```
Access to fetch at 'https://backend.firefetch.org/v1/...' from origin 'https://candy.firefetch.org'
has been blocked by CORS policy
```

**Cause:** The Appwrite project doesn't have web platforms configured for the app's hostname.

**Fix:** Add web platforms in Appwrite Console:
1. Open https://backend.firefetch.org/console
2. Go to candy-inventory project (ID: `69373be900166fcb421c`)
3. Settings → Platforms → Add Platform → Web App
4. Add hostname: `candy.firefetch.org`
5. Optionally add: `localhost` and `*.firefetch.org`

**Detailed Guide:** See `/home/ubuntu/ai/candy-inventory/CORS-FIX-GUIDE.md`

### App Not Loading

1. Check if container is running: `docker ps | grep candy`
2. Check logs: `docker logs candy-inventory --tail 50`
3. Restart: `cd /home/ubuntu/ai/candy-inventory && docker compose restart`

### Database Connection Issues

1. Verify Appwrite is running: `docker ps | grep appwrite`
2. Check Appwrite health: `curl https://backend.firefetch.org/v1/health`
3. Verify project ID and endpoint in `src/lib/appwrite.ts`

## Quick Reference

```bash
# Navigate here
cd /home/ubuntu/ai/candy-inventory

# Return to homebase
cd /home/ubuntu/ai

# Fix CORS issues
# See CORS-FIX-GUIDE.md for manual steps in Appwrite Console
```

---

**Project Status:** Active and deployed at https://candy.firefetch.org
