// Holiday Configuration System
// Defines themes, pallet types, and default settings for each holiday

export type HolidayId = 'christmas' | 'valentines' | 'easter' | 'halloween';

export interface PalletType {
  name: string;
  type: string;
  icon: string;
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
  
  // Pallet types specific to this holiday
  palletTypes: Record<string, PalletType>;
  
  // Default target date (month-day format, e.g., "12-21" or "02-14")
  defaultTargetDate: string;
  
  // Decorative animation type
  animationType: 'snowfall' | 'hearts' | 'eggs' | 'bats' | 'none';
  
  // Default seasonal floor icon
  seasonalFloorIcon: string;
}

// Christmas Configuration
const christmasConfig: HolidayConfig = {
  id: 'christmas',
  name: 'Christmas',
  shortName: 'Xmas',
  icon: '🎄',
  description: 'Christmas Inventory Management',
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
  palletTypes: {
    candy: { name: 'Candy', type: 'candy', icon: '🍬' },
    popcorn: { name: 'Popcorn', type: 'popcorn', icon: '🍿' },
    gingerbread: { name: 'Gingerbread', type: 'gingerbread', icon: '🍪' },
  },
  defaultTargetDate: '12-21',
  animationType: 'snowfall',
  seasonalFloorIcon: '🎄',
};

// Valentine's Day Configuration
const valentinesConfig: HolidayConfig = {
  id: 'valentines',
  name: "Valentine's Day",
  shortName: "V-Day",
  icon: '💝',
  description: "Valentine's Day Inventory Management",
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
  palletTypes: {
    chocolate: { name: 'Chocolate', type: 'chocolate', icon: '🍫' },
    candy: { name: 'Candy', type: 'candy', icon: '🍬' },
    plush: { name: 'Plush/Stuffed', type: 'plush', icon: '🧸' },
    cards: { name: 'Cards', type: 'cards', icon: '💌' },
  },
  defaultTargetDate: '02-14',
  animationType: 'hearts',
  seasonalFloorIcon: '💝',
};

// Easter Configuration
const easterConfig: HolidayConfig = {
  id: 'easter',
  name: 'Easter',
  shortName: 'Easter',
  icon: '🐰',
  description: 'Easter Inventory Management',
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
  palletTypes: {
    candy: { name: 'Candy', type: 'candy', icon: '🍬' },
    chocolate: { name: 'Chocolate', type: 'chocolate', icon: '🍫' },
    eggs: { name: 'Eggs/Baskets', type: 'eggs', icon: '🥚' },
    plush: { name: 'Plush', type: 'plush', icon: '🐰' },
  },
  defaultTargetDate: '04-20', // Approximate, varies by year
  animationType: 'eggs',
  seasonalFloorIcon: '🐰',
};

// Halloween Configuration
const halloweenConfig: HolidayConfig = {
  id: 'halloween',
  name: 'Halloween',
  shortName: "H'ween",
  icon: '🎃',
  description: 'Halloween Inventory Management',
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
  palletTypes: {
    candy: { name: 'Candy', type: 'candy', icon: '🍬' },
    chocolate: { name: 'Chocolate', type: 'chocolate', icon: '🍫' },
    costumes: { name: 'Costumes', type: 'costumes', icon: '🎭' },
    decorations: { name: 'Decorations', type: 'decorations', icon: '🎃' },
  },
  defaultTargetDate: '10-31',
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

// Helper function to get holiday by ID
export function getHoliday(id: HolidayId): HolidayConfig {
  return HOLIDAYS[id];
}

// Helper to get default target date for a holiday
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

// Get pallet types as array for a specific holiday
export function getPalletTypesArray(holidayId: HolidayId): PalletType[] {
  return Object.values(HOLIDAYS[holidayId].palletTypes);
}

// Get first pallet type key for stats display
export function getPrimaryPalletType(holidayId: HolidayId): string {
  const types = Object.keys(HOLIDAYS[holidayId].palletTypes);
  return types[0] || 'candy';
}
