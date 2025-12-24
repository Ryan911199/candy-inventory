import { Calendar, X } from 'lucide-react';

interface DatePickerModalProps {
  isOpen: boolean;
  storeNumber: string;
  tempDate: string;
  onTempDateChange: (date: string) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}

/**
 * Modal for selecting/changing the target date
 */
export function DatePickerModal({
  isOpen,
  storeNumber,
  tempDate,
  onTempDateChange,
  onSave,
  onClose,
  saving,
}: DatePickerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar size={20} className="text-red-600" />
            Set Target Date
          </h3>
          <button
            onClick={onClose}
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
          onChange={(e) => onTempDateChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-lg font-medium focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
        />

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || !tempDate}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Date'}
          </button>
        </div>
      </div>
    </div>
  );
}
