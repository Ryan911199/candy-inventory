import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { HolidayId, HOLIDAYS } from '../lib/holidays';

interface StoreSelectProps {
  onStoreSelect: (storeNumber: string) => void;
  isLoading: boolean;
  holidayId: HolidayId;
  onSwitchHoliday: () => void;
}

export default function StoreSelect({ onStoreSelect, isLoading, holidayId, onSwitchHoliday }: StoreSelectProps) {
  const [storeNumber, setStoreNumber] = useState('');
  const [error, setError] = useState('');
  
  const holiday = HOLIDAYS[holidayId];
  const { theme } = holiday;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (storeNumber.length !== 4) {
      setError('Please enter a 4-digit store number');
      return;
    }

    if (!/^\d{4}$/.test(storeNumber)) {
      setError('Store number must be 4 digits');
      return;
    }

    setError('');
    onStoreSelect(storeNumber);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setStoreNumber(value);
    if (error) setError('');
  };

  // Dynamic gradient based on holiday
  const gradientClass = `${theme.gradientFrom} ${theme.gradientVia} ${theme.gradientTo}`;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${gradientClass} flex flex-col items-center justify-center p-4`}>
      {/* Back button */}
      <button
        onClick={onSwitchHoliday}
        className="absolute top-4 left-4 flex items-center gap-1 text-white/80 hover:text-white transition-colors z-10"
      >
        <ChevronLeft size={20} />
        <span className="text-sm font-medium">Change Holiday</span>
      </button>

      {/* Decorative elements based on holiday */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {holidayId === 'christmas' && (
          <>
            <div className="absolute top-10 left-10 text-white/20 text-4xl">*</div>
            <div className="absolute top-20 right-16 text-white/15 text-2xl">*</div>
            <div className="absolute bottom-32 left-20 text-white/10 text-3xl">*</div>
            <div className="absolute bottom-20 right-10 text-white/20 text-3xl">*</div>
          </>
        )}
        {holidayId === 'valentines' && (
          <>
            <div className="absolute top-10 left-10 text-white/20 text-3xl animate-pulse">&#10084;</div>
            <div className="absolute top-24 right-12 text-white/15 text-2xl animate-pulse" style={{ animationDelay: '0.3s' }}>&#10084;</div>
            <div className="absolute bottom-28 left-16 text-white/10 text-2xl animate-pulse" style={{ animationDelay: '0.6s' }}>&#10084;</div>
            <div className="absolute bottom-16 right-8 text-white/20 text-3xl animate-pulse" style={{ animationDelay: '0.9s' }}>&#10084;</div>
          </>
        )}
        {holidayId === 'easter' && (
          <>
            <div className="absolute top-10 left-10 text-white/20 text-3xl">&#128048;</div>
            <div className="absolute top-20 right-16 text-white/15 text-2xl">&#128049;</div>
            <div className="absolute bottom-32 left-20 text-white/10 text-2xl">&#129370;</div>
            <div className="absolute bottom-20 right-10 text-white/20 text-2xl">&#129370;</div>
          </>
        )}
        {holidayId === 'halloween' && (
          <>
            <div className="absolute top-10 left-10 text-white/20 text-3xl">&#127875;</div>
            <div className="absolute top-20 right-16 text-white/15 text-2xl">&#128123;</div>
            <div className="absolute bottom-32 left-20 text-white/10 text-2xl">&#129415;</div>
            <div className="absolute bottom-20 right-10 text-white/20 text-2xl">&#127875;</div>
          </>
        )}
      </div>

      {/* Main card */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full relative overflow-hidden">
        {/* Top decoration - matches holiday theme */}
        <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${theme.footerBorder}`}></div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${
              holidayId === 'christmas' ? 'bg-green-100' :
              holidayId === 'valentines' ? 'bg-pink-100' :
              holidayId === 'easter' ? 'bg-purple-100' :
              'bg-orange-100'
            }`}>
              <span className="text-5xl">{holiday.icon}</span>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 mb-2">
            Liability Tracker
          </h1>
          <p className="text-slate-500 text-sm">
            {holiday.description}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Enter Your Store Number
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={storeNumber}
            onChange={handleChange}
            placeholder="0000"
            className={`w-full text-center text-4xl font-bold tracking-[0.5em] py-4 px-6 border-2 border-slate-200 rounded-xl focus:ring-4 outline-none transition-all placeholder:text-slate-300 placeholder:tracking-[0.5em] ${
              holidayId === 'christmas' ? 'focus:border-green-500 focus:ring-green-100' :
              holidayId === 'valentines' ? 'focus:border-pink-500 focus:ring-pink-100' :
              holidayId === 'easter' ? 'focus:border-purple-500 focus:ring-purple-100' :
              'focus:border-orange-500 focus:ring-orange-100'
            }`}
            maxLength={4}
            autoFocus
            disabled={isLoading}
          />

          {error && (
            <p className="text-red-500 text-sm mt-2 text-center font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={storeNumber.length !== 4 || isLoading}
            className={`w-full mt-6 text-white font-bold py-4 px-6 rounded-xl shadow-lg disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all active:scale-[0.98] touch-manipulation ${
              holidayId === 'christmas' ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' :
              holidayId === 'valentines' ? 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700' :
              holidayId === 'easter' ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700' :
              'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading Store...
              </span>
            ) : (
              'Enter Store'
            )}
          </button>
        </form>

        {/* Footer hint */}
        <p className="text-center text-slate-400 text-xs mt-6">
          Your store data syncs in real-time across all devices
        </p>
      </div>

      {/* App info */}
      <p className="text-white/60 text-xs mt-8">
        {holiday.name} Liability Tracking
      </p>
    </div>
  );
}
