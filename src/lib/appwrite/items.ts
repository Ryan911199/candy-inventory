import { Query, ID, RealtimeResponseEvent } from 'appwrite';
import { client, databases, DATABASE_ID, ITEMS_COLLECTION } from './client';
import { Item, RealtimeDocument } from './types';
import { HolidayId, CategoryId } from '../holidays';

/**
 * Get all items for a store, optionally filtered by holiday and category
 */
export async function getItems(storeNumber: string, holidayId?: HolidayId, category?: CategoryId): Promise<Item[]> {
  try {
    const queries = [
      Query.equal('storeNumber', storeNumber),
      Query.limit(500)
    ];
    
    if (holidayId) {
      queries.push(Query.equal('holiday', holidayId));
    }
    
    if (category) {
      queries.push(Query.equal('category', category));
    }
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      ITEMS_COLLECTION,
      queries
    );
    return response.documents as unknown as Item[];
  } catch (error) {
    console.error('Error getting items:', error);
    throw error;
  }
}

/**
 * Create a new item
 */
export async function createItem(
  locationId: string,
  storeNumber: string,
  name: string,
  type: string,
  icon: string,
  count: number = 0,
  holidayId?: HolidayId,
  category?: CategoryId
): Promise<Item> {
  try {
    const data: Record<string, unknown> = {
      locationId,
      storeNumber,
      name,
      type,
      icon,
      count,
      updatedAt: new Date().toISOString()
    };
    
    if (holidayId) {
      data.holiday = holidayId;
    }
    
    if (category) {
      data.category = category;
    }
    
    const item = await databases.createDocument(
      DATABASE_ID,
      ITEMS_COLLECTION,
      ID.unique(),
      data
    );
    return item as unknown as Item;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
}

/**
 * Update an item's count
 */
export async function updateItemCount(itemId: string, count: number): Promise<Item> {
  try {
    const item = await databases.updateDocument(
      DATABASE_ID,
      ITEMS_COLLECTION,
      itemId,
      { count: Math.max(0, count), updatedAt: new Date().toISOString() }
    );
    return item as unknown as Item;
  } catch (error) {
    console.error('Error updating item count:', error);
    throw error;
  }
}

/**
 * Delete an item
 */
export async function deleteItem(itemId: string): Promise<void> {
  try {
    await databases.deleteDocument(DATABASE_ID, ITEMS_COLLECTION, itemId);
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
}

/**
 * Subscribe to realtime updates for items
 */
export function subscribeToItems(storeNumber: string, callback: (items: Item[]) => void, holidayId?: HolidayId, category?: CategoryId) {
  // Initial fetch
  getItems(storeNumber, holidayId, category).then(callback);

  // Subscribe to realtime updates with store filtering
  const unsubscribe = client.subscribe(
    `databases.${DATABASE_ID}.collections.${ITEMS_COLLECTION}.documents`,
    (response: RealtimeResponseEvent<RealtimeDocument>) => {
      // Only refetch if the change is for our store or if we can't determine the store
      const payload = response.payload;
      if (!payload.storeNumber || payload.storeNumber === storeNumber) {
        getItems(storeNumber, holidayId, category).then(callback);
      }
    }
  );

  return unsubscribe;
}
