import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMPATHY_SYSTEM_PROMPT = `You are a supportive AI assistant helping someone from the "Sandwich Generation" - adults caring for aging parents while raising their own children.

Your role:
- Listen with empathy and validate their feelings
- Keep responses concise (2-3 sentences) to avoid overwhelming them
- Offer actionable next steps only when appropriate
- Recognize when they just need to vent vs. when they need help
- Be warm but professional`;

/**
 * Analyzes text to determine if it contains calendar event information
 * Now detects MULTIPLE events in a single message
 */
export async function analyzeIntent(text) {
  try {
    const prompt = `Analyze this text and determine the user's intent:

Text: "${text}"

Respond with ONLY valid JSON in this format:
{
  "intent": "event" | "vent" | "question" | "unclear",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "hasCalendarData": true | false,
  "eventCount": 0
}

Intent definitions:
- "event": User wants to schedule/manage calendar event(s)
- "vent": User is expressing stress/frustration and needs empathy
- "question": User is asking for advice or information
- "unclear": Cannot determine intent

IMPORTANT: Set eventCount to the NUMBER of distinct events mentioned (e.g., 2 if they mention "dentist at 2pm and pickup kids at 3pm")`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const responseText = completion.choices[0].message.content.trim();
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Error analyzing intent:', error);
    return {
      intent: 'unclear',
      confidence: 0,
      reasoning: 'Analysis failed',
      hasCalendarData: false,
      eventCount: 0
    };
  }
}

/**
 * Analyzes text to determine if user wants to delete/cancel events
 */
export async function analyzeDeleteIntent(text) {
  try {
    const prompt = `Analyze this text to determine if the user wants to delete/cancel calendar events.

Text: "${text}"

Respond with ONLY valid JSON in this format:
{
  "isDeleteRequest": true or false,
  "eventToDelete": "name or description of event to delete",
  "confidence": 0.0-1.0
}

Examples of delete requests:
- "Cancel my dentist appointment"
- "Delete the meeting at 2pm"
- "Remove pickup kids from my calendar"
- "I don't need the call with mom anymore"

If the text is asking to delete/cancel/remove an event, set isDeleteRequest to true.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const responseText = completion.choices[0].message.content.trim();
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Error analyzing delete intent:', error);
    return {
      isDeleteRequest: false,
      eventToDelete: '',
      confidence: 0
    };
  }
}

/**
 * Extracts MULTIPLE calendar events from text
 * Returns an array of event objects
 */
export async function extractMultipleEvents(text) {
  try {
    const prompt = `Extract ALL calendar events from this text and return ONLY valid JSON:

Text: "${text}"
Current date/time: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}

Return this exact format (an ARRAY of events):
[
  {
    "summary": "Event title",
    "description": "Optional description or empty string",
    "start": "ISO 8601 datetime string",
    "end": "ISO 8601 datetime string",
    "isFlexible": true or false
  }
]

Rules:
- Return an ARRAY even if there's only one event: [{ ... }]
- Use ISO 8601 format with timezone: "2025-12-02T15:00:00-05:00"
- Default to 30-minute duration if not specified
- If date is relative (tomorrow, next week), calculate from current date
- If time is not specified, use 9:00 AM as default
- Use Eastern timezone (-05:00) as default
- Extract EVERY event mentioned
- Set isFlexible to true if time is vague (e.g., "sometime today", "afternoon") or false if specific (e.g., "2pm", "5:00")`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const responseText = completion.choices[0].message.content.trim();
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const events = JSON.parse(cleanedText);
    
    // Ensure we always return an array
    return Array.isArray(events) ? events : [events];
    
  } catch (error) {
    console.error('Error extracting event data:', error);
    throw new Error('Failed to extract event information');
  }
}

/**
 * Analyzes existing calendar and checks for conflicts
 * Does NOT automatically reschedule - prompts user instead
 */
export async function optimizeEventScheduling(newEvents, existingEvents) {
  try {
    // Filter to only today and future events
    const now = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    const relevantEvents = existingEvents.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart >= now;
    });

    const prompt = `You are a smart scheduling assistant. Analyze this calendar for conflicts.

EXISTING CALENDAR EVENTS:
${JSON.stringify(relevantEvents, null, 2)}

NEW EVENTS TO SCHEDULE:
${JSON.stringify(newEvents, null, 2)}

Current date/time: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}

Check for conflicts but DO NOT automatically reschedule events. Return ONLY valid JSON:
{
  "events": [
    {
      "summary": "Event title",
      "description": "Description",
      "start": "ISO 8601 datetime string (KEEP ORIGINAL TIME)",
      "end": "ISO 8601 datetime string",
      "hasConflict": true or false,
      "conflictDetails": {
        "conflictsWith": "Name of conflicting event",
        "conflictTime": "Time range of conflict",
        "suggestedAlternatives": [
          {
            "time": "ISO 8601 datetime",
            "reason": "Why this time works"
          }
        ]
      }
    }
  ],
  "summary": "Brief summary of conflicts found"
}

RULES:
1. KEEP the original requested time for all events - do NOT change them
2. Check if new event times overlap with existing events
3. Two events conflict if their time ranges overlap
4. For flexible events (isFlexible: true), suggest 2-3 alternative times
5. For fixed events (isFlexible: false), note the conflict but keep the original time
6. Suggest alternatives in available time slots with 30-min buffers
7. Consider business hours (9am-6pm) for alternatives`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0].message.content.trim();
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanedText);
    
  } catch (error) {
    console.error('Error checking schedule conflicts:', error);
    throw new Error('Failed to check schedule conflicts');
  }
}

/**
 * Legacy function - extracts single event (kept for backward compatibility)
 */
export async function extractEventData(text) {
  const events = await extractMultipleEvents(text);
  return events[0]; // Return first event
}

/**
 * Generates empathetic response to user's message
 */
export async function generateEmpatheticResponse(text, conversationHistory = []) {
  try {
    const messages = [
      { role: 'system', content: EMPATHY_SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: text }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 150,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response');
  }
}

/**
 * Generates audio from text using OpenAI TTS
 */
export async function generateSpeech(text) {
  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: text.slice(0, 4096),
      speed: 0.95,
    });

    return Buffer.from(await mp3.arrayBuffer());
  } catch (error) {
    console.error('Error generating speech:', error);
    throw new Error('Failed to generate speech');
  }
}
