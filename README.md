# Pallet Tracker - Christmas Inventory

A real-time inventory tracking application for managing Christmas candy, popcorn, and gingerbread pallets across multiple store locations.

## Features

- **Multi-Store Support**: Track inventory across different store locations using 4-digit store numbers
- **Real-Time Sync**: Changes sync instantly across all devices using Appwrite realtime subscriptions
- **Location-Based Tracking**: Organize inventory by store locations (Grocery Back Room, GM Back Room, Hardware, Garden Center, Trailer, Seasonal Floor)
- **Item Types**: Track three types of items:
  - Candy
  - Popcorn
  - Gingerbread
- **Clearance Goals**: Automatic calculation of daily clearance rates needed to meet the December 21st target
- **Mobile-Optimized**: Responsive design with touch-friendly controls

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Backend**: Appwrite (document database with realtime)
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
docker compose up -d --build

# Check status
docker ps | grep candy
```

## Environment

The app connects to:
- **Backend**: https://backend.firefetch.org/v1
- **Project ID**: `69373be900166fcb421c`
- **Database**: `candy-inventory`

## Live URL

https://candy.firefetch.org

## Project Structure

```
candy-inventory/
├── src/
│   ├── components/
│   │   ├── Inventory.tsx      # Main inventory tracker
│   │   └── StoreSelect.tsx    # Store selection screen
│   ├── lib/
│   │   └── appwrite.ts        # Database client & services
│   ├── App.tsx                # Main app with routing
│   ├── main.tsx               # React entry point
│   └── index.css              # Tailwind styles
├── docker-compose.yml         # Docker deployment config
├── Dockerfile                 # Container build config
├── nginx.conf                 # Production web server config
├── CLAUDE.md                  # Claude Code instructions
└── README.md                  # This file
```

## License

MIT
