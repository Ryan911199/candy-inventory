// Holiday Configuration System
// Defines themes, pallet types, and default settings for each holiday
// Supports Candy and GM (General Merchandise) categories

export type HolidayId = 'christmas' | 'valentines' | 'easter' | 'halloween';
export type CategoryId = 'candy' | 'gm';

export interface PalletType {
  name: string;
  type: string;
  icon: string;
  category: CategoryId;
  isGeneric: boolean; // true = available for all holidays, false = holiday-specific
}

export interface HolidayTheme {
  // Core colors (Tailwind classes)
  primary: string;        // Main brand color (e.g., "red" for Christmas)
  secondary: string;      // Secondary color (e.g., "green" for Christmas)
  accent: string;         // Accent/highlight color
  
  // Gradient backgrounds
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  
  // UI element colors
  headerBg: string;
  cardBg: string;
  buttonPrimary: string;
  buttonSecondary: string;
  
  // Footer colors
  footerBorder: string;
  statsPrimaryBg: string;
  statsPrimaryText: string;
  statsSecondaryBg: string;
  statsSecondaryText: string;
}

export interface HolidayConfig {
  id: HolidayId;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  
  // Visual theme
  theme: HolidayTheme;
  
  // Default target date (month-day format, e.g., "12-22" - 3 days before holiday)
  defaultTargetDate: string;
  
  // Decorative animation type
  animationType: 'snowfall' | 'hearts' | 'eggs' | 'bats' | 'none';
  
  // Default seasonal floor icon
  seasonalFloorIcon: string;
}

// ============================================
// GENERIC PALLET TYPES (Available for all holidays)
// ============================================

export const GENERIC_CANDY_PALLETS: Record<string, PalletType> = {
  candy: { name: 'Candy', type: 'candy', icon: '🍬', category: 'candy', isGeneric: true },
  candy_feature: { name: 'Feature', type: 'candy_feature', icon: '⭐', category: 'candy', isGeneric: true },
};

export const GENERIC_GM_PALLETS: Record<string, PalletType> = {
  gm_sidecounter: { name: 'Sidecounter', type: 'gm_sidecounter', icon: '🗄️', category: 'gm', isGeneric: true },
  gm_feature: { name: 'Feature', type: 'gm_feature', icon: '⭐', category: 'gm', isGeneric: true },
};

// ============================================
// HOLIDAY-SPECIFIC PALLET TYPES
// ============================================

export const CHRISTMAS_CANDY_PALLETS: Record<string, PalletType> = {
  popcorn: { name: 'Popcorn', type: 'popcorn', icon: '🍿', category: 'candy', isGeneric: false },
  gingerbread: { name: 'Gingerbread', type: 'gingerbread', icon: '🍪', category: 'candy', isGeneric: false },
};

export const CHRISTMAS_GM_PALLETS: Record<string, PalletType> = {
  // Add Christmas-specific GM pallets here as needed
};

export const VALENTINES_CANDY_PALLETS: Record<string, PalletType> = {
  // Add Valentine's-specific candy pallets here as needed
};

export const VALENTINES_GM_PALLETS: Record<string, PalletType> = {
  // Add Valentine's-specific GM pallets here as needed
};

export const EASTER_CANDY_PALLETS: Record<string, PalletType> = {
  // Add Easter-specific candy pallets here as needed
};

export const EASTER_GM_PALLETS: Record<string, PalletType> = {
  // Add Easter-specific GM pallets here as needed
};

export const HALLOWEEN_CANDY_PALLETS: Record<string, PalletType> = {
  // Add Halloween-specific candy pallets here as needed
};

export const HALLOWEEN_GM_PALLETS: Record<string, PalletType> = {
  // Add Halloween-specific GM pallets here as needed
};

// ============================================
// HOLIDAY CONFIGURATIONS
// ============================================

