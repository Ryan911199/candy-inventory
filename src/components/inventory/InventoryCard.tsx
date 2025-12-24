import { Minus, Plus, Trash2 } from 'lucide-react';
import { Location, Item } from '../../lib/appwrite';
import { PalletType } from '../../lib/holidays';
import { formatLastUpdated } from '../../lib/dateUtils';

interface InventoryCardProps {
  location: Location;
  items: Item[];
  itemTypes: Record<string, PalletType>;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onAddItem: (typeKey: string) => void;
  onUpdateCount: (itemId: string, currentCount: number, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  // Direct edit props
  editingItem: string | null;
  editValue: string;
  onStartEdit: (item: Item) => void;
  onSaveEdit: (itemId: string, originalCount: number) => void;
  onCancelEdit: () => void;
  onEditValueChange: (value: string) => void;
}

/**
 * Card component for a single location showing its items
 */
export function InventoryCard({
  location,
  items,
  itemTypes,
  isMenuOpen,
  onToggleMenu,
  onAddItem,
  onUpdateCount,
  onRemoveItem,
  editingItem,
  editValue,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditValueChange,
}: InventoryCardProps) {
  return (
    <div className="bg-white/95 rounded-xl shadow-md border border-slate-100 overflow-hidden relative">
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-xl mr-2">{location.icon}</span>
          <h2 className="font-bold text-slate-700 text-sm md:text-base">{location.name}</h2>
        </div>
        <button
          onClick={onToggleMenu}
          className={`text-xs font-bold px-2 py-1 rounded transition-colors ${isMenuOpen ? 'bg-slate-200 text-slate-600' : 'bg-white border text-blue-600'}`}
        >
          {isMenuOpen ? 'Close' : '+ Add Item'}
        </button>
      </div>

      {/* Add Item Menu (Collapsible) */}
      {isMenuOpen && (
        <div className="bg-slate-100 p-2 flex flex-wrap justify-center gap-2 border-b border-slate-200 animate-in">
          {Object.entries(itemTypes).map(([key, palletType]) => (
            <button
              key={key}
              onClick={() => onAddItem(key)}
              className="flex flex-col items-center bg-white p-2 rounded-lg shadow-sm w-20 active:scale-95 transition-transform"
            >
              <span className="text-lg">{palletType.icon}</span>
              <span className="text-[10px] font-bold text-slate-600">{palletType.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="p-3 space-y-3">
        {items.map((item) => (
          <div key={item.$id} className="flex items-center justify-between group">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onRemoveItem(item.$id)}
                className="text-slate-300 hover:text-red-400 p-1 -ml-1 transition-colors"
                aria-label="Remove item"
              >
                <Trash2 size={14} />
              </button>
              <span className="text-xl" role="img" aria-label={item.name}>{item.icon}</span>
              <div className="flex flex-col">
                <span className="text-slate-700 font-bold text-sm">{item.name}</span>
                {formatLastUpdated(item.updatedAt) && (
                  <span className="text-[10px] text-slate-400 leading-tight">
                    {formatLastUpdated(item.updatedAt)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 shadow-inner">
              <button
                onClick={() => onUpdateCount(item.$id, item.count, -1)}
                className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-red-500 active:bg-red-50 touch-manipulation border border-slate-200"
              >
                <Minus size={16} strokeWidth={3} />
              </button>

              {editingItem === item.$id ? (
                <div className="flex items-center">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => onEditValueChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSaveEdit(item.$id, item.count);
                      if (e.key === 'Escape') onCancelEdit();
                    }}
                    onBlur={() => onSaveEdit(item.$id, item.count)}
                    autoFocus
                    className="w-14 text-center font-bold text-slate-800 text-lg tabular-nums bg-white border-2 border-blue-500 rounded-md px-1 py-0 focus:outline-none"
                    min="0"
                  />
                </div>
              ) : (
                <button
                  onClick={() => onStartEdit(item)}
                  className="w-10 text-center font-bold text-slate-800 text-lg tabular-nums hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                  title="Tap to edit count"
                >
                  {item.count}
                </button>
              )}

              <button
                onClick={() => onUpdateCount(item.$id, item.count, 1)}
                className="w-8 h-8 flex items-center justify-center bg-green-600 rounded-md shadow-sm text-white active:bg-green-700 touch-manipulation border border-green-700"
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && !isMenuOpen && (
          <div className="text-center py-2 text-slate-400 text-xs italic">
            No items tracked here. Tap "+ Add Item" to start.
          </div>
        )}
      </div>
    </div>
  );
}
