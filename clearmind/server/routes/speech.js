import express from 'express';
import {
  analyzeIntent,
  analyzeDeleteIntent,
  extractMultipleEvents,
  optimizeEventScheduling,
  generateEmpatheticResponse,
  generateSpeech
} from '../services/openaiService.js';

const router = express.Router();

/**
 * Helper function to format datetime for confirmation message
 */
function formatDateTime(isoString) {
  try {
    const eventDate = new Date(isoString);
    const now = new Date();
    
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dayLabel;
    if (eventDay.getTime() === today.getTime()) {
      dayLabel = 'today';
    } else if (eventDay.getTime() === tomorrow.getTime()) {
      dayLabel = 'tomorrow';
    } else {
      dayLabel = eventDate.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    }
    
    const timeString = eventDate.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
    
    return `${dayLabel} at ${timeString}`;
  } catch (error) {
    return 'the scheduled time';
  }
}

/**
 * Helper function to find matching events by name/description
 */
function findMatchingEvents(eventToDelete, existingEvents) {
  const searchTerm = eventToDelete.toLowerCase();
  
  return existingEvents.filter(event => {
    const title = (event.title || '').toLowerCase();
    const description = (event.description || '').toLowerCase();
    
    // Check if search term is in title or description
    return title.includes(searchTerm) || description.includes(searchTerm);
  });
}

/**
 * POST /api/speech/process
 * Main endpoint for processing user speech/text
 */