// Christmas Configuration
const christmasConfig: HolidayConfig = {
  id: 'christmas',
  name: 'Christmas',
  shortName: 'Xmas',
  icon: '🎄',
  description: 'Christmas Liability Tracking',
  theme: {
    primary: 'red',
    secondary: 'green',
    accent: 'yellow',
    gradientFrom: 'from-red-700',
    gradientVia: 'via-red-600/80',
    gradientTo: 'to-green-700',
    headerBg: 'bg-black/10',
    cardBg: 'bg-white/95',
    buttonPrimary: 'bg-green-600 hover:bg-green-700',
    buttonSecondary: 'bg-red-600 hover:bg-red-700',
    footerBorder: 'from-red-500 via-green-500 to-red-500',
    statsPrimaryBg: 'bg-red-50 border-red-100',
    statsPrimaryText: 'text-red-600',
    statsSecondaryBg: 'bg-green-50 border-green-100',
    statsSecondaryText: 'text-green-700',
  },
  defaultTargetDate: '12-21', // 4 days before Dec 25
  animationType: 'snowfall',
  seasonalFloorIcon: '🎄',
};

// Valentine's Day Configuration
const valentinesConfig: HolidayConfig = {
  id: 'valentines',
  name: "Valentine's Day",
  shortName: "V-Day",
  icon: '💝',
  description: "Valentine's Day Liability Tracking",
  theme: {
    primary: 'pink',
    secondary: 'red',
    accent: 'rose',
    gradientFrom: 'from-pink-600',
    gradientVia: 'via-rose-500/80',
    gradientTo: 'to-red-600',
    headerBg: 'bg-black/10',
    cardBg: 'bg-white/95',
    buttonPrimary: 'bg-pink-600 hover:bg-pink-700',
    buttonSecondary: 'bg-red-500 hover:bg-red-600',
    footerBorder: 'from-pink-500 via-red-500 to-pink-500',
    statsPrimaryBg: 'bg-pink-50 border-pink-100',
    statsPrimaryText: 'text-pink-600',
    statsSecondaryBg: 'bg-red-50 border-red-100',
    statsSecondaryText: 'text-red-600',
  },
  defaultTargetDate: '02-10', // 4 days before Feb 14
  animationType: 'hearts',
  seasonalFloorIcon: '💝',
};

// Easter Configuration
const easterConfig: HolidayConfig = {
  id: 'easter',
  name: 'Easter',
  shortName: 'Easter',
  icon: '🐰',
  description: 'Easter Liability Tracking',
  theme: {
    primary: 'purple',
    secondary: 'yellow',
    accent: 'pink',
    gradientFrom: 'from-purple-500',
    gradientVia: 'via-pink-400/80',
    gradientTo: 'to-yellow-400',
    headerBg: 'bg-black/10',
    cardBg: 'bg-white/95',
    buttonPrimary: 'bg-purple-600 hover:bg-purple-700',
    buttonSecondary: 'bg-pink-500 hover:bg-pink-600',
    footerBorder: 'from-purple-500 via-pink-400 to-yellow-400',
    statsPrimaryBg: 'bg-purple-50 border-purple-100',
    statsPrimaryText: 'text-purple-600',
    statsSecondaryBg: 'bg-pink-50 border-pink-100',
    statsSecondaryText: 'text-pink-600',
  },
  defaultTargetDate: '04-16', // 4 days before Apr 20 (Easter varies by year)
  animationType: 'eggs',
  seasonalFloorIcon: '🐰',
};

// Halloween Configuration
const halloweenConfig: HolidayConfig = {
  id: 'halloween',
  name: 'Halloween',
  shortName: "H'ween",
  icon: '🎃',
  description: 'Halloween Liability Tracking',
  theme: {
    primary: 'orange',
    secondary: 'purple',
    accent: 'black',
    gradientFrom: 'from-orange-600',
    gradientVia: 'via-orange-700/80',
    gradientTo: 'to-purple-900',
    headerBg: 'bg-black/20',
    cardBg: 'bg-white/95',
    buttonPrimary: 'bg-orange-600 hover:bg-orange-700',
    buttonSecondary: 'bg-purple-600 hover:bg-purple-700',
    footerBorder: 'from-orange-500 via-purple-600 to-orange-500',
    statsPrimaryBg: 'bg-orange-50 border-orange-100',
    statsPrimaryText: 'text-orange-600',
    statsSecondaryBg: 'bg-purple-50 border-purple-100',
    statsSecondaryText: 'text-purple-600',
  },
  defaultTargetDate: '10-27', // 4 days before Oct 31
  animationType: 'bats',
  seasonalFloorIcon: '🎃',
};

