import { useState, useEffect } from 'react';
import HolidaySelect from './components/HolidaySelect';
import StoreSelect from './components/StoreSelect';
import Inventory from './components/Inventory';
import { getOrCreateStore } from './lib/appwrite';
import { HolidayId, HOLIDAYS } from './lib/holidays';

// Storage keys for remembering state
const STORE_KEY = 'candy-inventory-store';
const HOLIDAY_KEY = 'candy-inventory-holiday';

export default function App() {
  const [holidayId, setHolidayId] = useState<HolidayId | null>(null);
  const [storeNumber, setStoreNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);

  // Check for stored state on mount
  useEffect(() => {
    const storedStore = localStorage.getItem(STORE_KEY);
    const storedHoliday = localStorage.getItem(HOLIDAY_KEY) as HolidayId | null;
    
    if (storedHoliday && HOLIDAYS[storedHoliday]) {
      setHolidayId(storedHoliday);
    }
    if (storedStore) {
      setStoreNumber(storedStore);
    }
    setIsCheckingStorage(false);
  }, []);

  // When holiday changes and we have a store, ensure the store exists for that holiday
  useEffect(() => {
    if (holidayId && storeNumber && !isCheckingStorage) {
      setIsLoading(true);
      getOrCreateStore(storeNumber, holidayId)
        .catch((error) => {
          console.error('Failed to load store for holiday:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [holidayId, storeNumber, isCheckingStorage]);

  const handleHolidaySelect = async (id: HolidayId) => {
    localStorage.setItem(HOLIDAY_KEY, id);
    setHolidayId(id);
    
    // If we already have a store number, ensure the store exists for this holiday
    if (storeNumber) {
      setIsLoading(true);
      try {
        await getOrCreateStore(storeNumber, id);
      } catch (error) {
        console.error('Failed to load store for holiday:', error);
        alert('Failed to load store for this holiday. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStoreSelect = async (number: string) => {
    if (!holidayId) return;
    
    setIsLoading(true);
    try {
      // This will create the store and default locations if they don't exist
      await getOrCreateStore(number, holidayId);

      // Save to localStorage for next visit
      localStorage.setItem(STORE_KEY, number);
      setStoreNumber(number);
    } catch (error) {
      console.error('Failed to load store:', error);
      alert('Failed to load store. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout clears store - user needs to enter a new store number
  const handleLogout = () => {
    localStorage.removeItem(STORE_KEY);
    localStorage.removeItem(HOLIDAY_KEY);
    setStoreNumber(null);
    setHolidayId(null);
  };

  // Switch holiday keeps the same store number
  const handleSwitchHoliday = () => {
    localStorage.removeItem(HOLIDAY_KEY);
    setHolidayId(null);
    // Keep storeNumber so user doesn't have to re-enter it
  };

  // Show holiday-agnostic loading screen while checking storage
  if (isCheckingStorage) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-700 via-slate-600 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin h-12 w-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
            <span className="absolute inset-0 flex items-center justify-center text-2xl">📦</span>
          </div>
          <p className="text-white/70 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Show holiday selection if no holiday selected
  if (!holidayId) {
    return <HolidaySelect onHolidaySelect={handleHolidaySelect} storeNumber={storeNumber} />;
  }

  // Show store selection if no store selected
  if (!storeNumber) {
    return (
      <StoreSelect 
        onStoreSelect={handleStoreSelect} 
        isLoading={isLoading} 
        holidayId={holidayId}
        onSwitchHoliday={handleSwitchHoliday}
      />
    );
  }

  // Show inventory for selected store and holiday
  return (
    <Inventory 
      storeNumber={storeNumber} 
      holidayId={holidayId}
      onLogout={handleLogout} 
      onSwitchHoliday={handleSwitchHoliday}
    />
  );
}
