import React, { useState } from 'react';

interface StoreSelectProps {
  onStoreSelect: (storeNumber: string) => void;
  isLoading: boolean;
}

export default function StoreSelect({ onStoreSelect, isLoading }: StoreSelectProps) {
  const [storeNumber, setStoreNumber] = useState('');
  const [error, setError] = useState('');

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900 flex flex-col items-center justify-center p-4">
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
              <span className="text-4xl">🏪</span>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 mb-2">
            Liability Tracker
          </h1>
          <p className="text-slate-500 text-sm">
            Enter your store number to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Store Number
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={storeNumber}
            onChange={handleChange}
            placeholder="0000"
            className="w-full text-center text-4xl font-bold tracking-[0.5em] py-4 px-6 border-2 border-slate-200 rounded-xl focus:ring-4 focus:border-blue-500 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300 placeholder:tracking-[0.5em]"
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
            className="w-full mt-6 text-white font-bold py-4 px-6 rounded-xl shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all active:scale-[0.98] touch-manipulation"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
            ) : (
              'Continue'
            )}
          </button>
        </form>

        {/* Footer hint */}
        <p className="text-center text-slate-400 text-xs mt-6">
          Your store data syncs in real-time across all devices
        </p>
      </div>

      {/* App info */}
      <p className="text-white/60 text-xs mt-8 z-10">
        Holiday Liability Tracking System
      </p>
    </div>
  );
}