// All holidays configuration map
export const HOLIDAYS: Record<HolidayId, HolidayConfig> = {
  christmas: christmasConfig,
  valentines: valentinesConfig,
  easter: easterConfig,
  halloween: halloweenConfig,
};

// Get ordered list of holidays (for display purposes)
export const HOLIDAY_ORDER: HolidayId[] = ['christmas', 'valentines', 'easter', 'halloween'];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get holiday by ID
export function getHoliday(id: HolidayId): HolidayConfig {
  return HOLIDAYS[id];
}

// Get default target date for a holiday
export function getHolidayTargetDate(holidayId: HolidayId): string {
  const holiday = HOLIDAYS[holidayId];
  const year = new Date().getFullYear();
  const [month, day] = holiday.defaultTargetDate.split('-');
  
  // If we're past this year's date, use next year
  const targetDate = new Date(year, parseInt(month) - 1, parseInt(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (targetDate < today) {
    return `${year + 1}-${month}-${day}`;
  }
  
  return `${year}-${month}-${day}`;
}

// Get all candy pallet types for a specific holiday (generic + holiday-specific)
export function getCandyPalletTypes(holidayId: HolidayId): Record<string, PalletType> {
  const holidaySpecific = {
    christmas: CHRISTMAS_CANDY_PALLETS,
    valentines: VALENTINES_CANDY_PALLETS,
    easter: EASTER_CANDY_PALLETS,
    halloween: HALLOWEEN_CANDY_PALLETS,
  }[holidayId] || {};
  
  return { ...GENERIC_CANDY_PALLETS, ...holidaySpecific };
}

// Get all GM pallet types for a specific holiday (generic + holiday-specific)
export function getGMPalletTypes(holidayId: HolidayId): Record<string, PalletType> {
  const holidaySpecific = {
    christmas: CHRISTMAS_GM_PALLETS,
    valentines: VALENTINES_GM_PALLETS,
    easter: EASTER_GM_PALLETS,
    halloween: HALLOWEEN_GM_PALLETS,
  }[holidayId] || {};
  
  return { ...GENERIC_GM_PALLETS, ...holidaySpecific };
}

// Get all pallet types for a holiday (both categories)
export function getAllPalletTypes(holidayId: HolidayId): Record<string, PalletType> {
  return {
    ...getCandyPalletTypes(holidayId),
    ...getGMPalletTypes(holidayId),
  };
}

// Get pallet types as array for a specific holiday and category
export function getPalletTypesArray(holidayId: HolidayId, category?: CategoryId): PalletType[] {
  if (category === 'candy') {
    return Object.values(getCandyPalletTypes(holidayId));
  }
  if (category === 'gm') {
    return Object.values(getGMPalletTypes(holidayId));
  }
  return Object.values(getAllPalletTypes(holidayId));
}

// Get primary pallet type key for stats display
export function getPrimaryPalletType(holidayId: HolidayId, category?: CategoryId): string {
  if (category === 'candy') {
    const types = getCandyPalletTypes(holidayId);
    return Object.keys(types)[0] || 'candy';
  }
  if (category === 'gm') {
    const types = getGMPalletTypes(holidayId);
    return Object.keys(types)[0] || 'gm_sidecounter';
  }
  return 'candy';
}

// Category display info
export const CATEGORIES: Record<CategoryId, { name: string; icon: string; description: string }> = {
  candy: { name: 'Candy', icon: '🍬', description: 'Seasonal candy and food items' },
  gm: { name: 'GM', icon: '🎁', description: 'General merchandise and non-food items' },
};

// Legacy compatibility - get all pallet types for a holiday (used by existing code)
// This returns a flat object like the old palletTypes field
export function getLegacyPalletTypes(holidayId: HolidayId): Record<string, { name: string; type: string; icon: string }> {
  const allTypes = getAllPalletTypes(holidayId);
  const legacy: Record<string, { name: string; type: string; icon: string }> = {};
  for (const [key, value] of Object.entries(allTypes)) {
    legacy[key] = { name: value.name, type: value.type, icon: value.icon };
  }
  return legacy;
}
