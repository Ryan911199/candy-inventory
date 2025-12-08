import { useState, useEffect } from 'react';
import StoreSelect from './components/StoreSelect';
import Inventory from './components/Inventory';
import { getOrCreateStore } from './lib/appwrite';

// Storage key for remembering store
const STORE_KEY = 'candy-inventory-store';

export default function App() {
  const [storeNumber, setStoreNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);

  // Check for stored store number on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORE_KEY);
    if (stored) {
      setStoreNumber(stored);
    }
    setIsCheckingStorage(false);
  }, []);

  const handleStoreSelect = async (number: string) => {
    setIsLoading(true);
    try {
      // This will create the store and default locations if they don't exist
      await getOrCreateStore(number);

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

  const handleLogout = () => {
    localStorage.removeItem(STORE_KEY);
    setStoreNumber(null);
  };

  // Show nothing while checking storage
  if (isCheckingStorage) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Show store selection if no store selected
  if (!storeNumber) {
    return <StoreSelect onStoreSelect={handleStoreSelect} isLoading={isLoading} />;
  }

  // Show inventory for selected store
  return <Inventory storeNumber={storeNumber} onLogout={handleLogout} />;
}
