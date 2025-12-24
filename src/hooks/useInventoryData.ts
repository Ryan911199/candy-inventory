import { useState, useEffect, useCallback } from 'react';
import {
  Store,
  Location,
  Item,
  subscribeToStore,
  subscribeToItems,
  subscribeToLocations,
  getDefaultTargetDate,
} from '../lib/appwrite';
import { HolidayId, CategoryId, getCandyPalletTypes, getGMPalletTypes, getPrimaryPalletType } from '../lib/holidays';
import { calculateDaysRemaining, calculatePerDayRate } from '../lib/dateUtils';
import { usePendingUpdates } from './usePendingUpdates';

interface InventoryStats {
  grandTotal: number;
  typeTotals: Record<string, number>;
  rates: {
    totalPerDay: string;
    primaryPerDay: string;
  };
  daysRemaining: number;
}

interface UseInventoryDataResult {
  store: Store | null;
  locations: Location[];
  items: Item[];
  loading: boolean;
  targetDate: string;
  stats: InventoryStats;
  getLocationItems: (locationId: string) => Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  pendingUpdates: ReturnType<typeof usePendingUpdates>;
}

/**
 * Hook for managing inventory data subscriptions and state
 */
export function useInventoryData(
  storeNumber: string,
  holidayId: HolidayId,
  category: CategoryId
): UseInventoryDataResult {
  const [store, setStore] = useState<Store | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const pendingUpdates = usePendingUpdates();

  // Get pallet types for this category
  const ITEM_TYPES = category === 'candy' 
    ? getCandyPalletTypes(holidayId) 
    : getGMPalletTypes(holidayId);

  // Get target date from store or use default
  const targetDate = store?.targetDate || getDefaultTargetDate(holidayId);

  // Subscribe to store data
  useEffect(() => {
    const unsubStore = subscribeToStore(storeNumber, holidayId, (storeData: Store | null) => {
      setStore(storeData);
    });

    return () => {
      unsubStore();
    };
  }, [storeNumber, holidayId]);

  // Subscribe to realtime updates for locations and items
  useEffect(() => {
    setLoading(true);

    const unsubLocations = subscribeToLocations(storeNumber, (locs) => {
      setLocations(locs);
      setLoading(false);
    });

    const unsubItems = subscribeToItems(storeNumber, (serverItems) => {
      // Merge server data with pending local updates to prevent race conditions
      const mergedItems = pendingUpdates.mergeWithServerItems(serverItems);
      setItems(mergedItems);
    }, holidayId, category);

    return () => {
      unsubLocations();
      unsubItems();
    };
    // Note: pendingUpdates is stable (uses useRef internally) so we don't need it in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeNumber, holidayId, category]);

  // Calculate stats
  const stats: InventoryStats = (() => {
    let total = 0;
    const types: Record<string, number> = {};
    
    // Initialize type counts dynamically based on category pallet types
    Object.keys(ITEM_TYPES).forEach(key => {
      types[key] = 0;
    });

    items.forEach(item => {
      total += item.count;
      if (types[item.type] !== undefined) {
        types[item.type] += item.count;
      }
    });

    const daysRemaining = calculateDaysRemaining(targetDate);
    const primaryTypeKey = getPrimaryPalletType(holidayId, category);

    return {
      grandTotal: total,
      typeTotals: types,
      rates: {
        totalPerDay: calculatePerDayRate(total, daysRemaining),
        primaryPerDay: calculatePerDayRate(types[primaryTypeKey] || 0, daysRemaining),
      },
      daysRemaining,
    };
  })();

  // Get items for a specific location
  const getLocationItems = useCallback((locationId: string) => {
    return items.filter(item => item.locationId === locationId);
  }, [items]);

  return {
    store,
    locations,
    items,
    loading,
    targetDate,
    stats,
    getLocationItems,
    setItems,
    pendingUpdates,
  };
}
