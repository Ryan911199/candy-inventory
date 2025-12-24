import { Query, ID, RealtimeResponseEvent } from 'appwrite';
import { client, databases, DATABASE_ID, STORES_COLLECTION, LOCATIONS_COLLECTION } from './client';
import { Store, RealtimeDocument, DEFAULT_LOCATIONS } from './types';
import { HolidayId, getHolidayTargetDate } from '../holidays';

/**
 * Get default target date for a holiday
 * Falls back to December 21st if no holiday specified
 */
export function getDefaultTargetDate(holidayId?: HolidayId): string {
  if (holidayId) {
    return getHolidayTargetDate(holidayId);
  }
  const year = new Date().getFullYear();
  return `${year}-12-21`;
}

/**
 * Helper function to create default locations if none exist for a store
 */
async function createDefaultLocationsIfNeeded(storeNumber: string): Promise<void> {
  const existingLocations = await databases.listDocuments(
    DATABASE_ID,
    LOCATIONS_COLLECTION,
    [Query.equal('storeNumber', storeNumber), Query.limit(1)]
  );

  if (existingLocations.documents.length === 0) {
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
  }
}

/**
 * Get or create a store for a given store number and holiday
 */
export async function getOrCreateStore(storeNumber: string, holidayId: HolidayId = 'christmas'): Promise<Store> {
  try {
    // First, get all stores for this store number
    const allStoresResponse = await databases.listDocuments(
      DATABASE_ID,
      STORES_COLLECTION,
      [Query.equal('storeNumber', storeNumber)]
    );

    // Look for a store that matches our holiday
    const existingStore = allStoresResponse.documents.find(
      (doc) => doc.holiday === holidayId
    );

    if (existingStore) {
      return existingStore as unknown as Store;
    }

    // Check for legacy store (no holiday field) - migrate if looking for christmas
    const legacyStore = allStoresResponse.documents.find(
      (doc) => !doc.holiday
    );

    if (legacyStore && holidayId === 'christmas') {
      // Migrate legacy store to christmas
      try {
        const updated = await databases.updateDocument(
          DATABASE_ID,
          STORES_COLLECTION,
          legacyStore.$id,
          { holiday: 'christmas' }
        );
        return updated as unknown as Store;
      } catch (updateError) {
        // If update fails (holiday field doesn't exist in schema), just use the legacy store as-is
        console.warn('Could not add holiday field to legacy store, using as-is:', updateError);
        return legacyStore as unknown as Store;
      }
    }

    // Create new store with holiday-specific target date
    const storeData: Record<string, unknown> = {
      storeNumber,
      targetDate: getDefaultTargetDate(holidayId)
    };

    // Try to include holiday field - if schema doesn't support it, we'll catch the error
    try {
      const store = await databases.createDocument(
        DATABASE_ID,
        STORES_COLLECTION,
        ID.unique(),
        {
          ...storeData,
          holiday: holidayId
        }
      );

      // Create default locations for the new store (only if this is the first store for this number)
      await createDefaultLocationsIfNeeded(storeNumber);

      return store as unknown as Store;
    } catch (createError) {
      // If creating with holiday field fails, try without it
      console.warn('Could not create store with holiday field, trying without:', createError);
      
      const store = await databases.createDocument(
        DATABASE_ID,
        STORES_COLLECTION,
        ID.unique(),
        storeData
      );

      await createDefaultLocationsIfNeeded(storeNumber);

      return store as unknown as Store;
    }
  } catch (error) {
    console.error('Error getting/creating store:', error);
    throw error;
  }
}

/**
 * Get a store by store number and optional holiday
 */
export async function getStore(storeNumber: string, holidayId?: HolidayId): Promise<Store | null> {
  try {
    const queries = [Query.equal('storeNumber', storeNumber)];
    if (holidayId) {
      queries.push(Query.equal('holiday', holidayId));
    }
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      STORES_COLLECTION,
      queries
    );

    if (response.documents.length > 0) {
      return response.documents[0] as unknown as Store;
    }
    return null;
  } catch (error) {
    console.error('Error getting store:', error);
    throw error;
  }
}

/**
 * Update a store's target date
 */
export async function updateStoreTargetDate(storeId: string, targetDate: string): Promise<Store> {
  try {
    const store = await databases.updateDocument(
      DATABASE_ID,
      STORES_COLLECTION,
      storeId,
      { targetDate }
    );
    return store as unknown as Store;
  } catch (error) {
    console.error('Error updating store target date:', error);
    throw error;
  }
}

/**
 * Subscribe to realtime updates for a store
 */
export function subscribeToStore(storeNumber: string, holidayId: HolidayId, callback: (store: Store | null) => void) {
  // Initial fetch
  getStore(storeNumber, holidayId).then(callback);

  // Subscribe to realtime updates
  const unsubscribe = client.subscribe(
    `databases.${DATABASE_ID}.collections.${STORES_COLLECTION}.documents`,
    (response: RealtimeResponseEvent<RealtimeDocument>) => {
      const payload = response.payload;
      if (!payload.storeNumber || payload.storeNumber === storeNumber) {
        getStore(storeNumber, holidayId).then(callback);
      }
    }
  );

  return unsubscribe;
}
