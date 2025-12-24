import { Models } from 'appwrite';
import { HolidayId, CategoryId } from '../holidays';

// Store document type
export interface Store {
  $id: string;
  storeNumber: string;
  name?: string;
  targetDate?: string; // ISO date string (e.g., "2024-12-21")
  holiday?: HolidayId; // Which holiday this store config is for
}

// Location document type
export interface Location {
  $id: string;
  storeNumber: string;
  name: string;
  icon: string;
  order: number;
}

// Item document type
export interface Item {
  $id: string;
  locationId: string;
  storeNumber: string;
  name: string;
  type: string;
  icon: string;
  count: number;
  updatedAt?: string; // ISO timestamp of last count update
  holiday?: HolidayId; // Which holiday this item belongs to
  category?: CategoryId; // 'candy' or 'gm' - which section this item belongs to
}

// Realtime payload type for subscriptions
export interface RealtimeDocument extends Models.Document {
  storeNumber?: string;
}

// Default locations for new stores
export const DEFAULT_LOCATIONS = [
  { name: 'Grocery Back Room', icon: '🏪', order: 0 },
  { name: 'GM Back Room', icon: '📦', order: 1 },
  { name: 'Hardware Back Wall', icon: '🔨', order: 2 },
  { name: 'Garden Center', icon: '🌻', order: 3 },
  { name: 'Trailer', icon: '🚛', order: 4 },
  { name: 'Seasonal Floor', icon: '🎄', order: 5 },
];

// Premade location options for adding new locations
export const PREMADE_LOCATIONS = [
  { name: 'On The Way', icon: '🚚' },
  { name: 'Front Room', icon: '🚪' },
  { name: 'Receiving', icon: '📥' },
  { name: 'Sales Floor', icon: '🛒' },
  { name: 'Layaway', icon: '📋' },
  { name: 'Action Alley', icon: '🎯' },
  { name: 'Pharmacy', icon: '💊' },
  { name: 'Electronics', icon: '📱' },
  { name: 'Frozen/Dairy', icon: '🧊' },
  { name: 'Meat/Produce', icon: '🥩' },
];
