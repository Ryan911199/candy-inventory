// Re-export all appwrite modules for convenient imports

// Client and configuration
export { client, databases, DATABASE_ID, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from './client';

// Types
export type { Store, Location, Item, RealtimeDocument } from './types';
export { DEFAULT_LOCATIONS, PREMADE_LOCATIONS } from './types';

// Store operations
export { 
  getOrCreateStore, 
  getStore, 
  updateStoreTargetDate, 
  subscribeToStore,
  getDefaultTargetDate 
} from './stores';

// Location operations
export { 
  getLocations, 
  createLocation, 
  deleteLocation, 
  subscribeToLocations 
} from './locations';

// Item operations
export { 
  getItems, 
  createItem, 
  updateItemCount, 
  deleteItem, 
  subscribeToItems 
} from './items';
