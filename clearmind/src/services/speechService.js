const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

/**
 * Sends user input to backend for processing
 * Returns response with intent classification and appropriate action
 */
export async function processUserInput(text, conversationHistory = [], existingEvents = []) {
  try {
    const response = await fetch(`${API_BASE_URL}/speech/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text,
        conversationHistory: conversationHistory.slice(-10), // Send last 10 messages for context
        existingEvents: existingEvents // Send calendar events for optimization
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to process input');
    }

    const data = await response.json();
    
    return {
      text: data.text,
      intent: data.intent,
      confidence: data.confidence,
      eventData: data.eventData,
      eventsData: data.eventsData,
      optimizationInfo: data.optimizationInfo,
    };

  } catch (error) {
    console.error('Error processing user input:', error);
    throw error;
  }
}

/**
 * Fetches TTS audio from backend
 * Returns audio blob
 */
export async function fetchTTSAudio(text) {
  try {
    const response = await fetch(`${API_BASE_URL}/speech/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate speech');
    }

    return await response.blob();

  } catch (error) {
    console.error('Error fetching TTS audio:', error);
    throw error;
  }
}