# Liability Tracker - AI Agent Instructions

**Location:** `/home/ubuntu/ai/liabilityTracker/`
**URL:** https://holiday.firefetch.org
**Port:** 3004

## Overview

Holiday merchandise liability tracking app with separate Candy and GM (General Merchandise) sections per holiday. Supports multiple stores with real-time sync via Appwrite.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4
- **Backend:** Appwrite (database, realtime sync)
- **Routing:** React Router v7
- **Deployment:** Docker + nginx

## Project Structure

```
src/
├── App.tsx                    # Main app with routing
├── main.tsx                   # Entry point
├── index.css                  # Tailwind styles
├── components/
│   ├── inventory/             # Extracted inventory components
│   │   ├── FloatingDecor.tsx  # Holiday-themed animations
│   │   ├── DatePickerModal.tsx # Target date picker
│   │   ├── LocationModal.tsx  # Location management
│   │   ├── InventoryCard.tsx  # Single location card
│   │   ├── InventoryFooter.tsx # Stats footer
│   │   └── index.ts           # Re-exports
│   ├── HolidaySelect.tsx      # Holiday picker (Christmas, Valentine's, Easter, Halloween)
│   ├── StoreSelect.tsx        # Store number entry
│   ├── SectionSelect.tsx      # Candy/GM/Overview section picker
│   ├── CategoryInventory.tsx  # Main inventory UI (~200 lines, uses hooks)
│   ├── Overview.tsx           # Reports/summary page
│   └── ErrorBoundary.tsx      # Error handling
├── hooks/
│   ├── useInventoryData.ts    # Subscriptions and state management
│   ├── useItemOperations.ts   # CRUD with optimistic updates
│   ├── usePendingUpdates.ts   # Race condition handling
│   └── index.ts               # Re-exports
├── lib/
│   ├── appwrite/              # Modular Appwrite operations
│   │   ├── client.ts          # Client setup and config
│   │   ├── types.ts           # Type definitions
│   │   ├── stores.ts          # Store operations
│   │   ├── locations.ts       # Location operations
│   │   ├── items.ts           # Item operations
│   │   └── index.ts           # Re-exports
│   ├── appwrite.ts            # Re-exports from appwrite/ (backwards compat)
│   ├── holidays.ts            # Holiday configs, pallet types, themes
│   └── dateUtils.ts           # Date formatting utilities
scripts/
├── add-category-attribute.js  # DB migration for category field
├── add-holiday-attribute.js   # DB migration for holiday field
├── add-target-date-attribute.js # DB migration for target date
├── fix-permissions.js         # Fix Appwrite collection permissions
├── generate-icons.js          # Generate PWA icons
├── test-appwrite.js           # Test Appwrite connection
└── test-browser-access.js     # Test browser CORS access
```

## Key Concepts

### Categories
- **Candy:** Seasonal candy and food items
- **GM:** General merchandise (non-food items)

### Pallet Types

**Generic (all holidays):**
- Candy: Candy, PDQ, Feature
- GM: Sidecounter, PDQ, Feature, Dump Bin

**Holiday-specific:**
- Christmas Candy: Popcorn, Gingerbread
- (Other holidays can have specific types added in holidays.ts)

### Data Model

```typescript
interface Item {
  $id: string;
  locationId: string;
  storeNumber: string;
  name: string;
  type: string;           // e.g., 'candy', 'candy_pdq', 'gm_sidecounter'
  icon: string;
  count: number;
  updatedAt?: string;
  holiday?: HolidayId;    // 'christmas' | 'valentines' | 'easter' | 'halloween'
  category?: CategoryId;  // 'candy' | 'gm'
}
```

### Navigation Flow

```
Holiday Select → Store Select → Section Select → [Candy | GM | Overview]
                                       ↑
                                  Back button
```

## Common Tasks

### Add a new pallet type

Edit `src/lib/holidays.ts`:

1. For generic types (all holidays), add to `GENERIC_CANDY_PALLETS` or `GENERIC_GM_PALLETS`
2. For holiday-specific, add to the appropriate `CHRISTMAS_CANDY_PALLETS`, etc.

### Add a new holiday

1. Add to `HolidayId` type in `holidays.ts`
2. Create config object (theme, target date, animation)
3. Add to `HOLIDAYS` map and `HOLIDAY_ORDER` array
4. Create holiday-specific pallet type objects if needed

### Database migrations

Run scripts from project root:
```bash
node scripts/add-category-attribute.js
node scripts/add-holiday-attribute.js
node scripts/add-target-date-attribute.js
```

## Deployment

```bash
npm run build
docker compose down && docker compose up -d --build
```

## Environment Variables

Set in `.env` or use defaults:
- `VITE_APPWRITE_ENDPOINT` - Appwrite API endpoint
- `VITE_APPWRITE_PROJECT_ID` - Appwrite project ID
- `VITE_APPWRITE_DATABASE_ID` - Database ID (default: 'candy-inventory')

**Note:** The database name `candy-inventory` is a legacy name from when this was a candy-only tracker. It's kept for backwards compatibility with existing data.

## Appwrite Collections

- `stores` - Store configurations (target dates per holiday)
- `locations` - Physical locations within stores
- `items` - Pallet items with counts

## CORS Troubleshooting

If you encounter CORS issues:
1. Check `scripts/test-browser-access.js` for testing browser access
2. Ensure Appwrite project has the correct platform/hostname configured
3. The app uses `backend.firefetch.org` as the Appwrite endpoint

## Future Enhancements

- [ ] Year-over-year tracking data
- [ ] Global overview (all holidays)
- [ ] Export reports
- [ ] Push notifications for low stock
