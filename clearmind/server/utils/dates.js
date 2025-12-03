import { USER_TIMEZONE } from '../config/timezone.js';

/**
 * Helper function to format datetime for confirmation message
 */
export function formatDateTime(isoString) {
  try {
    if (!isoString) {
      return 'a scheduled time';
    }
    
    const eventDate = new Date(isoString);
    
    if (isNaN(eventDate.getTime())) {
      return 'a scheduled time';
    }
    
    const now = new Date();
    
    // Compare dates in user's timezone
    const eventDateStr = eventDate.toLocaleDateString('en-US', { timeZone: USER_TIMEZONE });
    const todayStr = now.toLocaleDateString('en-US', { timeZone: USER_TIMEZONE });
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString('en-US', { timeZone: USER_TIMEZONE });
    
    let dayLabel;
    if (eventDateStr === todayStr) {
      dayLabel = 'today';
    } else if (eventDateStr === tomorrowStr) {
      dayLabel = 'tomorrow';
    } else {
      dayLabel = eventDate.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: USER_TIMEZONE
      });
    }
    
    const timeString = eventDate.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: USER_TIMEZONE
    });
    
    return `${dayLabel} at ${timeString}`;
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'the scheduled time';
  }
}

/**
 * Helper function to find matching events by name/description
 */
export function findMatchingEvents(eventToDelete, existingEvents) {
  if (!eventToDelete || typeof eventToDelete !== 'string') {
    console.warn('Invalid eventToDelete:', eventToDelete);
    return [];
  }
  
  if (!existingEvents || !Array.isArray(existingEvents) || existingEvents.length === 0) {
    console.warn('No existing events to search');
    return [];
  }

  const searchTerm = eventToDelete.toLowerCase().trim();
  
  return existingEvents.filter(event => {
    if (!event) return false;
    
    const title = (event.title || event.summary || '').toLowerCase();
    const description = (event.description || '').toLowerCase();
    
    return title.includes(searchTerm) || description.includes(searchTerm) || searchTerm.includes(title);
  });
}

/**
 * Helper function to determine date range based on user query
 * Returns dates in user's timezone
 */
export function getDateRangeFromQuery(text) {
  const now = new Date();
  const lowerText = text.toLowerCase();
  
  // Get today's date in user timezone
  const todayStr = now.toLocaleDateString('en-US', { timeZone: USER_TIMEZONE });
  const [month, day, year] = todayStr.split('/');
  
  let startDate, endDate, contextLabel;
  
  if (lowerText.includes('today')) {
    // Today in user's timezone
    startDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00`);
    endDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T23:59:59.999`);
    contextLabel = 'today';
    
  } else if (lowerText.includes('tomorrow')) {
    // Tomorrow in user's timezone
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString('en-US', { timeZone: USER_TIMEZONE });
    const [tMonth, tDay, tYear] = tomorrowStr.split('/');
    
    startDate = new Date(`${tYear}-${tMonth.padStart(2, '0')}-${tDay.padStart(2, '0')}T00:00:00`);
    endDate = new Date(`${tYear}-${tMonth.padStart(2, '0')}-${tDay.padStart(2, '0')}T23:59:59.999`);
    contextLabel = 'tomorrow';
    
  } else if (lowerText.includes('this week') || lowerText.includes('week')) {
    // Next 7 days
    startDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00`);
    
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = weekEnd.toLocaleDateString('en-US', { timeZone: USER_TIMEZONE });
    const [wMonth, wDay, wYear] = weekEndStr.split('/');
    endDate = new Date(`${wYear}-${wMonth.padStart(2, '0')}-${wDay.padStart(2, '0')}T23:59:59.999`);
    
    contextLabel = 'this week';
    
  } else if (lowerText.includes('next week')) {
    // 7-14 days from now
    const nextWeekStart = new Date(now);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    const nwsStr = nextWeekStart.toLocaleDateString('en-US', { timeZone: USER_TIMEZONE });
    const [nwsMonth, nwsDay, nwsYear] = nwsStr.split('/');
    startDate = new Date(`${nwsYear}-${nwsMonth.padStart(2, '0')}-${nwsDay.padStart(2, '0')}T00:00:00`);
    
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
    const nweStr = nextWeekEnd.toLocaleDateString('en-US', { timeZone: USER_TIMEZONE });
    const [nweMonth, nweDay, nweYear] = nweStr.split('/');
    endDate = new Date(`${nweYear}-${nweMonth.padStart(2, '0')}-${nweDay.padStart(2, '0')}T23:59:59.999`);
    
    contextLabel = 'next week';
    
  } else {
    // Default: next 7 days
    startDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00`);
    
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = weekEnd.toLocaleDateString('en-US', { timeZone: USER_TIMEZONE });
    const [wMonth, wDay, wYear] = weekEndStr.split('/');
    endDate = new Date(`${wYear}-${wMonth.padStart(2, '0')}-${wDay.padStart(2, '0')}T23:59:59.999`);
    
    contextLabel = 'upcoming';
  }
  
  return { startDate, endDate, contextLabel };
}

