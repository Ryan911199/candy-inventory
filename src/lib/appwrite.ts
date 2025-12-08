import { Client, Databases, Query, ID } from 'appwrite';

// Appwrite configuration
const client = new Client()
  .setEndpoint('https://backend.firefetch.org/v1')
  .setProject('69373be900166fcb421c');

const databases = new Databases(client);

// Database and collection IDs
const DATABASE_ID = 'candy-inventory';
const STORES_COLLECTION = 'stores';
const LOCATIONS_COLLECTION = 'locations';
const ITEMS_COLLECTION = 'items';

// Types
export interface Store {
  $id: string;
  storeNumber: string;
  name?: string;
}

export interface Location {
  $id: string;
  storeNumber: string;
  name: string;
  icon: string;
  order: number;
}

export interface Item {
  $id: string;
  locationId: string;
  storeNumber: string;
  name: string;
  type: string;
  icon: string;
  count: number;
}

// Default locations for new stores
const DEFAULT_LOCATIONS = [
  { name: 'Grocery Back Room', icon: '🏪', order: 0 },
  { name: 'GM Back Room', icon: '📦', order: 1 },
  { name: 'Hardware Back Wall', icon: '🔨', order: 2 },
  { name: 'Garden Center', icon: '🌻', order: 3 },
  { name: 'Trailer', icon: '🚛', order: 4 },
  { name: 'Seasonal Floor', icon: '🎄', order: 5 },
];

// Store functions
export async function getOrCreateStore(storeNumber: string): Promise<Store> {
  try {
    // Try to find existing store
    const response = await databases.listDocuments(
      DATABASE_ID,
      STORES_COLLECTION,
      [Query.equal('storeNumber', storeNumber)]
    );

    if (response.documents.length > 0) {
      return response.documents[0] as unknown as Store;
    }

    // Create new store
    const store = await databases.createDocument(
      DATABASE_ID,
      STORES_COLLECTION,
      ID.unique(),
      { storeNumber }
    );

    // Create default locations for the new store
    for (const loc of DEFAULT_LOCATIONS) {
      await databases.createDocument(
        DATABASE_ID,
        LOCATIONS_COLLECTION,
        ID.unique(),
        {
          storeNumber,
          name: loc.name,
          icon: loc.icon,
          order: loc.order,
        }
      );
    }

    return store as unknown as Store;
  } catch (error) {
    console.error('Error getting/creating store:', error);
    throw error;
  }
}

// Location functions
export async function getLocations(storeNumber: string): Promise<Location[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      LOCATIONS_COLLECTION,
      [
        Query.equal('storeNumber', storeNumber),
        Query.orderAsc('order'),
        Query.limit(100)
      ]
    );
    return response.documents as unknown as Location[];
  } catch (error) {
    console.error('Error getting locations:', error);
    throw error;
  }
}

export async function createLocation(storeNumber: string, name: string, icon: string, order: number): Promise<Location> {
  try {
    const location = await databases.createDocument(
      DATABASE_ID,
      LOCATIONS_COLLECTION,
      ID.unique(),
      { storeNumber, name, icon, order }
    );
    return location as unknown as Location;
  } catch (error) {
    console.error('Error creating location:', error);
    throw error;
  }
}

// Item functions
export async function getItems(storeNumber: string): Promise<Item[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      ITEMS_COLLECTION,
      [
        Query.equal('storeNumber', storeNumber),
        Query.limit(500)
      ]
    );
    return response.documents as unknown as Item[];
  } catch (error) {
    console.error('Error getting items:', error);
    throw error;
  }
}

export async function createItem(
  locationId: string,
  storeNumber: string,
  name: string,
  type: string,
  icon: string,
  count: number = 0
): Promise<Item> {
  try {
    const item = await databases.createDocument(
      DATABASE_ID,
      ITEMS_COLLECTION,
      ID.unique(),
      { locationId, storeNumber, name, type, icon, count }
    );
    return item as unknown as Item;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
}

export async function updateItemCount(itemId: string, count: number): Promise<Item> {
  try {
    const item = await databases.updateDocument(
      DATABASE_ID,
      ITEMS_COLLECTION,
      itemId,
      { count: Math.max(0, count) }
    );
    return item as unknown as Item;
  } catch (error) {
    console.error('Error updating item count:', error);
    throw error;
  }
}

export async function deleteItem(itemId: string): Promise<void> {
  try {
    await databases.deleteDocument(DATABASE_ID, ITEMS_COLLECTION, itemId);
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
}

// Subscribe to realtime updates
export function subscribeToItems(storeNumber: string, callback: (items: Item[]) => void) {
  // Initial fetch
  getItems(storeNumber).then(callback);

  // Subscribe to realtime updates
  const unsubscribe = client.subscribe(
    `databases.${DATABASE_ID}.collections.${ITEMS_COLLECTION}.documents`,
    () => {
      // Refetch all items when any change happens
      // This is simpler than trying to merge individual changes
      getItems(storeNumber).then(callback);
    }
  );

  return unsubscribe;
}

export function subscribeToLocations(storeNumber: string, callback: (locations: Location[]) => void) {
  // Initial fetch
  getLocations(storeNumber).then(callback);

  // Subscribe to realtime updates
  const unsubscribe = client.subscribe(
    `databases.${DATABASE_ID}.collections.${LOCATIONS_COLLECTION}.documents`,
    () => {
      getLocations(storeNumber).then(callback);
    }
  );

  return unsubscribe;
}
