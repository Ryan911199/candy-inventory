import { useState, useEffect, useCallback } from 'react';
import { TreePine, Minus, Plus, Trash2, LogOut, Calendar, X } from 'lucide-react';
import {
  Store,
  Location,
  Item,
  subscribeToStore,
  subscribeToItems,
  subscribeToLocations,
  createItem,
  updateItemCount,
  deleteItem,
  updateStoreTargetDate,
  getDefaultTargetDate,
} from '../lib/appwrite';

// Available Item Types for the "Add" menu
const ITEM_TYPES = {
  candy: { name: 'Candy', type: 'candy', icon: '🍬' },
  popcorn: { name: 'Popcorn', type: 'popcorn', icon: '🍿' },
  gingerbread: { name: 'Gingerbread', type: 'gingerbread', icon: '🍪' }
};

interface InventoryProps {
  storeNumber: string;
  onLogout: () => void;
}

// Format date for display (e.g., "Dec 21")
function formatTargetDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Parse date string to Date object (handling timezone correctly)
function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export default function Inventory({ storeNumber, onLogout }: InventoryProps) {
  const [store, setStore] = useState<Store | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const [savingDate, setSavingDate] = useState(false);

  // Get target date from store or use default
  const targetDate = store?.targetDate || getDefaultTargetDate();

  // Calculated values
  const [grandTotal, setGrandTotal] = useState(0);
  const [typeTotals, setTypeTotals] = useState({ candy: 0, popcorn: 0, gingerbread: 0 });
  const [rates, setRates] = useState({ totalPerDay: '0', candyPerDay: '0' });
  const [daysRemaining, setDaysRemaining] = useState(0);

  // Subscribe to store data
  useEffect(() => {
    const unsubStore = subscribeToStore(storeNumber, (storeData) => {
      setStore(storeData);
    });

    return () => {
      unsubStore();
    };
  }, [storeNumber]);

  // Subscribe to realtime updates for locations and items
  useEffect(() => {
    setLoading(true);

    const unsubLocations = subscribeToLocations(storeNumber, (locs) => {
      setLocations(locs);
      setLoading(false);
    });

    const unsubItems = subscribeToItems(storeNumber, (itms) => {
      setItems(itms);
    });

    return () => {
      unsubLocations();
      unsubItems();
    };
  }, [storeNumber]);

  // Calculate totals and rates based on target date
  useEffect(() => {
    let total = 0;
    const types: Record<string, number> = { candy: 0, popcorn: 0, gingerbread: 0 };

    items.forEach(item => {
      total += item.count;
      if (types[item.type] !== undefined) {
        types[item.type] += item.count;
      }
    });

    setGrandTotal(total);
    setTypeTotals(types as typeof typeTotals);

    // Date Math using store's target date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = parseDate(targetDate);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setDaysRemaining(diffDays);

    if (diffDays > 0) {
      setRates({
        totalPerDay: (total / diffDays).toFixed(1),
        candyPerDay: (types.candy / diffDays).toFixed(1)
      });
    } else {
      setRates({ totalPerDay: '0', candyPerDay: '0' });
    }
  }, [items, targetDate]);

  // Get items for a specific location
  const getLocationItems = useCallback((locationId: string) => {
    return items.filter(item => item.locationId === locationId);
  }, [items]);

  // Toggle add menu
  const toggleAddMenu = (locationId: string) => {
    setOpenMenus(prev => {
      const next = new Set(prev);
      if (next.has(locationId)) {
        next.delete(locationId);
      } else {
        next.add(locationId);
      }
      return next;
    });
  };

  // Open date picker
  const openDatePicker = () => {
    setTempDate(targetDate);
    setShowDatePicker(true);
  };

  // Save new target date
  const handleSaveDate = async () => {
    if (!store || !tempDate) return;

    setSavingDate(true);
    try {
      await updateStoreTargetDate(store.$id, tempDate);
      setShowDatePicker(false);
    } catch (error) {
      console.error('Failed to update target date:', error);
      alert('Failed to update target date. Please try again.');
    } finally {
      setSavingDate(false);
    }
  };

  // Add new item
  const handleAddItem = async (locationId: string, typeKey: keyof typeof ITEM_TYPES) => {
    const template = ITEM_TYPES[typeKey];
    setOpenMenus(prev => {
      const next = new Set(prev);
      next.delete(locationId);
      return next;
    });

    try {
      await createItem(
        locationId,
        storeNumber,
        template.name,
        template.type,
        template.icon,
        0
      );
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  // Update item count
  const handleUpdateCount = async (itemId: string, currentCount: number, delta: number) => {
    const newCount = Math.max(0, currentCount + delta);

    // Optimistic update
    setItems(prev => prev.map(item =>
      item.$id === itemId ? { ...item, count: newCount } : item
    ));

    setUpdatingItems(prev => new Set(prev).add(itemId));

    try {
      await updateItemCount(itemId, newCount);
    } catch (error) {
      console.error('Failed to update count:', error);
      // Revert on error
      setItems(prev => prev.map(item =>
        item.$id === itemId ? { ...item, count: currentCount } : item
      ));
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // Remove item
  const handleRemoveItem = async (itemId: string) => {
    if (!window.confirm("Remove this item slot?")) return;

    // Optimistic update
    setItems(prev => prev.filter(item => item.$id !== itemId));

    try {
      await deleteItem(itemId);
    } catch (error) {
      console.error('Failed to delete item:', error);
      // Refetch items on error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading store {storeNumber}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-40">
      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={20} className="text-red-600" />
                Set Target Date
              </h3>
              <button
                onClick={() => setShowDatePicker(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <p className="text-slate-600 text-sm mb-4">
              Choose the date you want to finish clearing all pallets for Store #{storeNumber}.
            </p>

            <input
              type="date"
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-lg font-medium focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDatePicker(false)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDate}
                disabled={savingDate || !tempDate}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {savingDate ? 'Saving...' : 'Save Date'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-48 bg-gradient-to-b from-red-700 to-red-600 rounded-b-[2.5rem] shadow-xl z-0"></div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-5 text-white">
          <div>
            <h1 className="text-2xl font-extrabold drop-shadow-md flex items-center">
              <TreePine className="mr-2 text-green-300" /> Pallet Tracker
            </h1>
            <button
              onClick={openDatePicker}
              className="text-red-100 text-xs font-medium opacity-90 pl-1 hover:text-white transition-colors flex items-center gap-1"
            >
              Store #{storeNumber} | Target: {formatTargetDate(targetDate)}
              <Calendar size={12} className="opacity-70" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openDatePicker}
              className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-center border border-white/20 shadow-sm hover:bg-white/30 transition-colors"
              title="Click to change target date"
            >
              <div className="text-[10px] uppercase font-bold text-red-50 tracking-wider">Days Left</div>
              <div className="text-xl font-black leading-none">{daysRemaining}</div>
            </button>
            <button
              onClick={onLogout}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Switch Store"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Inventory Cards */}
        <div className="space-y-3">
          {locations.map((loc) => {
            const locationItems = getLocationItems(loc.$id);
            const isMenuOpen = openMenus.has(loc.$id);

            return (
              <div key={loc.$id} className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden relative">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">{loc.icon}</span>
                    <h2 className="font-bold text-slate-700 text-sm md:text-base">{loc.name}</h2>
                  </div>
                  <button
                    onClick={() => toggleAddMenu(loc.$id)}
                    className={`text-xs font-bold px-2 py-1 rounded transition-colors ${isMenuOpen ? 'bg-slate-200 text-slate-600' : 'bg-white border text-blue-600'}`}
                  >
                    {isMenuOpen ? 'Close' : '+ Add Item'}
                  </button>
                </div>

                {/* Add Item Menu (Collapsible) */}
                {isMenuOpen && (
                  <div className="bg-slate-100 p-2 flex justify-around border-b border-slate-200 animate-in">
                    {(Object.keys(ITEM_TYPES) as Array<keyof typeof ITEM_TYPES>).map((key) => (
                      <button
                        key={key}
                        onClick={() => handleAddItem(loc.$id, key)}
                        className="flex flex-col items-center bg-white p-2 rounded-lg shadow-sm w-20 active:scale-95 transition-transform"
                      >
                        <span className="text-lg">{ITEM_TYPES[key].icon}</span>
                        <span className="text-[10px] font-bold text-slate-600">{ITEM_TYPES[key].name}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="p-3 space-y-3">
                  {locationItems.map((item) => (
                    <div key={item.$id} className="flex items-center justify-between group">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRemoveItem(item.$id)}
                          className="text-slate-300 hover:text-red-400 p-1 -ml-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                        <span className="text-xl" role="img" aria-label={item.name}>{item.icon}</span>
                        <div className="flex flex-col">
                          <span className="text-slate-700 font-bold text-sm">{item.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center bg-slate-100 rounded-lg p-0.5 shadow-inner">
                        <button
                          onClick={() => handleUpdateCount(item.$id, item.count, -1)}
                          disabled={updatingItems.has(item.$id)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-red-500 active:bg-red-50 touch-manipulation border border-slate-200 disabled:opacity-50"
                        >
                          <Minus size={16} strokeWidth={3} />
                        </button>

                        <span className="w-10 text-center font-bold text-slate-800 text-lg tabular-nums">
                          {item.count}
                        </span>

                        <button
                          onClick={() => handleUpdateCount(item.$id, item.count, 1)}
                          disabled={updatingItems.has(item.$id)}
                          className="w-8 h-8 flex items-center justify-center bg-green-600 rounded-md shadow-sm text-white active:bg-green-700 touch-manipulation border border-green-700 disabled:opacity-50"
                        >
                          <Plus size={16} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {locationItems.length === 0 && !isMenuOpen && (
                    <div className="text-center py-2 text-slate-400 text-xs italic">
                      No items tracked here. Tap "+ Add Item" to start.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-5px_30px_-5px_rgba(0,0,0,0.15)] z-50 pb-safe">
        <div className="max-w-lg mx-auto">
          {/* Section 1: Type Breakdown */}
          <div className="flex justify-between items-center px-4 py-2 bg-slate-50 border-b border-slate-100 h-10">
            <div className="flex items-center space-x-1.5">
              <span className="text-sm">🍬</span>
              <span className="text-xs uppercase font-bold text-slate-500">Candy:</span>
              <span className="font-bold text-slate-800 text-sm">{typeTotals.candy}</span>
            </div>

            <div className="w-px h-4 bg-slate-300"></div>

            <div className="flex items-center space-x-1.5">
              <span className="text-sm">🍿</span>
              <span className="text-xs uppercase font-bold text-slate-500">Pop:</span>
              <span className="font-bold text-slate-800 text-sm">{typeTotals.popcorn}</span>
            </div>

            <div className="w-px h-4 bg-slate-300"></div>

            <div className="flex items-center space-x-1.5">
              <span className="text-sm">🍪</span>
              <span className="text-xs uppercase font-bold text-slate-500">Cookie:</span>
              <span className="font-bold text-slate-800 text-sm">{typeTotals.gingerbread}</span>
            </div>
          </div>

          {/* Section 2: Goals & Stats */}
          <div className="px-3 py-2 bg-white h-20">
            <div className="grid grid-cols-3 gap-2 h-full">
              {/* Grand Total */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tight leading-none mb-1 flex items-center gap-1">
                  Total Pallets
                </span>
                <span className="text-xl font-black text-slate-800 leading-none">{grandTotal}</span>
              </div>

              {/* Candy Per Day Goal */}
              <div className="bg-red-50 border border-red-100 rounded-lg flex flex-col items-center justify-center shadow-sm">
                <span className="text-[10px] uppercase font-bold text-red-500 tracking-tight leading-none mb-1 flex items-center gap-1">
                  <span className="text-base">🍬</span> Candy/Day
                </span>
                <span className="text-xl font-black text-red-600 leading-none">{rates.candyPerDay}</span>
              </div>

              {/* Total Per Day Goal */}
              <div className="bg-green-50 border border-green-100 rounded-lg flex flex-col items-center justify-center shadow-sm">
                <span className="text-[10px] uppercase font-bold text-green-700 tracking-tight leading-none mb-1 flex items-center gap-1">
                  <span className="text-base">📅</span> Total/Day
                </span>
                <span className="text-xl font-black text-green-700 leading-none">{rates.totalPerDay}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