/**
 * Helper function to filter events by date range and time of day
 * Compares dates in user's timezone
 */
export function filterEventsByDateRange(events, startDate, endDate, timeOfDayFilter = null) {
  if (!events || !Array.isArray(events) || events.length === 0) {
    return [];
  }
  
  console.log(`\nFiltering ${events.length} events:`);
  console.log(`Range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
  
  return events
    .filter(event => {
      const eventStart = new Date(event.start);
      
      console.log(`\nChecking event: "${event.title}"`);
      console.log(`  Event start (ISO): ${eventStart.toISOString()}`);
      console.log(`  Event start (local): ${eventStart.toLocaleString('en-US', { timeZone: USER_TIMEZONE })}`);
      console.log(`  Start range: ${startDate.toISOString()}`);
      console.log(`  End range: ${endDate.toISOString()}`);
      
      // Check date range - compare timestamps directly
      const isInDateRange = eventStart >= startDate && eventStart <= endDate;
      console.log(`  In date range: ${isInDateRange}`);
      
      if (!isInDateRange) return false;
      
      // Check time of day if specified
      if (timeOfDayFilter === 'morning') {
        const hour = parseInt(eventStart.toLocaleString('en-US', { 
          hour: 'numeric', 
          hour12: false,
          timeZone: USER_TIMEZONE 
        }));
        const isMorning = hour < 12;
        console.log(`  Hour in ${USER_TIMEZONE}: ${hour}, is morning: ${isMorning}`);
        return isMorning;
      } else if (timeOfDayFilter === 'afternoon') {
        const hour = parseInt(eventStart.toLocaleString('en-US', { 
          hour: 'numeric', 
          hour12: false,
          timeZone: USER_TIMEZONE 
        }));
        const isAfternoon = hour >= 12;
        console.log(`  Hour in ${USER_TIMEZONE}: ${hour}, is afternoon: ${isAfternoon}`);
        return isAfternoon;
      }
      
      console.log(`  ✓ Event included`);
      return true;
    })
    .map(event => ({
      title: event.title,
      start: event.start,
      dayOfWeek: new Date(event.start).toLocaleDateString('en-US', { 
        weekday: 'long',
        timeZone: USER_TIMEZONE 
      }),
      date: new Date(event.start).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        timeZone: USER_TIMEZONE 
      })
    }));
}

/**
 * Helper function to detect time of day in query
 */
export function detectTimeOfDay(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('morning') || lowerText.includes('am')) {
    return 'morning';
  } else if (lowerText.includes('afternoon') || lowerText.includes('pm')) {
    return 'afternoon';
  } else if (lowerText.includes('evening') || lowerText.includes('night')) {
    return 'afternoon';
  }
  
  return null;
}

/**
 * Helper function to build calendar context for AI
 */
export /**
* Helper function to build calendar context for AI
* ALWAYS returns an object (never null) so AI knows we checked the calendar
*/
function buildCalendarContext(text, existingEvents) {
 console.log('\n>>> INSIDE buildCalendarContext <<<');
 console.log('Received existingEvents:', existingEvents?.length || 0);
 
 const now = new Date();
 const currentDate = now.toLocaleDateString('en-US', { 
   weekday: 'long', 
   month: 'long', 
   day: 'numeric', 
   year: 'numeric',
   timeZone: USER_TIMEZONE
 });
 
 const { startDate, endDate, contextLabel } = getDateRangeFromQuery(text);
 const timeOfDay = detectTimeOfDay(text);
 
 // If no events exist at all in the calendar
 if (!existingEvents || existingEvents.length === 0) {
   console.log('No existing events in entire calendar - returning empty context');
   const emptyContext = {
     events: [],
     count: 0,
     timeRange: contextLabel,
     timeOfDay: timeOfDay,
     currentDate: currentDate,
     isEmpty: true
   };
   console.log('Returning:', JSON.stringify(emptyContext, null, 2));
   console.log('>>> END buildCalendarContext <<<\n');
   return emptyContext;
 }
 
 console.log(`\nFiltering ${existingEvents.length} events for: ${contextLabel}`);
 console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
 
 const relevantEvents = filterEventsByDateRange(
   existingEvents, 
   startDate, 
   endDate, 
   timeOfDay
 ).slice(0, 10);
 
 console.log(`Filtered result: ${relevantEvents.length} events for ${contextLabel}`);
 
 const context = {
   events: relevantEvents,
   count: relevantEvents.length,
   timeRange: contextLabel,
   timeOfDay: timeOfDay,
   currentDate: currentDate,
   isEmpty: relevantEvents.length === 0
 };
 
 console.log('Returning context:', JSON.stringify(context, null, 2));
 console.log('>>> END buildCalendarContext <<<\n');
 
 return context;
}