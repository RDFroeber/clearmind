/**
 * Timezone configuration for the application
 * This should match the user's timezone
 */
export const USER_TIMEZONE = 'America/New_York'; // EST/EDT

/**
 * Get current date/time in user's timezone
 */
export function getNowInUserTimezone() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: USER_TIMEZONE }));
}

/**
 * Convert any date to user's timezone
 */
export function convertToUserTimezone(date) {
  return new Date(date.toLocaleString('en-US', { timeZone: USER_TIMEZONE }));
}

/**
 * Get start of day in user's timezone
 */
export function getStartOfDayInUserTimezone(date) {
  const dateStr = date.toLocaleDateString('en-US', { timeZone: USER_TIMEZONE });
  const [month, day, year] = dateStr.split('/');
  return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00`);
}

/**
 * Get end of day in user's timezone
 */
export function getEndOfDayInUserTimezone(date) {
  const dateStr = date.toLocaleDateString('en-US', { timeZone: USER_TIMEZONE });
  const [month, day, year] = dateStr.split('/');
  return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T23:59:59.999`);
}