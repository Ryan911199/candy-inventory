import { useState, useEffect, useCallback, useRef } from 'react';
import { TreePine, Minus, Plus, Trash2, LogOut, Calendar, X, MapPin, Pencil } from 'lucide-react';
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
  deleteLocation,
  createLocation,
  updateStoreTargetDate,
  getDefaultTargetDate,
  PREMADE_LOCATIONS,
} from '../lib/appwrite';

// Floating snowflakes component - full page coverage
function Snowflakes() {
  const snowflakes = Array.from({ length: 20 }, (_, i) => ({
    left: `${(i * 5) + Math.random() * 3}%`,
    delay: i * 0.8 + Math.random() * 2,
    duration: 12 + Math.random() * 8,
    size: 10 + Math.random() * 14,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {snowflakes.map((flake, i) => (
        <div
          key={i}
          className="absolute text-white/40 animate-snowfall opacity-0"
          style={{
            left: flake.left,
            top: '-30px',
            fontSize: `${flake.size}px`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
}

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

  // Track pending local updates to prevent real-time overwrites during rapid clicks
  const pendingUpdates = useRef<Map<string, { count: number; timestamp: number }>>(new Map());

  // Direct count editing state
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const [savingDate, setSavingDate] = useState(false);

  // Location management state
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [customLocationName, setCustomLocationName] = useState('');
  const [customLocationIcon, setCustomLocationIcon] = useState('📍');
  const [addingLocation, setAddingLocation] = useState(false);

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
      // Merge server data with any pending local updates to prevent race conditions
      const now = Date.now();
      const PENDING_TIMEOUT = 3000; // Consider updates stale after 3 seconds

      // Clean up stale pending updates
      pendingUpdates.current.forEach((update, itemId) => {
        if (now - update.timestamp > PENDING_TIMEOUT) {
          pendingUpdates.current.delete(itemId);
        }
      });

      // Apply pending updates on top of server data
      const mergedItems = itms.map(item => {
        const pending = pendingUpdates.current.get(item.$id);
        if (pending && now - pending.timestamp <= PENDING_TIMEOUT) {
          // Keep our local count if we have a recent pending update
          return { ...item, count: pending.count };
        }
        return item;
      });

      setItems(mergedItems);
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

  // Update item count (handles rapid clicks properly)
  const handleUpdateCount = async (itemId: string, currentCount: number, delta: number) => {
    // Check if there's a pending update - use that count instead of stale state
    const pending = pendingUpdates.current.get(itemId);
    const baseCount = pending ? pending.count : currentCount;
    const newCount = Math.max(0, baseCount + delta);

    // Track this update as pending
    pendingUpdates.current.set(itemId, { count: newCount, timestamp: Date.now() });

    // Optimistic update
    setItems(prev => prev.map(item =>
      item.$id === itemId ? { ...item, count: newCount } : item
    ));

    try {
      await updateItemCount(itemId, newCount);
      // Update timestamp on successful save
      const current = pendingUpdates.current.get(itemId);
      if (current && current.count === newCount) {
        // Clear pending if the count matches what we just saved
        pendingUpdates.current.delete(itemId);
      }
    } catch (error) {
      console.error('Failed to update count:', error);
      // Clear pending and revert on error
      pendingUpdates.current.delete(itemId);
      setItems(prev => prev.map(item =>
        item.$id === itemId ? { ...item, count: currentCount } : item
      ));
    }
  };

  // Handle direct count edit
  const handleStartEdit = (item: Item) => {
    setEditingItem(item.$id);
    setEditValue(item.count.toString());
  };

  const handleSaveEdit = async (itemId: string, originalCount: number) => {
    const newCount = Math.max(0, parseInt(editValue, 10) || 0);
    setEditingItem(null);

    if (newCount === originalCount) return;

    // Track as pending
    pendingUpdates.current.set(itemId, { count: newCount, timestamp: Date.now() });

    // Optimistic update
    setItems(prev => prev.map(item =>
      item.$id === itemId ? { ...item, count: newCount } : item
    ));

    try {
      await updateItemCount(itemId, newCount);
      pendingUpdates.current.delete(itemId);
    } catch (error) {
      console.error('Failed to update count:', error);
      pendingUpdates.current.delete(itemId);
      setItems(prev => prev.map(item =>
        item.$id === itemId ? { ...item, count: originalCount } : item
      ));
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditValue('');
  };

  // Add new location (premade or custom)
  const handleAddLocation = async (name: string, icon: string) => {
    setAddingLocation(true);
    try {
      const nextOrder = locations.length > 0
        ? Math.max(...locations.map(l => l.order)) + 1
        : 0;
      await createLocation(storeNumber, name, icon, nextOrder);
      setCustomLocationName('');
      setCustomLocationIcon('📍');
    } catch (error) {
      console.error('Failed to add location:', error);
      alert('Failed to add location. Please try again.');
    } finally {
      setAddingLocation(false);
    }
  };

  // Remove location
  const handleRemoveLocation = async (locationId: string, locationName: string) => {
    const locationItems = items.filter(item => item.locationId === locationId);

    let confirmMessage = `Remove "${locationName}"?`;
    if (locationItems.length > 0) {
      confirmMessage = `Remove "${locationName}" and its ${locationItems.length} item(s)? This cannot be undone.`;
    }

    if (!window.confirm(confirmMessage)) return;

    // First delete all items in this location
    try {
      for (const item of locationItems) {
        await deleteItem(item.$id);
      }
      await deleteLocation(locationId);
    } catch (error) {
      console.error('Failed to delete location:', error);
      alert('Failed to delete location. Please try again.');
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
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin h-12 w-12 border-4 border-red-500 border-t-green-500 rounded-full mx-auto mb-4"></div>
            <span className="absolute inset-0 flex items-center justify-center text-2xl">🎄</span>
          </div>
          <p className="text-slate-600">Loading store {storeNumber}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans pb-40 relative">
      {/* Full-page festive gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-red-700 via-red-600/80 to-green-700 z-0">
        <Snowflakes />
      </div>
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

      {/* Location Management Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MapPin size={20} className="text-blue-600" />
                Manage Locations
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {/* Current Locations */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">Current Locations</h4>
                <div className="space-y-2">
                  {locations.map(loc => (
                    <div key={loc.$id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{loc.icon}</span>
                        <span className="font-medium text-slate-700">{loc.name}</span>
                        <span className="text-xs text-slate-400">
                          ({items.filter(i => i.locationId === loc.$id).length} items)
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveLocation(loc.$id, loc.name)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove location"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {locations.length === 0 && (
                    <p className="text-slate-400 text-sm italic text-center py-2">No locations yet</p>
                  )}
                </div>
              </div>

              {/* Add Premade Location */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">Add Location</h4>
                <div className="grid grid-cols-2 gap-2">
                  {PREMADE_LOCATIONS.filter(
                    pl => !locations.some(l => l.name === pl.name)
                  ).map(pl => (
                    <button
                      key={pl.name}
                      onClick={() => handleAddLocation(pl.name, pl.icon)}
                      disabled={addingLocation}
                      className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50"
                    >
                      <span className="text-lg">{pl.icon}</span>
                      <span className="text-sm font-medium text-slate-700">{pl.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Location */}
              <div>
                <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">Custom Location</h4>
                <div className="flex gap-2">
                  <select
                    value={customLocationIcon}
                    onChange={(e) => setCustomLocationIcon(e.target.value)}
                    className="w-16 px-2 py-2 border border-slate-200 rounded-lg text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    <option value="📍">📍</option>
                    <option value="🏬">🏬</option>
                    <option value="🏪">🏪</option>
                    <option value="📦">📦</option>
                    <option value="🚛">🚛</option>
                    <option value="🎄">🎄</option>
                    <option value="⭐">⭐</option>
                    <option value="🔷">🔷</option>
                    <option value="🟢">🟢</option>
                    <option value="🟡">🟡</option>
                  </select>
                  <input
                    type="text"
                    value={customLocationName}
                    onChange={(e) => setCustomLocationName(e.target.value)}
                    placeholder="Location name..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                    maxLength={30}
                  />
                  <button
                    onClick={() => customLocationName.trim() && handleAddLocation(customLocationName.trim(), customLocationIcon)}
                    disabled={!customLocationName.trim() || addingLocation}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowLocationModal(false)}
                className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header background accent */}
      <div className="fixed top-0 left-0 w-full h-32 bg-black/10 rounded-b-[2.5rem] z-[1] overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-5 text-white">
          <div>
            <h1 className="text-2xl font-extrabold drop-shadow-md flex items-center">
              <TreePine className="mr-2 text-green-300" /> Pallet Tracker
            </h1>
            <p className="text-red-100 text-xs font-medium opacity-90 pl-1">
              Store #{storeNumber}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Target Date Button - More Obvious */}
            <button
              onClick={openDatePicker}
              className="bg-white/25 backdrop-blur-sm rounded-lg px-3 py-1.5 text-center border-2 border-white/40 shadow-lg hover:bg-white/35 hover:border-white/60 transition-all group animate-pulse-slow"
              title="Tap to change target date"
            >
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-yellow-300 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase font-bold text-white tracking-wider">Target</span>
              </div>
              <div className="text-lg font-black leading-none flex items-center justify-center gap-1">
                {formatTargetDate(targetDate)}
                <Pencil size={10} className="opacity-60" />
              </div>
              <div className="text-[9px] text-yellow-200 font-semibold">{daysRemaining} days left</div>
            </button>
            {/* Manage Locations Button */}
            <button
              onClick={() => setShowLocationModal(true)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Manage Locations"
            >
              <MapPin size={20} />
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
              <div key={loc.$id} className="bg-white/95 rounded-xl shadow-md border border-slate-100 overflow-hidden relative">
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
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-red-500 active:bg-red-50 touch-manipulation border border-slate-200"
                        >
                          <Minus size={16} strokeWidth={3} />
                        </button>

                        {editingItem === item.$id ? (
                          <div className="flex items-center">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(item.$id, item.count);
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                              onBlur={() => handleSaveEdit(item.$id, item.count)}
                              autoFocus
                              className="w-14 text-center font-bold text-slate-800 text-lg tabular-nums bg-white border-2 border-blue-500 rounded-md px-1 py-0 focus:outline-none"
                              min="0"
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="w-10 text-center font-bold text-slate-800 text-lg tabular-nums hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                            title="Tap to edit count"
                          >
                            {item.count}
                          </button>
                        )}

                        <button
                          onClick={() => handleUpdateCount(item.$id, item.count, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-green-600 rounded-md shadow-sm text-white active:bg-green-700 touch-manipulation border border-green-700"
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
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-[0_-5px_30px_-5px_rgba(0,0,0,0.15)] z-50 pb-safe">
        {/* Festive top border */}
        <div className="h-1 bg-gradient-to-r from-red-500 via-green-500 to-red-500"></div>
        <div className="max-w-lg mx-auto">
          {/* Section 1: Type Breakdown */}
          <div className="flex justify-between items-center px-4 py-2 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-100 h-10">
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
