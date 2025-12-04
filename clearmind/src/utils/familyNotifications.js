// src/utils/familyNotifications.js
// Helper functions to notify family groups about calendar changes

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';
const ask = (msg) => window.confirm(msg);


/**
 * Notify family group members when an event is created
 */
export async function notifyEventCreated(groupId, userEmail, eventData) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/family-groups/${groupId}/notify`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'event_created',
          userEmail,
          eventData: {
            eventId: eventData.id,
            eventTitle: eventData.summary || eventData.title,
            eventStart: eventData.start,
            eventEnd: eventData.end,
            eventDescription: eventData.description
          }
        })
      }
    );

    if (!response.ok) {
      console.warn('Failed to send notification:', await response.text());
      return false;
    }

    const result = await response.json();
    console.log(`✓ Notified ${result.message}`);
    return true;
  } catch (error) {
    console.error('Error sending event created notification:', error);
    return false;
  }
}

/**
 * Notify family group members when an event is updated
 */
export async function notifyEventUpdated(groupId, userEmail, eventData, changes) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/family-groups/${groupId}/notify`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'event_updated',
          userEmail,
          eventData: {
            eventId: eventData.id,
            eventTitle: eventData.summary || eventData.title,
            eventStart: eventData.start,
            eventEnd: eventData.end,
            changes: changes || {}
          }
        })
      }
    );

    if (!response.ok) {
      console.warn('Failed to send notification:', await response.text());
      return false;
    }

    const result = await response.json();
    console.log(`✓ Notified ${result.message}`);
    return true;
  } catch (error) {
    console.error('Error sending event updated notification:', error);
    return false;
  }
}

/**
 * Notify family group members when an event is deleted
 */
export async function notifyEventDeleted(groupId, userEmail, eventData) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/family-groups/${groupId}/notify`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'event_deleted',
          userEmail,
          eventData: {
            eventId: eventData.id,
            eventTitle: eventData.summary || eventData.title,
            eventStart: eventData.start,
            eventEnd: eventData.end
          }
        })
      }
    );

    if (!response.ok) {
      console.warn('Failed to send notification:', await response.text());
      return false;
    }

    const result = await response.json();
    console.log(`✓ Notified ${result.message}`);
    return true;
  } catch (error) {
    console.error('Error sending event deleted notification:', error);
    return false;
  }
}

/**
 * Show a modal to let user choose which groups to notify
 */
export function showNotifyGroupsModal(groups, onConfirm) {
  return new Promise((resolve) => {
    // This would be a React component in production
    // For now, return a simple implementation
    const selectedGroups = groups.filter(group => {
      return ask(`Notify ${group.name} about this change?`);
    });
    
    onConfirm(selectedGroups);
    resolve(selectedGroups);
  });
}

/**
 * Get all family groups for a user
 */
export async function getUserFamilyGroups(userEmail) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/family-groups?userEmail=${userEmail}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch family groups');
    }
    
    const data = await response.json();
    return data.groups || [];
  } catch (error) {
    console.error('Error fetching family groups:', error);
    return [];
  }
}

/**
 * Integration hook: Call this after creating an event
 */
export async function handleEventCreatedWithNotification(
  userEmail,
  eventData,
  shouldPromptForGroups = true
) {
  // Get user's groups
  const groups = await getUserFamilyGroups(userEmail);
  
  if (groups.length === 0) {
    return; // No groups to notify
  }

  let groupsToNotify = groups;
  
  // Optional: Let user choose which groups to notify
  if (shouldPromptForGroups && groups.length > 1) {
    groupsToNotify = await showNotifyGroupsModal(groups, () => {});
  }

  // Send notifications to selected groups
  for (const group of groupsToNotify) {
    await notifyEventCreated(group.id, userEmail, eventData);
  }
}

/**
 * Integration hook: Call this after updating an event
 */
export async function handleEventUpdatedWithNotification(
  userEmail,
  eventData,
  changes,
  shouldPromptForGroups = true
) {
  const groups = await getUserFamilyGroups(userEmail);
  
  if (groups.length === 0) {
    return;
  }

  let groupsToNotify = groups;
  
  if (shouldPromptForGroups && groups.length > 1) {
    groupsToNotify = await showNotifyGroupsModal(groups, () => {});
  }

  for (const group of groupsToNotify) {
    await notifyEventUpdated(group.id, userEmail, eventData, changes);
  }
}

/**
 * Integration hook: Call this after deleting an event
 */
export async function handleEventDeletedWithNotification(
  userEmail,
  eventData,
  shouldPromptForGroups = true
) {
  const groups = await getUserFamilyGroups(userEmail);
  
  if (groups.length === 0) {
    return;
  }

  let groupsToNotify = groups;
  
  if (shouldPromptForGroups && groups.length > 1) {
    groupsToNotify = await showNotifyGroupsModal(groups, () => {});
  }

  for (const group of groupsToNotify) {
    await notifyEventDeleted(group.id, userEmail, eventData);
  }
}