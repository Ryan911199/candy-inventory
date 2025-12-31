import { useCallback } from 'react';
import { ChevronLeft } from 'lucide-react';
import { HOLIDAYS, HOLIDAY_ORDER, HolidayId } from '../lib/holidays';
import { useDataCache } from '../context';

interface HolidaySelectProps {
  onHolidaySelect: (holidayId: HolidayId) => void;
  storeNumber: string;
  onSwitchStore: () => void;
}

export default function HolidaySelect({ onHolidaySelect, storeNumber, onSwitchStore }: HolidaySelectProps) {
  const dataCache = useDataCache();

  // Prefetch data for a holiday on hover - makes selection feel instant
  const prefetchHoliday = useCallback((holidayId: HolidayId) => {
    dataCache.preloadAllForHoliday(storeNumber, holidayId);
  }, [storeNumber, dataCache]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Back button */}
      <button
        onClick={onSwitchStore}
        className="absolute top-4 left-4 flex items-center gap-1 text-white/80 hover:text-white transition-colors z-20"
      >
        <ChevronLeft size={20} />
        <span className="text-sm font-medium">Change Store</span>
      </button>

      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-4xl opacity-20 animate-pulse">🎄</div>
        <div className="absolute top-20 right-16 text-3xl opacity-15 animate-pulse" style={{ animationDelay: '0.5s' }}>💝</div>
        <div className="absolute bottom-32 left-20 text-3xl opacity-15 animate-pulse" style={{ animationDelay: '1s' }}>🐰</div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-20 animate-pulse" style={{ animationDelay: '1.5s' }}>🎃</div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full relative overflow-hidden z-10">
        {/* Top decoration - multi-color for all holidays */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-pink-500 via-purple-500 to-orange-500"></div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-4 rounded-full shadow-inner">
              <span className="text-4xl">📦</span>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 mb-2">
            Store #{storeNumber}
          </h1>
          <p className="text-slate-500 text-sm">
            Select a holiday to track
          </p>
        </div>

        {/* Holiday Selection Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {HOLIDAY_ORDER.map((holidayId) => {
            const holiday = HOLIDAYS[holidayId];
            return (
              <button
                key={holidayId}
                onClick={() => onHolidaySelect(holidayId)}
                onMouseEnter={() => prefetchHoliday(holidayId)}
                onFocus={() => prefetchHoliday(holidayId)}
                className={`
                  relative flex flex-col items-center justify-center p-4 rounded-2xl
                  border-2 transition-all duration-200
                  hover:scale-105 active:scale-95 touch-manipulation
                  ${holidayId === 'christmas' ? 'bg-gradient-to-br from-red-50 to-green-50 border-red-200 hover:border-red-400 hover:shadow-lg hover:shadow-red-100' : ''}
                  ${holidayId === 'valentines' ? 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-100' : ''}
                  ${holidayId === 'easter' ? 'bg-gradient-to-br from-purple-50 to-yellow-50 border-purple-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-100' : ''}
                  ${holidayId === 'halloween' ? 'bg-gradient-to-br from-orange-50 to-purple-50 border-orange-200 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-100' : ''}
                `}
              >
                <span className="text-4xl mb-2">{holiday.icon}</span>
                <span className="font-bold text-slate-700 text-sm">{holiday.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <p className="text-center text-slate-400 text-xs">
          Each holiday tracks Candy & GM separately
        </p>
      </div>

      {/* App info */}
      <p className="text-white/60 text-xs mt-8 z-10">
        Holiday Liability Tracking System
      </p>
    </div>
  );
}
