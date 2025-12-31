import { createContext, useContext, useCallback, useRef, useEffect, ReactNode } from 'react';
import { 
  Store, 
  Location, 
  Item, 
  getStore, 
  getLocations, 
  getItems,
  getOrCreateStore,
  subscribeToStore,
  subscribeToLocations,
  subscribeToItems,
} from '../lib/appwrite';
import { HolidayId, CategoryId } from '../lib/holidays';

// Cache entry with timestamp for staleness checking
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  loading: boolean;
}

// Cache keys
type StoreKey = `store:${string}:${string}`; // store:storeNumber:holidayId
type LocationsKey = `locations:${string}`; // locations:storeNumber
type ItemsKey = `items:${string}:${string}:${string}`; // items:storeNumber:holidayId:category

// Subscription tracking
interface Subscription {
  unsubscribe: () => void;
  refCount: number;
}

// Cache state
interface CacheState {
  stores: Map<StoreKey, CacheEntry<Store | null>>;
  locations: Map<LocationsKey, CacheEntry<Location[]>>;
  items: Map<ItemsKey, CacheEntry<Item[]>>;
}

// Context value
interface DataCacheContextValue {
  // Get data (returns cached if available, fetches if not)
  getStoreData: (storeNumber: string, holidayId: HolidayId) => Store | null;
  getLocationsData: (storeNumber: string) => Location[];
  getItemsData: (storeNumber: string, holidayId: HolidayId, category: CategoryId) => Item[];
  
  // Check if data is loading
  isStoreLoading: (storeNumber: string, holidayId: HolidayId) => boolean;
  isLocationsLoading: (storeNumber: string) => boolean;
  isItemsLoading: (storeNumber: string, holidayId: HolidayId, category: CategoryId) => boolean;
  
  // Preload data (fire and forget)
  preloadStore: (storeNumber: string, holidayId: HolidayId) => void;
  preloadLocations: (storeNumber: string) => void;
  preloadItems: (storeNumber: string, holidayId: HolidayId, category: CategoryId) => void;
  preloadAllForHoliday: (storeNumber: string, holidayId: HolidayId) => void;
  
  // Subscribe to data (returns unsubscribe function)
  subscribeStore: (storeNumber: string, holidayId: HolidayId, callback: (store: Store | null) => void) => () => void;
  subscribeLocations: (storeNumber: string, callback: (locations: Location[]) => void) => () => void;
  subscribeItems: (storeNumber: string, holidayId: HolidayId, category: CategoryId, callback: (items: Item[]) => void) => () => void;
  
  // Update cache directly (for optimistic updates)
  updateItemsCache: (storeNumber: string, holidayId: HolidayId, category: CategoryId, items: Item[]) => void;
  
  // Ensure store exists (creates if needed)
  ensureStore: (storeNumber: string, holidayId: HolidayId) => Promise<Store>;
  
  // Force refresh
  invalidateStore: (storeNumber: string, holidayId: HolidayId) => void;
  invalidateLocations: (storeNumber: string) => void;
  invalidateItems: (storeNumber: string, holidayId: HolidayId, category: CategoryId) => void;
}

const DataCacheContext = createContext<DataCacheContextValue | null>(null);

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

