/**
 * Google Calendar API Integration
 * Handles fetching, creating, updating, and deleting calendar events
 */

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

/**
 * Fetch all calendar events from the user's primary calendar
 * @param {string} accessToken - Google OAuth access token
 * @returns {Array} Array of calendar events
 */
export async function fetchCalendarEvents(accessToken) {
  try {
    const response = await fetch(
      `${CALENDAR_API_BASE}/calendars/primary/events?maxResults=100&orderBy=startTime&singleEvents=true&timeMin=${new Date().toISOString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Google Calendar format to our app format
    return data.items?.map(event => ({
      id: event.id,
      title: event.summary,
      description: event.description || '',
      start: new Date(event.start.dateTime || event.start.date),
      end: new Date(event.end.dateTime || event.end.date),
      location: event.location || '',
    })) || [];

  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

/**
 * Create a new calendar event
 * @param {string} accessToken - Google OAuth access token
 * @param {Object} eventData - Event data with summary, description, start, end
 * @returns {Object} Created event data
 */
export async function createCalendarEvent(accessToken, eventData) {
  try {
    const event = {
      summary: eventData.summary,
      description: eventData.description || '',
      start: {
        dateTime: eventData.start,
        timeZone: 'America/New_York', // Adjust as needed
      },
      end: {
        dateTime: eventData.end,
        timeZone: 'America/New_York', // Adjust as needed
      },
    };

    const response = await fetch(
      `${CALENDAR_API_BASE}/calendars/primary/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create event: ${errorData.error?.message || response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

/**
 * Update an existing calendar event
 * @param {string} accessToken - Google OAuth access token
 * @param {string} eventId - ID of the event to update
 * @param {Object} updatedData - Updated event data
 * @returns {Object} Updated event data
 */
export async function updateCalendarEvent(accessToken, eventId, updatedData) {
  try {
    const event = {
      summary: updatedData.summary,
      description: updatedData.description || '',
      start: {
        dateTime: updatedData.start,
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: updatedData.end,
        timeZone: 'America/New_York',
      },
    };

    const response = await fetch(
      `${CALENDAR_API_BASE}/calendars/primary/events/${eventId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update event: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
}

/**
 * Delete a calendar event
 * @param {string} accessToken - Google OAuth access token
 * @param {string} eventId - ID of the event to delete
 */
export async function deleteCalendarEvent(accessToken, eventId) {
  try {
    const response = await fetch(
      `${CALENDAR_API_BASE}/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to delete event: ${response.status}`);
    }

    return true;

  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
}