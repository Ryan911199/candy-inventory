import { Query, ID, RealtimeResponseEvent } from 'appwrite';
import { client, databases, DATABASE_ID, LOCATIONS_COLLECTION } from './client';
import { Location, RealtimeDocument } from './types';

/**
 * Get all locations for a store
 */
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

/**
 * Create a new location for a store
 */
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

/**
 * Delete a location
 */
export async function deleteLocation(locationId: string): Promise<void> {
  try {
    await databases.deleteDocument(DATABASE_ID, LOCATIONS_COLLECTION, locationId);
  } catch (error) {
    console.error('Error deleting location:', error);
    throw error;
  }
}

/**
 * Subscribe to realtime updates for locations
 */
export function subscribeToLocations(storeNumber: string, callback: (locations: Location[]) => void) {
  // Initial fetch
  getLocations(storeNumber).then(callback);

  // Subscribe to realtime updates with store filtering
  const unsubscribe = client.subscribe(
    `databases.${DATABASE_ID}.collections.${LOCATIONS_COLLECTION}.documents`,
    (response: RealtimeResponseEvent<RealtimeDocument>) => {
      // Only refetch if the change is for our store or if we can't determine the store
      const payload = response.payload;
      if (!payload.storeNumber || payload.storeNumber === storeNumber) {
        getLocations(storeNumber).then(callback);
      }
    }
  );

  return unsubscribe;
}
