import React, { useState, useEffect } from 'react';
import Header from './components/Header.js';
import SettingsPanel from './components/SettingsPanel.js';
import MessageList from './components/MessageList.js';
import InputArea from './components/InputArea.js';
import CalendarView from './components/CalendarView.js';
import useSpeechToText from './hooks/useSpeechToText.js';
import { processUserInput } from './services/speechService.js';
import { fetchCalendarEvents, createCalendarEvent, deleteCalendarEvent } from './services/googleCalendar.js';
import { playTextToSpeech } from './services/ttsService.js';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function App() {
  // Message and conversation state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  // API settings
  const [apiConfigured, setApiConfigured] = useState(false);

  // Google Calendar state
  const [googleAccessToken, setGoogleAccessToken] = useState('');
  const [calendarEvents, setCalendarEvents] = useState([]);

  // TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Check if API is configured
  useEffect(() => {
    const hasApiKey = !!process.env.REACT_APP_API_BASE_URL;
    setApiConfigured(hasApiKey);
    
    if (!hasApiKey) {
      console.warn('API base URL not configured. Please set REACT_APP_API_BASE_URL in .env');
    }
  }, []);

  // Load saved Google token and fetch events on mount
  useEffect(() => {
    const loadSavedToken = async () => {
      try {
        const savedToken = localStorage.getItem('google_calendar_token');
        const tokenExpiry = localStorage.getItem('google_calendar_token_expiry');
        
        if (savedToken && tokenExpiry) {
          const expiryTime = parseInt(tokenExpiry, 10);
          const now = Date.now();
          
          // Check if token is still valid (not expired)
          if (now < expiryTime) {
            console.log('Restoring saved Google Calendar token');
            setGoogleAccessToken(savedToken);
            
            // Fetch calendar events with saved token
            const events = await fetchCalendarEvents(savedToken);
            setCalendarEvents(events || []);
          } else {
            console.log('Saved token expired, clearing...');
            localStorage.removeItem('google_calendar_token');
            localStorage.removeItem('google_calendar_token_expiry');
          }
        }
      } catch (error) {
        console.error('Error loading saved token:', error);
        // Clear invalid tokens
        localStorage.removeItem('google_calendar_token');
        localStorage.removeItem('google_calendar_token_expiry');
      }
    };

    loadSavedToken();
  }, []);

  // Save token when it changes
  const saveGoogleToken = (token) => {
    setGoogleAccessToken(token);
    
    if (token) {
      // Save token to localStorage
      localStorage.setItem('google_calendar_token', token);
      
      // Set expiry to 1 hour from now (Google tokens typically last 1 hour)
      const expiryTime = Date.now() + (60 * 60 * 1000); // 1 hour
      localStorage.setItem('google_calendar_token_expiry', expiryTime.toString());
      
      console.log('Google Calendar token saved');
    } else {
      // Clear token
      localStorage.removeItem('google_calendar_token');
      localStorage.removeItem('google_calendar_token_expiry');
      console.log('Google Calendar token cleared');
    }
  };

  // Google Sign-In handler
  const handleGoogleSignIn = () => {
    if (!GOOGLE_CLIENT_ID) {
      alert('Google Client ID not configured. Please add REACT_APP_GOOGLE_CLIENT_ID to your .env file.');
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/calendar',
      callback: async (response) => {
        if (response.access_token) {
          saveGoogleToken(response.access_token);
          const events = await fetchCalendarEvents(response.access_token);
          setCalendarEvents(events || []);
        }
      },
    });
    client.requestAccessToken();
  };

  // Google Sign-Out handler
  const handleGoogleSignOut = () => {
    saveGoogleToken(''); // This clears localStorage
    setCalendarEvents([]);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'You\'ve been disconnected from Google Calendar.'
    }]);
  };

  // Handle user message submission
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    await processMessage(input);
    setInput('');
  };

  const processMessage = async (text) => {
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
  
    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
  
      // Pass existing calendar events for conflict checking and deletion
      const response = await processUserInput(text, conversationHistory, calendarEvents);
      
      console.log('Response from backend:', response);
  
      const assistantMessage = { 
        role: 'assistant', 
        content: response.text,
        intent: response.intent 
      };
      setMessages(prev => [...prev, assistantMessage]);
  
      if (response.text && !isSpeaking) {
        playTextToSpeech(response.text, setIsSpeaking);
      }
  
      // Handle delete requests
      if (response.intent === 'delete' && response.eventsToDelete) {
        if (response.requiresConfirmation) {
          // Store events to delete in state for confirmation
          // (For now, we'll handle this in the next user response)
          console.log('Waiting for user confirmation to delete:', response.eventsToDelete);
        }
      }
      // Handle events based on conflict status
      else if (response.requiresUserDecision && response.hasConflicts) {
        // There are conflicts - wait for user decision
        console.log('Conflicts detected, waiting for user decision');
        
      } else if (response.eventsData && Array.isArray(response.eventsData) && response.eventsData.length > 0 && googleAccessToken) {
        // No conflicts or user has made a decision - create events
        const eventsToCreate = response.eventsData.filter(e => !e.hasConflict);
        
        if (eventsToCreate.length > 0) {
          await handleMultipleEventsCreation(eventsToCreate);
        }
      } else if (response.eventsData && !googleAccessToken) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Would you like me to add these to your calendar? Please connect your Google Calendar first.'
        }]);
      }
  
      // Check if user is confirming a deletion (simple keyword matching)
      if (messages.length > 0) {
        const lastAssistantMessage = messages[messages.length - 1];
        if (lastAssistantMessage.content && lastAssistantMessage.content.includes('Would you like me to delete')) {
          const confirmWords = ['yes', 'yeah', 'sure', 'ok', 'okay', 'delete it', 'remove it', 'confirm'];
          const cancelWords = ['no', 'nope', 'cancel', 'nevermind', 'don\'t'];
          
          const lowerText = text.toLowerCase();
          
          if (confirmWords.some(word => lowerText.includes(word))) {
            // User confirmed deletion - find the event and delete it
            if (response.eventsToDelete && response.eventsToDelete.length > 0) {
              await handleEventDeletion(response.eventsToDelete[0]);
            }
          } else if (cancelWords.some(word => lowerText.includes(word))) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: 'Okay, I won\'t delete that event.'
            }]);
          }
        }
      }
  
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I'm having trouble processing that right now. ${error.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleMultipleEventsCreation = async (eventsData) => {
    try {
      let successCount = 0;
      let failCount = 0;

      for (const eventData of eventsData) {
        try {
          const createdEvent = await createCalendarEvent(googleAccessToken, eventData);
          
          setCalendarEvents(prev => [
            ...prev,
            {
              id: createdEvent.id,
              title: createdEvent.summary,
              description: createdEvent.description,
              start: new Date(createdEvent.start.dateTime || createdEvent.start.date),
              end: new Date(createdEvent.end.dateTime || createdEvent.end.date)
            }
          ]);
          
          successCount++;
        } catch (error) {
          console.error('Error creating individual event:', error);
          failCount++;
        }
      }

      // Confirmation message
      if (successCount > 0 && failCount === 0) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `✓ All ${successCount} event${successCount > 1 ? 's' : ''} added to your calendar!` 
        }]);
      } else if (successCount > 0 && failCount > 0) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `✓ ${successCount} event${successCount > 1 ? 's' : ''} added. ${failCount} failed to create.` 
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I had trouble adding those to your calendar. Please try again.'
        }]);
      }

    } catch (error) {
      console.error('Error creating multiple events:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I had trouble adding those to your calendar. Please try again.'
      }]);
    }
  };

  const handleEventDeletion = async (event) => {
    if (!googleAccessToken || !event || !event.id) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I couldn\'t delete that event. Please try again.'
      }]);
      return;
    }
  
    try {
      await deleteCalendarEvent(googleAccessToken, event.id);
      
      // Remove from local state
      setCalendarEvents(prev => prev.filter(e => e.id !== event.id));
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✓ I've deleted "${event.title}" from your calendar.`
      }]);
      
    } catch (error) {
      console.error('Error deleting event:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I had trouble deleting that event. Please try again.'
      }]);
    }
  };

  // Handle voice input completion
  const handleTranscriptComplete = async (text) => {
    setInput(''); // Clear input before processing
    await processMessage(text);
  };

  // Speech recognition hook
  const { isRecording, toggleRecording, transcript } = useSpeechToText(handleTranscriptComplete);

  // Update input field with transcript (for user to see/edit)
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Header
        clearChat={() => setMessages([])}
        toggleSettings={() => {
          setShowSettings(prev => !prev);
          if (!showSettings) setShowCalendar(false); // Close calendar when opening settings
        }}
        toggleCalendar={() => {
          setShowCalendar(prev => !prev);
          if (!showCalendar) setShowSettings(false); // Close settings when opening calendar
        }}
        showCalendar={showCalendar}
        showSettings={showSettings}
        hasCalendarAccess={!!googleAccessToken}
      />

      {!apiConfigured && (
        <div className="bg-yellow-600 text-white p-3 text-center text-sm">
          ⚠️ API not configured. Please set up your .env file with required keys.
        </div>
      )}

      {showSettings && (
        <SettingsPanel
          googleAccessToken={googleAccessToken}
          onSignIn={handleGoogleSignIn}
          onSignOut={handleGoogleSignOut}
        />
      )}

      {showCalendar && (
        <CalendarView
          googleAccessToken={googleAccessToken}
          events={calendarEvents}
          onSignIn={handleGoogleSignIn}
        />
      )}

      <MessageList 
        messages={messages} 
        loading={loading}
        isSpeaking={isSpeaking}
      />

      <InputArea
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        toggleRecording={toggleRecording}
        isRecording={isRecording}
        loading={loading}
      />
    </div>
  );
}