router.post('/process', async (req, res) => {
  try {
    const { text, conversationHistory = [], existingEvents = [] } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request: text is required' 
      });
    }

    console.log(`Processing text: "${text}"`);
    console.log(`Existing events count: ${existingEvents.length}`);

    // Check if this is a delete request first
    const deleteAnalysis = await analyzeDeleteIntent(text);
    console.log('Delete analysis:', deleteAnalysis);

    if (deleteAnalysis.isDeleteRequest && deleteAnalysis.confidence > 0.6) {
      // User wants to delete an event
      const matchingEvents = findMatchingEvents(deleteAnalysis.eventToDelete, existingEvents);
      
      if (matchingEvents.length === 0) {
        return res.json({
          intent: 'delete',
          text: `I couldn't find any events matching "${deleteAnalysis.eventToDelete}" in your calendar. Could you be more specific?`,
          eventsToDelete: [],
          requiresConfirmation: false
        });
      } else if (matchingEvents.length === 1) {
        // One match - ask for confirmation
        const event = matchingEvents[0];
        return res.json({
          intent: 'delete',
          text: `I found "${event.title}" scheduled for ${formatDateTime(event.start)}. Would you like me to delete this event?`,
          eventsToDelete: matchingEvents,
          requiresConfirmation: true
        });
      } else {
        // Multiple matches - ask which one
        const eventList = matchingEvents.slice(0, 3).map((e, i) => 
          `${i + 1}. "${e.title}" ${formatDateTime(e.start)}`
        ).join(', ');
        
        return res.json({
          intent: 'delete',
          text: `I found ${matchingEvents.length} events matching "${deleteAnalysis.eventToDelete}": ${eventList}. Which one would you like to delete?`,
          eventsToDelete: matchingEvents,
          requiresConfirmation: true
        });
      }
    }

    // Not a delete request - proceed with normal flow
    const intentAnalysis = await analyzeIntent(text);
    console.log('Intent analysis:', intentAnalysis);

    let response = {
      intent: intentAnalysis.intent,
      confidence: intentAnalysis.confidence,
      text: '',
      eventData: null,
      eventsData: null,
      hasConflicts: false,
      conflicts: [],
      requiresUserDecision: false,
      audioRequired: true
    };

    if (intentAnalysis.intent === 'event' && intentAnalysis.hasCalendarData) {
      // User wants to create event(s)
      try {
        const events = await extractMultipleEvents(text);
        console.log(`Extracted ${events.length} event(s):`, JSON.stringify(events, null, 2));
        
        let optimizationResult = null;
        let eventsWithConflicts = events;
        
        if (existingEvents && existingEvents.length > 0) {
          console.log('Checking for schedule conflicts...');
          optimizationResult = await optimizeEventScheduling(events, existingEvents);
          eventsWithConflicts = optimizationResult.events;
          console.log('Conflict check result:', JSON.stringify(optimizationResult, null, 2));
        }
        
        const validEvents = eventsWithConflicts.filter(e => e.summary && e.start && e.end);
        
        if (validEvents.length === 0) {
          response.text = "I heard you mention scheduling something, but I need a bit more detail. Could you tell me the date and time?";
          response.intent = 'unclear';
        } else {
          const conflictingEvents = validEvents.filter(e => e.hasConflict);
          const nonConflictingEvents = validEvents.filter(e => !e.hasConflict);
          
          if (conflictingEvents.length > 0) {
            response.hasConflicts = true;
            response.requiresUserDecision = true;
            response.conflicts = conflictingEvents;
            
            let conflictMessage = '';
            
            if (conflictingEvents.length === 1) {
              const conflict = conflictingEvents[0];
              conflictMessage = `I found a conflict: "${conflict.summary}" ${formatDateTime(conflict.start)} overlaps with your existing "${conflict.conflictDetails.conflictsWith}". `;
              
              if (conflict.conflictDetails.suggestedAlternatives && conflict.conflictDetails.suggestedAlternatives.length > 0) {
                const alternatives = conflict.conflictDetails.suggestedAlternatives
                  .slice(0, 2)
                  .map(alt => formatDateTime(alt.time))
                  .join(' or ');
                conflictMessage += `Would you like to schedule it at ${alternatives} instead, or should I keep it at the original time?`;
              } else {
                conflictMessage += `Would you like me to add it anyway, or should I cancel this event?`;
              }
            } else {
              conflictMessage = `I found ${conflictingEvents.length} conflicts with your existing schedule. `;
              const conflictList = conflictingEvents
                .map(e => `"${e.summary}" conflicts with "${e.conflictDetails.conflictsWith}"`)
                .join(', ');
              conflictMessage += `${conflictList}. Would you like me to suggest alternative times for these?`;
            }
            
            if (nonConflictingEvents.length > 0) {
              conflictMessage = `I can add ${nonConflictingEvents.length} event${nonConflictingEvents.length > 1 ? 's' : ''} without conflicts. However, ${conflictMessage}`;
            }
            
            response.text = conflictMessage;
            response.eventsData = validEvents;
            
          } else {
            let confirmationMessage;
            
            if (validEvents.length === 1) {
              const event = validEvents[0];
              confirmationMessage = `I'll add "${event.summary}" to your calendar for ${formatDateTime(event.start)}.`;
            } else {
              const eventSummaries = validEvents.slice(0, 3).map((e) => 
                `"${e.summary}" ${formatDateTime(e.start)}`
              ).join(', ');
              
              if (validEvents.length > 3) {
                confirmationMessage = `I'll add ${validEvents.length} events to your calendar. First few: ${eventSummaries}, and ${validEvents.length - 3} more.`;
              } else {
                confirmationMessage = `I'll add ${validEvents.length} events to your calendar: ${eventSummaries}.`;
              }
            }

            response.text = confirmationMessage;
            response.eventsData = validEvents;
            response.eventData = validEvents[0];
          }
        }
        
      } catch (error) {
        console.error('Event extraction/conflict check failed:', error);
        response.text = "I heard you mention scheduling something, but I need a bit more detail. Could you tell me the date and time?";
        response.intent = 'unclear';
      }
    } else {
      const empatheticResponse = await generateEmpatheticResponse(text, conversationHistory);
      response.text = empatheticResponse;
    }

    res.json(response);

  } catch (error) {
    console.error('Error processing speech:', error);
    res.status(500).json({ 
      error: 'Failed to process speech',
      message: error.message 
    });
  }
});

/**
 * POST /api/speech/tts
 * Generate text-to-speech audio
 */
router.post('/tts', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request: text is required' 
      });
    }

    const audioBuffer = await generateSpeech(text);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
    });

    res.send(audioBuffer);

  } catch (error) {
    console.error('Error generating TTS:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      message: error.message 
    });
  }
});

export default router;