import { useCallback, useState } from 'react';
import {
  Item,
  createItem,
  updateItemCount,
  deleteItem,
  deleteLocation,
  createLocation,
  updateStoreTargetDate,
} from '../lib/appwrite';
import { HolidayId, CategoryId, PalletType } from '../lib/holidays';
import { usePendingUpdates } from './usePendingUpdates';

interface UseItemOperationsProps {
  storeNumber: string;
  holidayId: HolidayId;
  category: CategoryId;
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  pendingUpdates: ReturnType<typeof usePendingUpdates>;
  itemTypes: Record<string, PalletType>;
}

interface UseItemOperationsResult {
  // Item operations
  handleAddItem: (locationId: string, typeKey: string) => Promise<void>;
  handleUpdateCount: (itemId: string, currentCount: number, delta: number) => Promise<void>;
  handleRemoveItem: (itemId: string) => Promise<void>;
  
  // Direct edit operations
  editingItem: string | null;
  editValue: string;
  setEditValue: React.Dispatch<React.SetStateAction<string>>;
  handleStartEdit: (item: Item) => void;
  handleSaveEdit: (itemId: string, originalCount: number) => Promise<void>;
  handleCancelEdit: () => void;
  
  // Location operations
  handleAddLocation: (name: string, icon: string, locationsCount: number) => Promise<void>;
  handleRemoveLocation: (locationId: string, locationName: string, locationItems: Item[]) => Promise<void>;
  addingLocation: boolean;
  
  // Date operations
  handleSaveDate: (storeId: string, date: string) => Promise<boolean>;
  savingDate: boolean;
  
  // Menu state
  openMenus: Set<string>;
  toggleAddMenu: (locationId: string) => void;
}

/**
 * Hook for managing item CRUD operations with optimistic updates
 */
export function useItemOperations({
  storeNumber,
  holidayId,
  category,
  setItems,
  pendingUpdates,
  itemTypes,
}: UseItemOperationsProps): UseItemOperationsResult {
  // Menu state
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());
  
  // Direct count editing state
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Loading states
  const [addingLocation, setAddingLocation] = useState(false);
  const [savingDate, setSavingDate] = useState(false);

  // Toggle add menu
  const toggleAddMenu = useCallback((locationId: string) => {
    setOpenMenus(prev => {
      const next = new Set(prev);
      if (next.has(locationId)) {
        next.delete(locationId);
      } else {
        next.add(locationId);
      }
      return next;
    });
  }, []);

  // Add new item
  const handleAddItem = useCallback(async (locationId: string, typeKey: string) => {
    const template = itemTypes[typeKey];
    if (!template) return;
    
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
        0,
        holidayId,
        category
      );
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  }, [storeNumber, holidayId, category, itemTypes]);

  // Update item count (handles rapid clicks properly)
  const handleUpdateCount = useCallback(async (itemId: string, currentCount: number, delta: number) => {
    // Check if there's a pending update - use that count instead of stale state
    const baseCount = pendingUpdates.getEffectiveCount(itemId, currentCount);
    const newCount = Math.max(0, baseCount + delta);

    // Track this update as pending
    pendingUpdates.setPending(itemId, newCount);

    // Optimistic update
    setItems(prev => prev.map(item =>
      item.$id === itemId ? { ...item, count: newCount } : item
    ));

    try {
      await updateItemCount(itemId, newCount);
      // Clear pending if the count matches what we just saved
      pendingUpdates.clearIfMatches(itemId, newCount);
    } catch (error) {
      console.error('Failed to update count:', error);
      // Clear pending and revert on error
      pendingUpdates.clearPending(itemId);
      setItems(prev => prev.map(item =>
        item.$id === itemId ? { ...item, count: currentCount } : item
      ));
    }
  }, [setItems, pendingUpdates]);

  // Handle direct count edit
  const handleStartEdit = useCallback((item: Item) => {
    setEditingItem(item.$id);
    setEditValue(item.count.toString());
  }, []);

  const handleSaveEdit = useCallback(async (itemId: string, originalCount: number) => {
    const newCount = Math.max(0, parseInt(editValue, 10) || 0);
    setEditingItem(null);

    if (newCount === originalCount) return;

    // Track as pending
    pendingUpdates.setPending(itemId, newCount);

    // Optimistic update
    setItems(prev => prev.map(item =>
      item.$id === itemId ? { ...item, count: newCount } : item
    ));

    try {
      await updateItemCount(itemId, newCount);
      pendingUpdates.clearPending(itemId);
    } catch (error) {
      console.error('Failed to update count:', error);
      pendingUpdates.clearPending(itemId);
      setItems(prev => prev.map(item =>
        item.$id === itemId ? { ...item, count: originalCount } : item
      ));
    }
  }, [editValue, setItems, pendingUpdates]);

  const handleCancelEdit = useCallback(() => {
    setEditingItem(null);
    setEditValue('');
  }, []);

  // Add new location (premade or custom)
  const handleAddLocation = useCallback(async (name: string, icon: string, locationsCount: number) => {
    setAddingLocation(true);
    try {
      const nextOrder = locationsCount > 0 ? locationsCount : 0;
      await createLocation(storeNumber, name, icon, nextOrder);
    } catch (error) {
      console.error('Failed to add location:', error);
      alert('Failed to add location. Please try again.');
    } finally {
      setAddingLocation(false);
    }
  }, [storeNumber]);

  // Remove location
  const handleRemoveLocation = useCallback(async (locationId: string, locationName: string, locationItems: Item[]) => {
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
  }, []);

  // Remove item
  const handleRemoveItem = useCallback(async (itemId: string) => {
    if (!window.confirm("Remove this item slot?")) return;

    // Optimistic update
    setItems(prev => prev.filter(item => item.$id !== itemId));

    try {
      await deleteItem(itemId);
    } catch (error) {
      console.error('Failed to delete item:', error);
      // Could refetch items on error, but for now just log
    }
  }, [setItems]);

  // Save new target date
  const handleSaveDate = useCallback(async (storeId: string, date: string): Promise<boolean> => {
    setSavingDate(true);
    try {
      await updateStoreTargetDate(storeId, date);
      return true;
    } catch (error) {
      console.error('Failed to update target date:', error);
      alert('Failed to update target date. Please try again.');
      return false;
    } finally {
      setSavingDate(false);
    }
  }, []);

  return {
    handleAddItem,
    handleUpdateCount,
    handleRemoveItem,
    editingItem,
    editValue,
    setEditValue,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleAddLocation,
    handleRemoveLocation,
    addingLocation,
    handleSaveDate,
    savingDate,
    openMenus,
    toggleAddMenu,
  };
}

// Re-export for convenience
export { useItemOperations as default };
