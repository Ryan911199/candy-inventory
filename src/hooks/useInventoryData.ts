import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Store,
  Location,
  Item,
  getDefaultTargetDate,
} from '../lib/appwrite';
import { useDataCache } from '../context';
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
 * Uses centralized DataCache for instant data access and background updates
 */
export function useInventoryData(
  storeNumber: string,
  holidayId: HolidayId,
  category: CategoryId
): UseInventoryDataResult {
  const dataCache = useDataCache();
  
  // Initialize state from cache immediately (no loading flash if data is cached)
  const [store, setStore] = useState<Store | null>(() => 
    dataCache.getStoreData(storeNumber, holidayId)
  );
  const [locations, setLocations] = useState<Location[]>(() => 
    dataCache.getLocationsData(storeNumber)
  );
  const [items, setItems] = useState<Item[]>(() => 
    dataCache.getItemsData(storeNumber, holidayId, category)
  );
  
  // Only show loading if we don't have cached data
  const [loading, setLoading] = useState(() => {
    const hasLocations = dataCache.getLocationsData(storeNumber).length > 0;
    return !hasLocations;
  });

  const pendingUpdates = usePendingUpdates();

  // Get pallet types for this category
  const ITEM_TYPES = useMemo(() => 
    category === 'candy' 
      ? getCandyPalletTypes(holidayId) 
      : getGMPalletTypes(holidayId),
    [category, holidayId]
  );

  // Get target date from store or use default
  const targetDate = store?.targetDate || getDefaultTargetDate(holidayId);

  // Subscribe to store data using cache
  useEffect(() => {
    const unsubStore = dataCache.subscribeStore(storeNumber, holidayId, (storeData: Store | null) => {
      setStore(storeData);
    });

    return () => {
      unsubStore();
    };
  }, [storeNumber, holidayId, dataCache]);

  // Subscribe to realtime updates for locations and items using cache
  useEffect(() => {
    // Only set loading if we don't have cached data
    const cachedLocations = dataCache.getLocationsData(storeNumber);
    if (cachedLocations.length === 0) {
      setLoading(true);
    }

    const unsubLocations = dataCache.subscribeLocations(storeNumber, (locs) => {
      setLocations(locs);
      setLoading(false);
    });

    const unsubItems = dataCache.subscribeItems(storeNumber, holidayId, category, (serverItems) => {
      // Merge server data with pending local updates to prevent race conditions
      const mergedItems = pendingUpdates.mergeWithServerItems(serverItems);
      setItems(mergedItems);
    });

    return () => {
      unsubLocations();
      unsubItems();
    };
    // Note: pendingUpdates is stable (uses useRef internally) so we don't need it in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeNumber, holidayId, category, dataCache]);

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
