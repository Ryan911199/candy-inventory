import { PalletType, CategoryId, CATEGORIES } from '../../lib/holidays';

interface InventoryFooterProps {
  itemTypes: Record<string, PalletType>;
  typeTotals: Record<string, number>;
  grandTotal: number;
  rates: {
    totalPerDay: string;
    primaryPerDay: string;
  };
  primaryType: PalletType | undefined;
  category: CategoryId;
  theme: {
    footerBorder: string;
    statsPrimaryBg: string;
    statsPrimaryText: string;
    statsSecondaryBg: string;
    statsSecondaryText: string;
  };
}

/**
 * Fixed footer showing inventory stats and daily rates
 */
export function InventoryFooter({
  itemTypes,
  typeTotals,
  grandTotal,
  rates,
  primaryType,
  category,
  theme,
}: InventoryFooterProps) {
  const categoryInfo = CATEGORIES[category];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-[0_-5px_30px_-5px_rgba(0,0,0,0.15)] z-50 pb-safe">
      {/* Festive top border - dynamic based on holiday */}
      <div className={`h-1 bg-gradient-to-r ${theme.footerBorder}`}></div>
      <div className="max-w-lg mx-auto">
        {/* Section 1: Type Breakdown - Dynamic based on category pallet types */}
        <div className="flex justify-center items-center px-4 py-2 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-100 h-10 overflow-x-auto gap-4">
          {Object.entries(itemTypes).map(([key, palletType], index) => (
            <div key={key} className="flex items-center">
              {index > 0 && <div className="w-px h-4 bg-slate-300 mr-4"></div>}
              <div className="flex items-center space-x-1.5 whitespace-nowrap">
                <span className="text-sm">{palletType.icon}</span>
                <span className="text-xs uppercase font-bold text-slate-500">{palletType.name.slice(0, 6)}:</span>
                <span className="font-bold text-slate-800 text-sm">{typeTotals[key] || 0}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Section 2: Goals & Stats */}
        <div className="px-3 py-2 bg-white h-20">
          <div className="grid grid-cols-3 gap-2 h-full">
            {/* Grand Total */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tight leading-none mb-1 flex items-center gap-1">
                {categoryInfo.name} Total
              </span>
              <span className="text-xl font-black text-slate-800 leading-none">{grandTotal}</span>
            </div>

            {/* Primary Type Per Day Goal */}
            <div className={`${theme.statsPrimaryBg} border rounded-lg flex flex-col items-center justify-center shadow-sm`}>
              <span className={`text-[10px] uppercase font-bold ${theme.statsPrimaryText} tracking-tight leading-none mb-1 flex items-center gap-1`}>
                <span className="text-base">{primaryType?.icon || categoryInfo.icon}</span> {(primaryType?.name || 'Items').slice(0, 5)}/Day
              </span>
              <span className={`text-xl font-black ${theme.statsPrimaryText} leading-none`}>{rates.primaryPerDay}</span>
            </div>

            {/* Total Per Day Goal */}
            <div className={`${theme.statsSecondaryBg} border rounded-lg flex flex-col items-center justify-center shadow-sm`}>
              <span className={`text-[10px] uppercase font-bold ${theme.statsSecondaryText} tracking-tight leading-none mb-1 flex items-center gap-1`}>
                <span className="text-base">{categoryInfo.icon}</span> Total/Day
              </span>
              <span className={`text-xl font-black ${theme.statsSecondaryText} leading-none`}>{rates.totalPerDay}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
