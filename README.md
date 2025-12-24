# Liability Tracker

A real-time inventory tracking application for managing seasonal holiday merchandise (candy and general merchandise) across multiple store locations.

## Live URL

https://holiday.firefetch.org

## Features

- **Multi-Holiday Support**: Track inventory for Christmas, Valentine's Day, Easter, and Halloween
- **Candy & GM Sections**: Separate tracking for candy/food items and general merchandise
- **Multi-Store Support**: Track inventory across different store locations using 4-digit store numbers
- **Real-Time Sync**: Changes sync instantly across all devices using Appwrite realtime subscriptions
- **Location-Based Tracking**: Organize inventory by store locations (Back Room, Trailer, Seasonal Floor, etc.)
- **Holiday-Specific Pallet Types**: Each holiday has unique item types (e.g., Popcorn, Gingerbread for Christmas)
- **Clearance Goals**: Automatic calculation of daily clearance rates needed to meet target dates
- **Holiday Themes**: Dynamic UI themes that change based on selected holiday
- **Mobile-Optimized**: Responsive design with touch-friendly controls

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Backend**: Appwrite (document database with realtime)
- **Routing**: React Router v7
- **Deployment**: Docker + Nginx

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (for production deployment)

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Production Deployment

```bash
# Build and start Docker container
docker compose down && docker compose up -d --build

# Check status
docker ps | grep liability
```

## Project Structure

```
liabilityTracker/
├── src/
│   ├── components/
│   │   ├── inventory/           # Inventory UI components
│   │   │   ├── FloatingDecor.tsx
│   │   │   ├── DatePickerModal.tsx
│   │   │   ├── LocationModal.tsx
│   │   │   ├── InventoryCard.tsx
│   │   │   └── InventoryFooter.tsx
│   │   ├── CategoryInventory.tsx  # Main inventory screen
│   │   ├── Overview.tsx           # Summary/reports page
│   │   ├── HolidaySelect.tsx      # Holiday picker
│   │   ├── StoreSelect.tsx        # Store number entry
│   │   ├── SectionSelect.tsx      # Candy/GM/Overview picker
│   │   └── ErrorBoundary.tsx      # Error handling
│   ├── hooks/
│   │   ├── useInventoryData.ts    # Data subscriptions & state
│   │   ├── useItemOperations.ts   # CRUD with optimistic updates
│   │   └── usePendingUpdates.ts   # Race condition handling
│   ├── lib/
│   │   ├── appwrite/              # Modular Appwrite operations
│   │   │   ├── client.ts          # Client configuration
│   │   │   ├── types.ts           # Type definitions
│   │   │   ├── stores.ts          # Store operations
│   │   │   ├── locations.ts       # Location operations
│   │   │   └── items.ts           # Item operations
│   │   ├── appwrite.ts            # Re-exports (backwards compat)
│   │   ├── holidays.ts            # Holiday configs & themes
│   │   └── dateUtils.ts           # Date formatting utilities
│   ├── App.tsx                    # Main app with routing
│   ├── main.tsx                   # React entry point
│   └── index.css                  # Tailwind styles
├── scripts/
│   ├── add-category-attribute.js  # DB migration for category field
│   ├── add-holiday-attribute.js   # DB migration for holiday field
│   ├── add-target-date-attribute.js
│   ├── fix-permissions.js
│   ├── generate-icons.js
│   ├── test-appwrite.js
│   └── test-browser-access.js
├── public/
│   ├── sw.js                      # Service worker for offline support
│   └── manifest.json              # PWA manifest
├── docker-compose.yml             # Docker deployment config
├── Dockerfile                     # Container build config
├── nginx.conf                     # Production web server config
└── AGENTS.md                      # AI agent instructions
```

## Environment Variables

Set in `.env` or use defaults:
- `VITE_APPWRITE_ENDPOINT` - Appwrite API endpoint (default: https://backend.firefetch.org/v1)
- `VITE_APPWRITE_PROJECT_ID` - Appwrite project ID
- `VITE_APPWRITE_DATABASE_ID` - Database ID (default: 'candy-inventory' - legacy name kept for compatibility)

## Navigation Flow

```
Holiday Select → Store Select → Section Select → [Candy | GM | Overview]
                                      ↑
                                 Back button
```

## Holidays Supported

| Holiday | Icon | Target Date | Theme Colors |
|---------|------|-------------|--------------|
| Christmas | 🎄 | Dec 22 | Red & Green |
| Valentine's | 💝 | Feb 11 | Pink & Red |
| Easter | 🐰 | Apr 17 | Purple & Yellow |
| Halloween | 🎃 | Oct 28 | Orange & Purple |

## Appwrite Collections

- `stores` - Store configurations (target dates per holiday)
- `locations` - Physical locations within stores
- `items` - Pallet items with counts, holiday, and category

## License

MIT