export function DataCacheProvider({ children }: { children: ReactNode }) {
  // Use refs to avoid re-renders when cache updates
  const cacheRef = useRef<CacheState>({
    stores: new Map(),
    locations: new Map(),
    items: new Map(),
  });
  
  // Track subscriptions to avoid duplicates
  const subscriptionsRef = useRef<{
    stores: Map<StoreKey, Subscription>;
    locations: Map<LocationsKey, Subscription>;
    items: Map<ItemsKey, Subscription>;
  }>({
    stores: new Map(),
    locations: new Map(),
    items: new Map(),
  });
  
  // Track callbacks for each subscription
  const callbacksRef = useRef<{
    stores: Map<StoreKey, Set<(store: Store | null) => void>>;
    locations: Map<LocationsKey, Set<(locations: Location[]) => void>>;
    items: Map<ItemsKey, Set<(items: Item[]) => void>>;
  }>({
    stores: new Map(),
    locations: new Map(),
    items: new Map(),
  });
  
  // Pending fetches to avoid duplicate requests
  const pendingFetchesRef = useRef<{
    stores: Map<StoreKey, Promise<Store | null>>;
    locations: Map<LocationsKey, Promise<Location[]>>;
    items: Map<ItemsKey, Promise<Item[]>>;
  }>({
    stores: new Map(),
    locations: new Map(),
    items: new Map(),
  });

  // Helper to check if cache entry is stale
  const isStale = <T,>(entry: CacheEntry<T> | undefined): boolean => {
    if (!entry) return true;
    return Date.now() - entry.timestamp > CACHE_TTL;
  };

  // Store operations
  const getStoreKey = (storeNumber: string, holidayId: HolidayId): StoreKey => 
    `store:${storeNumber}:${holidayId}`;

  const fetchStore = useCallback(async (storeNumber: string, holidayId: HolidayId): Promise<Store | null> => {
    const key = getStoreKey(storeNumber, holidayId);
    
    // Check for pending fetch
    const pending = pendingFetchesRef.current.stores.get(key);
    if (pending) return pending;
    
    // Mark as loading
    const existingEntry = cacheRef.current.stores.get(key);
    cacheRef.current.stores.set(key, {
      data: existingEntry?.data ?? null,
      timestamp: existingEntry?.timestamp ?? 0,
      loading: true,
    });
    
    // Create fetch promise
    const fetchPromise = getStore(storeNumber, holidayId);
    pendingFetchesRef.current.stores.set(key, fetchPromise);
    
    try {
      const store = await fetchPromise;
      cacheRef.current.stores.set(key, {
        data: store,
        timestamp: Date.now(),
        loading: false,
      });
      
      // Notify callbacks
      const callbacks = callbacksRef.current.stores.get(key);
      if (callbacks) {
        callbacks.forEach(cb => cb(store));
      }
      
      return store;
    } finally {
      pendingFetchesRef.current.stores.delete(key);
    }
  }, []);

  const getStoreData = useCallback((storeNumber: string, holidayId: HolidayId): Store | null => {
    const key = getStoreKey(storeNumber, holidayId);
    const entry = cacheRef.current.stores.get(key);
    
    // If stale or missing, trigger background fetch
    if (isStale(entry)) {
      fetchStore(storeNumber, holidayId);
    }
    
    return entry?.data ?? null;
  }, [fetchStore]);

  const isStoreLoading = useCallback((storeNumber: string, holidayId: HolidayId): boolean => {
    const key = getStoreKey(storeNumber, holidayId);
    const entry = cacheRef.current.stores.get(key);
    return entry?.loading ?? true;
  }, []);

  const preloadStore = useCallback((storeNumber: string, holidayId: HolidayId) => {
    const key = getStoreKey(storeNumber, holidayId);
    const entry = cacheRef.current.stores.get(key);
    if (isStale(entry)) {
      fetchStore(storeNumber, holidayId);
    }
  }, [fetchStore]);

  const ensureStore = useCallback(async (storeNumber: string, holidayId: HolidayId): Promise<Store> => {
    const key = getStoreKey(storeNumber, holidayId);
    
    // Check cache first
    const entry = cacheRef.current.stores.get(key);
    if (entry?.data && !isStale(entry)) {
      return entry.data;
    }
    
    // Create or get store
    const store = await getOrCreateStore(storeNumber, holidayId);
    cacheRef.current.stores.set(key, {
      data: store,
      timestamp: Date.now(),
      loading: false,
    });
    
    // Notify callbacks
    const callbacks = callbacksRef.current.stores.get(key);
    if (callbacks) {
      callbacks.forEach(cb => cb(store));
    }
    
    return store;
  }, []);

  const subscribeStore = useCallback((
    storeNumber: string, 
    holidayId: HolidayId, 
    callback: (store: Store | null) => void
  ): () => void => {
    const key = getStoreKey(storeNumber, holidayId);
    
    // Add callback to set
    if (!callbacksRef.current.stores.has(key)) {
      callbacksRef.current.stores.set(key, new Set());
    }
    callbacksRef.current.stores.get(key)!.add(callback);
    
    // Check if we already have a subscription
    const existingSub = subscriptionsRef.current.stores.get(key);
    if (existingSub) {
      existingSub.refCount++;
      // Immediately call with cached data if available
      const entry = cacheRef.current.stores.get(key);
      if (entry?.data !== undefined) {
        callback(entry.data);
      }
    } else {
      // Create new subscription
      const unsubscribe = subscribeToStore(storeNumber, holidayId, (store) => {
        cacheRef.current.stores.set(key, {
          data: store,
          timestamp: Date.now(),
          loading: false,
        });
        // Notify all callbacks
        const callbacks = callbacksRef.current.stores.get(key);
        if (callbacks) {
          callbacks.forEach(cb => cb(store));
        }
      });
      
      subscriptionsRef.current.stores.set(key, { unsubscribe, refCount: 1 });
    }
    
    // Return unsubscribe function
    return () => {
      const callbacks = callbacksRef.current.stores.get(key);
      if (callbacks) {
        callbacks.delete(callback);
      }
      
      const sub = subscriptionsRef.current.stores.get(key);
      if (sub) {
        sub.refCount--;
        if (sub.refCount <= 0) {
          sub.unsubscribe();
          subscriptionsRef.current.stores.delete(key);
        }
      }
    };
  }, []);

  const invalidateStore = useCallback((storeNumber: string, holidayId: HolidayId) => {
    const key = getStoreKey(storeNumber, holidayId);
    cacheRef.current.stores.delete(key);
    fetchStore(storeNumber, holidayId);
  }, [fetchStore]);

  // Locations operations
  const getLocationsKey = (storeNumber: string): LocationsKey => 
    `locations:${storeNumber}`;

  const fetchLocations = useCallback(async (storeNumber: string): Promise<Location[]> => {
    const key = getLocationsKey(storeNumber);
    
    // Check for pending fetch
    const pending = pendingFetchesRef.current.locations.get(key);
    if (pending) return pending;
    
    // Mark as loading
    const existingEntry = cacheRef.current.locations.get(key);
    cacheRef.current.locations.set(key, {
      data: existingEntry?.data ?? [],
      timestamp: existingEntry?.timestamp ?? 0,
      loading: true,
    });
    
    // Create fetch promise
    const fetchPromise = getLocations(storeNumber);
    pendingFetchesRef.current.locations.set(key, fetchPromise);
    
    try {
      const locations = await fetchPromise;
      cacheRef.current.locations.set(key, {
        data: locations,
        timestamp: Date.now(),
        loading: false,
      });
      
      // Notify callbacks
      const callbacks = callbacksRef.current.locations.get(key);
      if (callbacks) {
        callbacks.forEach(cb => cb(locations));
      }
      
      return locations;
    } finally {
      pendingFetchesRef.current.locations.delete(key);
    }
  }, []);

  const getLocationsData = useCallback((storeNumber: string): Location[] => {
    const key = getLocationsKey(storeNumber);
    const entry = cacheRef.current.locations.get(key);
    
    if (isStale(entry)) {
      fetchLocations(storeNumber);
    }
    
    return entry?.data ?? [];
  }, [fetchLocations]);

  const isLocationsLoading = useCallback((storeNumber: string): boolean => {
    const key = getLocationsKey(storeNumber);
    const entry = cacheRef.current.locations.get(key);
    return entry?.loading ?? true;
  }, []);

  const preloadLocations = useCallback((storeNumber: string) => {
    const key = getLocationsKey(storeNumber);
    const entry = cacheRef.current.locations.get(key);
    if (isStale(entry)) {
      fetchLocations(storeNumber);
    }
  }, [fetchLocations]);

  const subscribeLocations = useCallback((
    storeNumber: string, 
    callback: (locations: Location[]) => void
  ): () => void => {
    const key = getLocationsKey(storeNumber);
    
    // Add callback to set
    if (!callbacksRef.current.locations.has(key)) {
      callbacksRef.current.locations.set(key, new Set());
    }
    callbacksRef.current.locations.get(key)!.add(callback);
    
    // Check if we already have a subscription
    const existingSub = subscriptionsRef.current.locations.get(key);
    if (existingSub) {
      existingSub.refCount++;
      // Immediately call with cached data if available
      const entry = cacheRef.current.locations.get(key);
      if (entry?.data) {
        callback(entry.data);
      }
    } else {
      // Create new subscription
      const unsubscribe = subscribeToLocations(storeNumber, (locations) => {
        cacheRef.current.locations.set(key, {
          data: locations,
          timestamp: Date.now(),
          loading: false,
        });
        // Notify all callbacks
        const callbacks = callbacksRef.current.locations.get(key);
        if (callbacks) {
          callbacks.forEach(cb => cb(locations));
        }
      });
      
      subscriptionsRef.current.locations.set(key, { unsubscribe, refCount: 1 });
    }
    
    // Return unsubscribe function
    return () => {
      const callbacks = callbacksRef.current.locations.get(key);
      if (callbacks) {
        callbacks.delete(callback);
      }
      
      const sub = subscriptionsRef.current.locations.get(key);
      if (sub) {
        sub.refCount--;
        if (sub.refCount <= 0) {
          sub.unsubscribe();
          subscriptionsRef.current.locations.delete(key);
        }
      }
    };
  }, []);

  const invalidateLocations = useCallback((storeNumber: string) => {
    const key = getLocationsKey(storeNumber);
    cacheRef.current.locations.delete(key);
    fetchLocations(storeNumber);
  }, [fetchLocations]);

  // Items operations
  const getItemsKey = (storeNumber: string, holidayId: HolidayId, category: CategoryId): ItemsKey => 
    `items:${storeNumber}:${holidayId}:${category}`;

  const fetchItems = useCallback(async (storeNumber: string, holidayId: HolidayId, category: CategoryId): Promise<Item[]> => {
    const key = getItemsKey(storeNumber, holidayId, category);
    
    // Check for pending fetch
    const pending = pendingFetchesRef.current.items.get(key);
    if (pending) return pending;
    
    // Mark as loading
    const existingEntry = cacheRef.current.items.get(key);
    cacheRef.current.items.set(key, {
      data: existingEntry?.data ?? [],
      timestamp: existingEntry?.timestamp ?? 0,
      loading: true,
    });
    
    // Create fetch promise
    const fetchPromise = getItems(storeNumber, holidayId, category);
    pendingFetchesRef.current.items.set(key, fetchPromise);
    
    try {
      const items = await fetchPromise;
      cacheRef.current.items.set(key, {
        data: items,
        timestamp: Date.now(),
        loading: false,
      });
      
      // Notify callbacks
      const callbacks = callbacksRef.current.items.get(key);
      if (callbacks) {
        callbacks.forEach(cb => cb(items));
      }
      
      return items;
    } finally {
      pendingFetchesRef.current.items.delete(key);
    }
  }, []);

  const getItemsData = useCallback((storeNumber: string, holidayId: HolidayId, category: CategoryId): Item[] => {
    const key = getItemsKey(storeNumber, holidayId, category);
    const entry = cacheRef.current.items.get(key);
    
    if (isStale(entry)) {
      fetchItems(storeNumber, holidayId, category);
    }
    
    return entry?.data ?? [];
  }, [fetchItems]);

  const isItemsLoading = useCallback((storeNumber: string, holidayId: HolidayId, category: CategoryId): boolean => {
    const key = getItemsKey(storeNumber, holidayId, category);
    const entry = cacheRef.current.items.get(key);
    return entry?.loading ?? true;
  }, []);

  const preloadItems = useCallback((storeNumber: string, holidayId: HolidayId, category: CategoryId) => {
    const key = getItemsKey(storeNumber, holidayId, category);
    const entry = cacheRef.current.items.get(key);
    if (isStale(entry)) {
      fetchItems(storeNumber, holidayId, category);
    }
  }, [fetchItems]);

  const subscribeItems = useCallback((
    storeNumber: string, 
    holidayId: HolidayId, 
    category: CategoryId,
    callback: (items: Item[]) => void
  ): () => void => {
    const key = getItemsKey(storeNumber, holidayId, category);
    
    // Add callback to set
    if (!callbacksRef.current.items.has(key)) {
      callbacksRef.current.items.set(key, new Set());
    }
    callbacksRef.current.items.get(key)!.add(callback);
    
    // Check if we already have a subscription
    const existingSub = subscriptionsRef.current.items.get(key);
    if (existingSub) {
      existingSub.refCount++;
      // Immediately call with cached data if available
      const entry = cacheRef.current.items.get(key);
      if (entry?.data) {
        callback(entry.data);
      }
    } else {
      // Create new subscription
      const unsubscribe = subscribeToItems(storeNumber, (items) => {
        cacheRef.current.items.set(key, {
          data: items,
          timestamp: Date.now(),
          loading: false,
        });
        // Notify all callbacks
        const callbacks = callbacksRef.current.items.get(key);
        if (callbacks) {
          callbacks.forEach(cb => cb(items));
        }
      }, holidayId, category);
      
      subscriptionsRef.current.items.set(key, { unsubscribe, refCount: 1 });
    }
    
    // Return unsubscribe function
    return () => {
      const callbacks = callbacksRef.current.items.get(key);
      if (callbacks) {
        callbacks.delete(callback);
      }
      
      const sub = subscriptionsRef.current.items.get(key);
      if (sub) {
        sub.refCount--;
        if (sub.refCount <= 0) {
          sub.unsubscribe();
          subscriptionsRef.current.items.delete(key);
        }
      }
    };
  }, []);

  const updateItemsCache = useCallback((storeNumber: string, holidayId: HolidayId, category: CategoryId, items: Item[]) => {
    const key = getItemsKey(storeNumber, holidayId, category);
    cacheRef.current.items.set(key, {
      data: items,
      timestamp: Date.now(),
      loading: false,
    });
    
    // Notify callbacks
    const callbacks = callbacksRef.current.items.get(key);
    if (callbacks) {
      callbacks.forEach(cb => cb(items));
    }
  }, []);

  const invalidateItems = useCallback((storeNumber: string, holidayId: HolidayId, category: CategoryId) => {
    const key = getItemsKey(storeNumber, holidayId, category);
    cacheRef.current.items.delete(key);
    fetchItems(storeNumber, holidayId, category);
  }, [fetchItems]);

  // Preload all data for a holiday (called after holiday selection)
  const preloadAllForHoliday = useCallback((storeNumber: string, holidayId: HolidayId) => {
    // Preload in parallel - don't await, just fire off the requests
    preloadStore(storeNumber, holidayId);
    preloadLocations(storeNumber);
    preloadItems(storeNumber, holidayId, 'candy');
    preloadItems(storeNumber, holidayId, 'gm');
  }, [preloadStore, preloadLocations, preloadItems]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      // Unsubscribe from all active subscriptions
      subscriptionsRef.current.stores.forEach(sub => sub.unsubscribe());
      subscriptionsRef.current.locations.forEach(sub => sub.unsubscribe());
      subscriptionsRef.current.items.forEach(sub => sub.unsubscribe());
    };
  }, []);

  const value: DataCacheContextValue = {
    getStoreData,
    getLocationsData,
    getItemsData,
    isStoreLoading,
    isLocationsLoading,
    isItemsLoading,
    preloadStore,
    preloadLocations,
    preloadItems,
    preloadAllForHoliday,
    subscribeStore,
    subscribeLocations,
    subscribeItems,
    updateItemsCache,
    ensureStore,
    invalidateStore,
    invalidateLocations,
    invalidateItems,
  };

  return (
    <DataCacheContext.Provider value={value}>
      {children}
    </DataCacheContext.Provider>
  );
}

export function useDataCache(): DataCacheContextValue {
  const context = useContext(DataCacheContext);
  if (!context) {
    throw new Error('useDataCache must be used within a DataCacheProvider');
  }
  return context;
}
