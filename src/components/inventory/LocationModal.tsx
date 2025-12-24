import { useState } from 'react';
import { MapPin, X, Trash2 } from 'lucide-react';
import { Location, Item, PREMADE_LOCATIONS } from '../../lib/appwrite';

interface LocationModalProps {
  isOpen: boolean;
  locations: Location[];
  items: Item[];
  onClose: () => void;
  onAddLocation: (name: string, icon: string) => Promise<void>;
  onRemoveLocation: (locationId: string, locationName: string, locationItems: Item[]) => Promise<void>;
  addingLocation: boolean;
}

const ICON_OPTIONS = ['📍', '🏬', '🏪', '📦', '🚛', '🎄', '⭐', '🔷', '🟢', '🟡'];

/**
 * Modal for managing store locations (add/remove)
 */
export function LocationModal({
  isOpen,
  locations,
  items,
  onClose,
  onAddLocation,
  onRemoveLocation,
  addingLocation,
}: LocationModalProps) {
  const [customLocationName, setCustomLocationName] = useState('');
  const [customLocationIcon, setCustomLocationIcon] = useState('📍');

  if (!isOpen) return null;

  const handleAddCustomLocation = async () => {
    if (!customLocationName.trim()) return;
    await onAddLocation(customLocationName.trim(), customLocationIcon);
    setCustomLocationName('');
    setCustomLocationIcon('📍');
  };

  const getLocationItemCount = (locationId: string) => {
    return items.filter(i => i.locationId === locationId).length;
  };

  const getLocationItems = (locationId: string) => {
    return items.filter(i => i.locationId === locationId);
  };

  // Filter out premade locations that already exist
  const availablePremadeLocations = PREMADE_LOCATIONS.filter(
    pl => !locations.some(l => l.name === pl.name)
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <MapPin size={20} className="text-blue-600" />
            Manage Locations
          </h3>
          <button
            onClick={onClose}
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
                      ({getLocationItemCount(loc.$id)} items)
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveLocation(loc.$id, loc.name, getLocationItems(loc.$id))}
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
          {availablePremadeLocations.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">Add Location</h4>
              <div className="grid grid-cols-2 gap-2">
                {availablePremadeLocations.map(pl => (
                  <button
                    key={pl.name}
                    onClick={() => onAddLocation(pl.name, pl.icon)}
                    disabled={addingLocation}
                    className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50"
                  >
                    <span className="text-lg">{pl.icon}</span>
                    <span className="text-sm font-medium text-slate-700">{pl.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Location */}
          <div>
            <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">Custom Location</h4>
            <div className="flex gap-2">
              <select
                value={customLocationIcon}
                onChange={(e) => setCustomLocationIcon(e.target.value)}
                className="w-16 px-2 py-2 border border-slate-200 rounded-lg text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                {ICON_OPTIONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
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
                onClick={handleAddCustomLocation}
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
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
