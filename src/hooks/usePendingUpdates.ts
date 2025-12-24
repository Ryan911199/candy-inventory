import { useRef, useCallback } from 'react';
import { Item } from '../lib/appwrite';

interface PendingUpdate {
  count: number;
  timestamp: number;
}

// Timeout for considering updates stale (3 seconds)
const PENDING_TIMEOUT = 3000;

/**
 * Hook for managing pending updates to prevent race conditions
 * during rapid item count changes with real-time sync
 */
export function usePendingUpdates() {
  const pendingUpdates = useRef<Map<string, PendingUpdate>>(new Map());

  /**
   * Get the current count for an item, considering pending updates
   */
  const getEffectiveCount = useCallback((itemId: string, serverCount: number): number => {
    const pending = pendingUpdates.current.get(itemId);
    const now = Date.now();
    
    if (pending && now - pending.timestamp <= PENDING_TIMEOUT) {
      return pending.count;
    }
    return serverCount;
  }, []);

  /**
   * Set a pending update for an item
   */
  const setPending = useCallback((itemId: string, count: number): void => {
    pendingUpdates.current.set(itemId, { count, timestamp: Date.now() });
  }, []);

  /**
   * Clear a pending update for an item
   */
  const clearPending = useCallback((itemId: string): void => {
    pendingUpdates.current.delete(itemId);
  }, []);

  /**
   * Clear stale pending updates and merge with server items
   */
  const mergeWithServerItems = useCallback((serverItems: Item[]): Item[] => {
    const now = Date.now();

    // Clean up stale pending updates
    pendingUpdates.current.forEach((update, itemId) => {
      if (now - update.timestamp > PENDING_TIMEOUT) {
        pendingUpdates.current.delete(itemId);
      }
    });

    // Apply pending updates on top of server data
    return serverItems.map(item => {
      const pending = pendingUpdates.current.get(item.$id);
      if (pending && now - pending.timestamp <= PENDING_TIMEOUT) {
        // Keep our local count if we have a recent pending update
        return { ...item, count: pending.count };
      }
      return item;
    });
  }, []);

  /**
   * Check if a pending update matches the saved count (for cleanup after save)
   */
  const clearIfMatches = useCallback((itemId: string, savedCount: number): void => {
    const current = pendingUpdates.current.get(itemId);
    if (current && current.count === savedCount) {
      pendingUpdates.current.delete(itemId);
    }
  }, []);

  return {
    getEffectiveCount,
    setPending,
    clearPending,
    mergeWithServerItems,
    clearIfMatches,
  };
}
