import express from 'express';
import {
  analyzeAndExtractEvents,
  quickConflictCheck,
  analyzeDeleteIntent,
  generateEmpatheticResponse,
  shouldUseCalendarContext,
  generateSpeech
} from '../services/openaiService.js';
import {
  formatDateTime,
  findMatchingEvents,
  buildCalendarContext
} from '../utils/dates.js';

const router = express.Router();

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
    console.time('Total processing time'); // Add timing

    // OPTIMIZATION 1: Check delete intent first (fast, simple check)
    const deleteAnalysis = await analyzeDeleteIntent(text);
    
    if (deleteAnalysis.isDeleteRequest && deleteAnalysis.confidence > 0.6) {
      console.timeEnd('Total processing time');
      
      const matchingEvents = findMatchingEvents(deleteAnalysis.eventToDelete, existingEvents);
      
      if (matchingEvents.length === 0) {
        return res.json({
          intent: 'delete',
          text: `I couldn't find any events matching "${deleteAnalysis.eventToDelete}" in your calendar. Could you be more specific?`,
          eventsToDelete: [],
          requiresConfirmation: false
        });
      } else if (matchingEvents.length === 1) {
        const event = matchingEvents[0];
        return res.json({
          intent: 'delete',
          text: `I found "${event.title}" scheduled for ${formatDateTime(event.start)}. Would you like me to delete this event?`,
          eventsToDelete: matchingEvents,
          requiresConfirmation: true
        });
      } else {
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

    // OPTIMIZATION 2: Combined intent + event extraction (ONE API call instead of TWO)
    console.time('Intent + extraction');
    const analysis = await analyzeAndExtractEvents(text);
    console.timeEnd('Intent + extraction');
    
    console.log('Analysis result:', analysis);
    console.log('Intent:', analysis.intent);
    console.log('Has calendar data:', analysis.hasCalendarData);
    console.log('Events count:', analysis.events?.length || 0);

    let response = {
      intent: analysis.intent,
      confidence: analysis.confidence,
      text: '',
      eventData: null,
      eventsData: null,
      hasConflicts: false,
      conflicts: [],
      requiresUserDecision: false,
      audioRequired: true
    };

    if (analysis.intent === 'event' && analysis.hasCalendarData && analysis.events.length > 0) {
      // User wants to create event(s)
      console.log('→ Going into EVENT handling path');
      try {
        const events = analysis.events;
        
        // OPTIMIZATION 3: Only check conflicts if there are existing events
        let eventsWithConflicts = events;
        
        if (existingEvents && existingEvents.length > 0) {
          console.time('Conflict check');
          const conflictResult = await quickConflictCheck(events, existingEvents);
          eventsWithConflicts = conflictResult.events;
          console.timeEnd('Conflict check');
        } else {
          // No existing events = no conflicts possible
          eventsWithConflicts = events.map(e => ({ ...e, hasConflict: false }));
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
              conflictMessage = `I found a conflict: "${conflict.summary}" ${formatDateTime(conflict.start)} overlaps with your existing "${conflict.conflictsWith}". Would you like me to add it anyway or cancel?`;
            } else {
              conflictMessage = `I found ${conflictingEvents.length} conflicts with your existing schedule. Would you like me to add them anyway?`;
            }
            
            if (nonConflictingEvents.length > 0) {
              conflictMessage = `I can add ${nonConflictingEvents.length} event${nonConflictingEvents.length > 1 ? 's' : ''} without conflicts. However, ${conflictMessage}`;
            }
            
            response.text = conflictMessage;
            response.eventsData = validEvents;
            
          } else {
            // No conflicts - quick confirmation
            let confirmationMessage;
            
            if (validEvents.length === 1) {
              const event = validEvents[0];
              confirmationMessage = `I'll add "${event.summary}" to your calendar for ${formatDateTime(event.start)}.`;
            } else {
              confirmationMessage = `I'll add ${validEvents.length} events to your calendar.`;
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
      // User needs empathy, advice, or clarification
      console.log('→ Going into EMPATHY response path');
      
      // Determine if we should include calendar context
      const needsCalendarContext = shouldUseCalendarContext(text);
      console.log('=== Calendar Context Detection ===');
      console.log('Query:', text);
      console.log('Needs calendar context:', needsCalendarContext);
      console.log('Existing events count:', existingEvents?.length || 0);
      
      let calendarContext = null;
      
      if (needsCalendarContext) {
        // Use helper function to build calendar context
        console.log('✓ Building calendar context (even if no events)...');
        // Pass existingEvents even if it's an empty array
        calendarContext = buildCalendarContext(text, existingEvents || []);
        
        console.log('Calendar context built:', calendarContext ? 'YES' : 'NO');
        if (calendarContext) {
          console.log('  - Time range:', calendarContext.timeRange);
          console.log('  - Is empty:', calendarContext.isEmpty);
          console.log('  - Event count:', calendarContext.count);
        }
      } else {
        console.log('Skipping calendar context:', {
          needsCalendarContext,
          hasEvents: !!(existingEvents && existingEvents.length > 0)
        });
      }
      
      console.log('Calendar context being passed to AI:', calendarContext ? 'YES' : 'NO');
      console.log('===================================');
      
      const empatheticResponse = await generateEmpatheticResponse(
        text, 
        conversationHistory,
        calendarContext  // ← This parameter must be here
      );
      console.timeEnd('Empathy response');
      response.text = empatheticResponse;
    }

    console.timeEnd('Total processing time');
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
// TTS endpoint
router.post('/tts', async (req, res) => {
  try {
    const { text, voice = 'nova', speed = 0.95 } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log(`Generating TTS: voice=${voice}, speed=${speed}`);
    const audioBuffer = await generateSpeech(text, voice, speed);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
    });

    res.send(audioBuffer);
  } catch (error) {
    console.error('Error generating speech:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      message: error.message 
    });
  }
});

export default router;