import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HolidaySelect from './components/HolidaySelect';
import StoreSelect from './components/StoreSelect';
import SectionSelect from './components/SectionSelect';
import CategoryInventory from './components/CategoryInventory';
import Overview from './components/Overview';
import { getOrCreateStore } from './lib/appwrite';
import { HolidayId, HOLIDAYS } from './lib/holidays';

// Storage keys for remembering state
const STORE_KEY = 'liability-tracker-store';
const HOLIDAY_KEY = 'liability-tracker-holiday';

// Main app content with routing logic
function AppContent() {
  const [holidayId, setHolidayId] = useState<HolidayId | null>(null);
  const [storeNumber, setStoreNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);
  const navigate = useNavigate();

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
        // Navigate to overview after holiday is chosen
        navigate('/overview');
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
      // Navigate to overview after store is chosen
      navigate('/overview');
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
    navigate('/');
  };

  // Switch holiday keeps the same store number
  const handleSwitchHoliday = () => {
    localStorage.removeItem(HOLIDAY_KEY);
    setHolidayId(null);
    navigate('/');
  };

  // Go back to section select
  const handleBackToSections = () => {
    navigate('/section');
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

  return (
    <Routes>
      {/* Holiday Selection */}
      <Route 
        path="/" 
        element={
          holidayId && storeNumber ? (
            <Navigate to="/overview" replace />
          ) : !holidayId ? (
            <HolidaySelect onHolidaySelect={handleHolidaySelect} storeNumber={storeNumber} />
          ) : (
            <StoreSelect 
              onStoreSelect={handleStoreSelect} 
              isLoading={isLoading} 
              holidayId={holidayId}
              onSwitchHoliday={handleSwitchHoliday}
            />
          )
        } 
      />

      {/* Section Selection (Candy, GM, Overview) */}
      <Route 
        path="/section" 
        element={
          holidayId && storeNumber ? (
            <SectionSelect 
              holidayId={holidayId}
              storeNumber={storeNumber}
              onLogout={handleLogout}
              onSwitchHoliday={handleSwitchHoliday}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />

      {/* Candy Section */}
      <Route 
        path="/candy" 
        element={
          holidayId && storeNumber ? (
            <CategoryInventory 
              storeNumber={storeNumber}
              holidayId={holidayId}
              category="candy"
              onLogout={handleLogout}
              onSwitchHoliday={handleSwitchHoliday}
              onBack={handleBackToSections}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />

      {/* GM Inventory */}
      <Route 
        path="/gm" 
        element={
          holidayId && storeNumber ? (
            <CategoryInventory 
              storeNumber={storeNumber}
              holidayId={holidayId}
              category="gm"
              onLogout={handleLogout}
              onSwitchHoliday={handleSwitchHoliday}
              onBack={handleBackToSections}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />

      {/* Overview */}
      <Route 
        path="/overview" 
        element={
          holidayId && storeNumber ? (
            <Overview 
              storeNumber={storeNumber}
              holidayId={holidayId}
              onLogout={handleLogout}
              onSwitchHoliday={handleSwitchHoliday}
              onBack={handleBackToSections}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
