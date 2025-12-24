import { useState, useEffect } from 'react';
import { 
  HolidayId, 
  CategoryId, 
  HOLIDAYS, 
  CATEGORIES,
  getCandyPalletTypes,
  getGMPalletTypes,
  getPrimaryPalletType,
} from '../lib/holidays';
import { useInventoryData, useItemOperations } from '../hooks';
import {
  FloatingDecor,
  DatePickerModal,
  LocationModal,
  InventoryCard,
  InventoryFooter,
  InventoryHeader,
} from './inventory';

interface CategoryInventoryProps {
  storeNumber: string;
  holidayId: HolidayId;
  category: CategoryId;
  onLogout: () => void;
  onSwitchHoliday: () => void;
  onBack: () => void;
}

export default function CategoryInventory({ 
  storeNumber, 
  holidayId, 
  category,
  onLogout, 
  onSwitchHoliday,
  // onBack is kept in props for API compatibility but navigation is now handled by tabs
}: CategoryInventoryProps) {
  // Get holiday and category configuration
  const holiday = HOLIDAYS[holidayId];
  const { theme } = holiday;
  const categoryInfo = CATEGORIES[category];
  
  // Get pallet types for this category
  const ITEM_TYPES = category === 'candy' 
    ? getCandyPalletTypes(holidayId) 
    : getGMPalletTypes(holidayId);

  // Get primary pallet type info for stats display
  const primaryTypeKey = getPrimaryPalletType(holidayId, category);
  const primaryType = ITEM_TYPES[primaryTypeKey];

  // Use custom hooks for data and operations
  const {
    store,
    locations,
    items,
    loading,
    targetDate,
    stats,
    getLocationItems,
    setItems,
    pendingUpdates,
  } = useInventoryData(storeNumber, holidayId, category);

  const {
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
  } = useItemOperations({
    storeNumber,
    holidayId,
    category,
    setItems,
    pendingUpdates,
    itemTypes: ITEM_TYPES,
  });

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState('');

  // Location management state
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Ticker to refresh relative timestamps every 45 seconds
  const [, setTick] = useState(0);

  // Refresh relative timestamps every 45 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // Open date picker
  const openDatePicker = () => {
    setTempDate(targetDate);
    setShowDatePicker(true);
  };

  // Handle save date
  const onSaveDateClick = async () => {
    if (!store || !tempDate) return;
    const success = await handleSaveDate(store.$id, tempDate);
    if (success) {
      setShowDatePicker(false);
    }
  };

  // Handle add location wrapper
  const onAddLocation = async (name: string, icon: string) => {
    await handleAddLocation(name, icon, locations.length);
  };



  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-b ${theme.gradientFrom} ${theme.gradientTo} flex items-center justify-center`}>
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin h-12 w-12 border-4 border-white/50 border-t-white rounded-full mx-auto mb-4"></div>
            <span className="absolute inset-0 flex items-center justify-center text-2xl">{categoryInfo.icon}</span>
          </div>
          <p className="text-white/80">Loading {categoryInfo.name}...</p>
        </div>
      </div>
    );
  }

  // Get gradient classes based on holiday theme
  const gradientClass = `${theme.gradientFrom} ${theme.gradientVia} ${theme.gradientTo}`;

  return (
    <div className="min-h-screen font-sans pb-40 relative">
      {/* Full-page festive gradient background */}
      <div className={`fixed inset-0 bg-gradient-to-b ${gradientClass} z-0`}>
        <FloatingDecor holidayId={holidayId} />
      </div>
      
      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={showDatePicker}
        storeNumber={storeNumber}
        tempDate={tempDate}
        onTempDateChange={setTempDate}
        onSave={onSaveDateClick}
        onClose={() => setShowDatePicker(false)}
        saving={savingDate}
      />

      {/* Location Management Modal */}
      <LocationModal
        isOpen={showLocationModal}
        locations={locations}
        items={items}
        onClose={() => setShowLocationModal(false)}
        onAddLocation={onAddLocation}
        onRemoveLocation={handleRemoveLocation}
        addingLocation={addingLocation}
      />

      {/* Header background accent */}
      <div className="fixed top-0 left-0 w-full h-36 bg-black/10 rounded-b-[2.5rem] z-[1] overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4">
        {/* Header */}
        <InventoryHeader
          storeNumber={storeNumber}
          holiday={holiday}
          targetDate={targetDate}
          daysRemaining={stats.daysRemaining}
          onOpenDatePicker={openDatePicker}
          onOpenLocationModal={() => setShowLocationModal(true)}
          onLogout={onLogout}
          onSwitchHoliday={onSwitchHoliday}
        />

        {/* Inventory Cards */}
        <div className="space-y-3">
          {locations.map((loc) => (
            <InventoryCard
              key={loc.$id}
              location={loc}
              items={getLocationItems(loc.$id)}
              itemTypes={ITEM_TYPES}
              isMenuOpen={openMenus.has(loc.$id)}
              onToggleMenu={() => toggleAddMenu(loc.$id)}
              onAddItem={(typeKey) => handleAddItem(loc.$id, typeKey)}
              onUpdateCount={handleUpdateCount}
              onRemoveItem={handleRemoveItem}
              editingItem={editingItem}
              editValue={editValue}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onEditValueChange={setEditValue}
            />
          ))}
        </div>
      </div>

      {/* Fixed Footer */}
      <InventoryFooter
        itemTypes={ITEM_TYPES}
        typeTotals={stats.typeTotals}
        grandTotal={stats.grandTotal}
        rates={stats.rates}
        primaryType={primaryType}
        category={category}
        theme={theme}
      />
    </div>
  );
}
