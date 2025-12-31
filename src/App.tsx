import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HolidaySelect from './components/HolidaySelect';
import StoreSelect from './components/StoreSelect';
import SectionSelect from './components/SectionSelect';
import CategoryInventory from './components/CategoryInventory';
import Overview from './components/Overview';
import Feedback from './components/Feedback';
import { DataCacheProvider, useDataCache } from './context';
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
  const dataCache = useDataCache();

  // Check for stored state on mount - synchronous localStorage read
  useEffect(() => {
    const storedStore = localStorage.getItem(STORE_KEY);
    const storedHoliday = localStorage.getItem(HOLIDAY_KEY) as HolidayId | null;
    
    if (storedHoliday && HOLIDAYS[storedHoliday]) {
      setHolidayId(storedHoliday);
    }
    if (storedStore) {
      setStoreNumber(storedStore);
    }
    
    // If we have both, start preloading immediately (don't wait for render)
    if (storedStore && storedHoliday && HOLIDAYS[storedHoliday]) {
      // Fire off preload requests immediately - don't block UI
      dataCache.preloadAllForHoliday(storedStore, storedHoliday);
      // Also ensure store exists in background
      dataCache.ensureStore(storedStore, storedHoliday).catch(console.error);
    }
    
    setIsCheckingStorage(false);
  }, [dataCache]);

  // Preload data when holiday/store changes (but don't block)
  useEffect(() => {
    if (holidayId && storeNumber && !isCheckingStorage) {
      // Preload all data in background - this makes navigation instant
      dataCache.preloadAllForHoliday(storeNumber, holidayId);
    }
  }, [holidayId, storeNumber, isCheckingStorage, dataCache]);

  const handleStoreSelect = useCallback(async (number: string) => {
    // Save to localStorage for next visit
    localStorage.setItem(STORE_KEY, number);
    setStoreNumber(number);
    
    // Start preloading locations immediately (shared across holidays)
    dataCache.preloadLocations(number);
    
    // If we already have a holiday, go to overview
    if (holidayId) {
      setIsLoading(true);
      try {
        // Ensure store exists and preload all data in parallel
        await dataCache.ensureStore(number, holidayId);
        dataCache.preloadAllForHoliday(number, holidayId);
        navigate('/overview');
      } catch (error) {
        console.error('Failed to load store:', error);
        alert('Failed to load store. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [holidayId, navigate, dataCache]);

  const handleHolidaySelect = useCallback(async (id: HolidayId) => {
    if (!storeNumber) return;
    
    localStorage.setItem(HOLIDAY_KEY, id);
    setHolidayId(id);
    
    // Start preloading immediately while we ensure store exists
    dataCache.preloadAllForHoliday(storeNumber, id);
    
    setIsLoading(true);
    try {
      // This will create the store and default locations if they don't exist
      await dataCache.ensureStore(storeNumber, id);
      // Navigate to overview after holiday is chosen
      navigate('/overview');
    } catch (error) {
      console.error('Failed to load store for holiday:', error);
      alert('Failed to load store for this holiday. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [storeNumber, navigate, dataCache]);

  // Logout clears store - user needs to enter a new store number
  const handleLogout = useCallback(() => {
    localStorage.removeItem(STORE_KEY);
    localStorage.removeItem(HOLIDAY_KEY);
    setStoreNumber(null);
    setHolidayId(null);
    navigate('/');
  }, [navigate]);

  // Switch holiday keeps the same store number
  const handleSwitchHoliday = useCallback(() => {
    localStorage.removeItem(HOLIDAY_KEY);
    setHolidayId(null);
    navigate('/');
  }, [navigate]);

  // Go back to section select
  const handleBackToSections = useCallback(() => {
    navigate('/section');
  }, [navigate]);

  // Switch store - go back to store selection
  // IMPORTANT: This must be defined BEFORE any early returns to comply with React's Rules of Hooks
  const handleSwitchStore = useCallback(() => {
    localStorage.removeItem(STORE_KEY);
    setStoreNumber(null);
    navigate('/');
  }, [navigate]);

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
      {/* Store Selection First */}
      <Route 
        path="/" 
        element={
          holidayId && storeNumber ? (
            <Navigate to="/overview" replace />
          ) : !storeNumber ? (
            <StoreSelect 
              onStoreSelect={handleStoreSelect} 
              isLoading={isLoading} 
            />
          ) : (
            <HolidaySelect 
              onHolidaySelect={handleHolidaySelect} 
              storeNumber={storeNumber}
              onSwitchStore={handleSwitchStore}
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

      {/* Feedback */}
      <Route 
        path="/feedback" 
        element={
          holidayId && storeNumber ? (
            <Feedback 
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
      <DataCacheProvider>
        <AppContent />
      </DataCacheProvider>
    </BrowserRouter>
  );
}
