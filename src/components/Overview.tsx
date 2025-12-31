import { useState, useEffect, useCallback } from 'react';
import { LogOut, ArrowLeft, Calendar, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Item,
  getDefaultTargetDate,
} from '../lib/appwrite';
import { useDataCache } from '../context';
import { 
  HolidayId, 
  HOLIDAYS, 
  CATEGORIES,
  getCandyPalletTypes,
  getGMPalletTypes,
  CategoryId,
} from '../lib/holidays';
import { formatTargetDate, calculateDaysRemaining, calculatePerDayRate } from '../lib/dateUtils';

interface OverviewProps {
  storeNumber: string;
  holidayId: HolidayId;
  onLogout: () => void;
  onSwitchHoliday: () => void;
  onBack: () => void;
}

interface CategoryStats {
  total: number;
  typeTotals: Record<string, number>;
  perDay: string;
}

export default function Overview({ 
  storeNumber, 
  holidayId, 
  onLogout, 
  onSwitchHoliday,
  onBack 
}: OverviewProps) {
  const navigate = useNavigate();
  const dataCache = useDataCache();
  const holiday = HOLIDAYS[holidayId];
  const { theme } = holiday;

  // Initialize from cache immediately (instant if data was preloaded)
  const [store, setStore] = useState<Store | null>(() => 
    dataCache.getStoreData(storeNumber, holidayId)
  );
  const [candyItems, setCandyItems] = useState<Item[]>(() => 
    dataCache.getItemsData(storeNumber, holidayId, 'candy')
  );
  const [gmItems, setGmItems] = useState<Item[]>(() => 
    dataCache.getItemsData(storeNumber, holidayId, 'gm')
  );
  
  // Only show loading if we don't have any cached data
  const [loading, setLoading] = useState(() => {
    const hasCandyData = dataCache.getItemsData(storeNumber, holidayId, 'candy').length > 0;
    const hasGmData = dataCache.getItemsData(storeNumber, holidayId, 'gm').length > 0;
    const hasStore = dataCache.getStoreData(storeNumber, holidayId) !== null;
    // Show loading only if we have no data at all
    return !hasStore && !hasCandyData && !hasGmData;
  });

  // Get target date from store or use default
  const targetDate = store?.targetDate || getDefaultTargetDate(holidayId);

  // Calculate days remaining using utility function
  const daysRemaining = calculateDaysRemaining(targetDate);

  // Subscribe to store data using cache
  useEffect(() => {
    const unsubStore = dataCache.subscribeStore(storeNumber, holidayId, (storeData: Store | null) => {
      setStore(storeData);
    });

    return () => {
      unsubStore();
    };
  }, [storeNumber, holidayId, dataCache]);

  // Subscribe to items for both categories using cache
  useEffect(() => {
    // Track if both subscriptions have delivered data
    let candyLoaded = dataCache.getItemsData(storeNumber, holidayId, 'candy').length > 0;
    let gmLoaded = dataCache.getItemsData(storeNumber, holidayId, 'gm').length > 0;
    
    const checkLoading = () => {
      if (candyLoaded || gmLoaded) {
        setLoading(false);
      }
    };

    const unsubCandy = dataCache.subscribeItems(storeNumber, holidayId, 'candy', (items) => {
      setCandyItems(items);
      candyLoaded = true;
      checkLoading();
    });

    const unsubGm = dataCache.subscribeItems(storeNumber, holidayId, 'gm', (items) => {
      setGmItems(items);
      gmLoaded = true;
      checkLoading();
    });

    return () => {
      unsubCandy();
      unsubGm();
    };
  }, [storeNumber, holidayId, dataCache]);
  
  // Prefetch data for candy/gm pages on hover
  const prefetchCandy = useCallback(() => {
    dataCache.preloadItems(storeNumber, holidayId, 'candy');
    dataCache.preloadLocations(storeNumber);
  }, [storeNumber, holidayId, dataCache]);
  
  const prefetchGm = useCallback(() => {
    dataCache.preloadItems(storeNumber, holidayId, 'gm');
    dataCache.preloadLocations(storeNumber);
  }, [storeNumber, holidayId, dataCache]);

  // Calculate stats for a category
  const calculateStats = (items: Item[], category: CategoryId): CategoryStats => {
    const palletTypes = category === 'candy' 
      ? getCandyPalletTypes(holidayId) 
      : getGMPalletTypes(holidayId);
    
    let total = 0;
    const typeTotals: Record<string, number> = {};
    
    Object.keys(palletTypes).forEach(key => {
      typeTotals[key] = 0;
    });

    items.forEach(item => {
      total += item.count;
      if (typeTotals[item.type] !== undefined) {
        typeTotals[item.type] += item.count;
      }
    });

    const perDay = calculatePerDayRate(total, daysRemaining);

    return { total, typeTotals, perDay };
  };

  const candyStats = calculateStats(candyItems, 'candy');
  const gmStats = calculateStats(gmItems, 'gm');
  const grandTotal = candyStats.total + gmStats.total;
  const grandPerDay = calculatePerDayRate(grandTotal, daysRemaining);

  const gradientClass = `${theme.gradientFrom} ${theme.gradientVia} ${theme.gradientTo}`;

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-b ${gradientClass} flex items-center justify-center`}>
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin h-12 w-12 border-4 border-white/50 border-t-white rounded-full mx-auto mb-4"></div>
            <span className="absolute inset-0 flex items-center justify-center text-2xl">📊</span>
          </div>
          <p className="text-white/80">Loading overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${gradientClass}`}>
      {/* Header */}
      <header className="p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Back to sections"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold drop-shadow-md flex items-center">
              <span className="mr-2 text-3xl">📊</span> Overview
            </h1>
            <p className="text-white/80 text-xs font-medium opacity-90 pl-1">
              Store #{storeNumber} - {holiday.shortName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onLogout}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Switch Store"
          >
            <LogOut size={20} />
          </button>
          <button
            onClick={onSwitchHoliday}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Switch Holiday"
          >
            <span className="text-lg">{holiday.icon}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-8 max-w-lg mx-auto">
        {/* Target Date Card */}
        <div className="bg-white/95 rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${theme.statsPrimaryBg}`}>
                <Calendar size={24} className={theme.statsPrimaryText} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase">Target Date</p>
                <p className="text-2xl font-black text-slate-800">{formatTargetDate(targetDate)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-xs font-medium uppercase">Days Left</p>
              <p className={`text-3xl font-black ${daysRemaining <= 3 ? 'text-red-600' : daysRemaining <= 7 ? 'text-orange-500' : 'text-green-600'}`}>
                {daysRemaining}
              </p>
            </div>
          </div>
        </div>

        {/* Grand Total Card */}
        <div className="bg-white/95 rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-2xl">{holiday.icon}</span> Total Liability
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-slate-500 text-xs font-medium uppercase mb-1">Total Pallets</p>
              <p className="text-4xl font-black text-slate-800">{grandTotal}</p>
            </div>
            <div className={`${theme.statsPrimaryBg} rounded-xl p-4 text-center`}>
              <p className={`${theme.statsPrimaryText} text-xs font-medium uppercase mb-1 flex items-center justify-center gap-1`}>
                <TrendingDown size={14} /> Per Day Needed
              </p>
              <p className={`text-4xl font-black ${theme.statsPrimaryText}`}>{grandPerDay}</p>
            </div>
          </div>
        </div>

        {/* Candy Section Card */}
        <button
          onClick={() => navigate('/candy')}
          onMouseEnter={prefetchCandy}
          onFocus={prefetchCandy}
          className="w-full bg-white/95 rounded-2xl shadow-lg p-4 mb-4 text-left hover:bg-white transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-2xl">{CATEGORIES.candy.icon}</span> Candy
            </h2>
            <span className="text-slate-400 text-sm">Tap to manage →</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-pink-50 border border-pink-100 rounded-xl p-3 text-center">
              <p className="text-pink-600 text-xs font-medium uppercase mb-1">Total</p>
              <p className="text-2xl font-black text-pink-700">{candyStats.total}</p>
            </div>
            <div className="bg-pink-50 border border-pink-100 rounded-xl p-3 text-center">
              <p className="text-pink-600 text-xs font-medium uppercase mb-1">Per Day</p>
              <p className="text-2xl font-black text-pink-700">{candyStats.perDay}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
              <p className="text-slate-500 text-xs font-medium uppercase mb-1">Types</p>
              <p className="text-2xl font-black text-slate-700">{Object.keys(getCandyPalletTypes(holidayId)).length}</p>
            </div>
          </div>
          {/* Type breakdown */}
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(getCandyPalletTypes(holidayId)).map(([key, type]) => (
              <div key={key} className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg text-xs">
                <span>{type.icon}</span>
                <span className="font-medium text-slate-600">{type.name}:</span>
                <span className="font-bold text-slate-800">{candyStats.typeTotals[key] || 0}</span>
              </div>
            ))}
          </div>
        </button>

        {/* GM Section Card */}
        <button
          onClick={() => navigate('/gm')}
          onMouseEnter={prefetchGm}
          onFocus={prefetchGm}
          className="w-full bg-white/95 rounded-2xl shadow-lg p-4 mb-4 text-left hover:bg-white transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-2xl">{CATEGORIES.gm.icon}</span> General Merchandise
            </h2>
            <span className="text-slate-400 text-sm">Tap to manage →</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
              <p className="text-blue-600 text-xs font-medium uppercase mb-1">Total</p>
              <p className="text-2xl font-black text-blue-700">{gmStats.total}</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
              <p className="text-blue-600 text-xs font-medium uppercase mb-1">Per Day</p>
              <p className="text-2xl font-black text-blue-700">{gmStats.perDay}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
              <p className="text-slate-500 text-xs font-medium uppercase mb-1">Types</p>
              <p className="text-2xl font-black text-slate-700">{Object.keys(getGMPalletTypes(holidayId)).length}</p>
            </div>
          </div>
          {/* Type breakdown */}
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(getGMPalletTypes(holidayId)).map(([key, type]) => (
              <div key={key} className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg text-xs">
                <span>{type.icon}</span>
                <span className="font-medium text-slate-600">{type.name}:</span>
                <span className="font-bold text-slate-800">{gmStats.typeTotals[key] || 0}</span>
              </div>
            ))}
          </div>
        </button>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/candy')}
            onMouseEnter={prefetchCandy}
            onFocus={prefetchCandy}
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl p-4 font-bold shadow-lg hover:from-pink-600 hover:to-red-600 transition-all"
          >
            <span className="text-2xl block mb-1">🍬</span>
            Manage Candy
          </button>
          <button
            onClick={() => navigate('/gm')}
            onMouseEnter={prefetchGm}
            onFocus={prefetchGm}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl p-4 font-bold shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all"
          >
            <span className="text-2xl block mb-1">🎁</span>
            Manage GM
          </button>
        </div>
      </main>
    </div>
  );
}
