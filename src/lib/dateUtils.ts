/**
 * Date utility functions for the Liability Tracker app
 * Extracted from CategoryInventory.tsx and Overview.tsx
 */

/**
 * Format date for display (e.g., "Dec 21")
 * @param dateStr - ISO date string (e.g., "2024-12-21")
 * @returns Formatted date string (e.g., "Dec 21")
 */
export function formatTargetDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Parse date string to Date object (handling timezone correctly)
 * @param dateStr - ISO date string (e.g., "2024-12-21")
 * @returns Date object set to midnight local time
 */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format "last updated" time - relative if <23 hours, date if older
 * @param isoString - ISO timestamp string
 * @returns Formatted relative time or date string, or null if no input
 */
export function formatLastUpdated(isoString?: string): string | null {
  if (!isoString) return null;
  
  const updated = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - updated.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  // If less than 23 hours, show relative time
  if (diffHours < 23) {
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${diffHours}h ago`;
  }
  
  // Otherwise show the date (e.g., "Dec 10")
  return updated.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Calculate days remaining until target date
 * @param targetDateStr - ISO date string for target date
 * @returns Number of days remaining (can be negative if past)
 */
export function calculateDaysRemaining(targetDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = parseDate(targetDateStr);
  
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate per-day rate needed to clear items by target date
 * @param total - Total number of items
 * @param daysRemaining - Days until target date
 * @returns Rate per day as a formatted string (e.g., "5.2")
 */
export function calculatePerDayRate(total: number, daysRemaining: number): string {
  if (daysRemaining <= 0) return '0';
  return (total / daysRemaining).toFixed(1);
}
