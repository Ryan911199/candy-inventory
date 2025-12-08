# Candy Inventory - Project Guide

This file provides guidance to Claude Code when working on the Candy Inventory project.

## Project Overview

**Name:** Candy Inventory
**Type:** Web Application
**Location:** `/home/ubuntu/ai/candy-inventory/`
**Description:** A simple candy inventory tracking application

## Purpose

Track and manage candy inventory with features for:
- Adding/removing candy items
- Tracking quantities and stock levels
- Managing candy categories
- Inventory reporting

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

## Quick Reference

```bash
# Navigate here
cd /home/ubuntu/ai/candy-inventory

# Return to homebase
cd /home/ubuntu/ai
```

---

**Ready for your codebase!** Add your existing code and update this file with specific tech stack and commands.
