let lastTTSCall = 0;
const TTS_RATE_LIMIT = 3000; // 3 seconds between OpenAI TTS calls

/**
 * Play text-to-speech with user's preferred settings
 */
export async function playTextToSpeech(text, setIsSpeaking, userSettings = null) {
  if (!text) return;

  // Check if TTS is enabled
  if (userSettings && !userSettings.tts?.enabled) {
    console.log('TTS disabled by user settings');
    return;
  }

  setIsSpeaking(true);

  try {
    const now = Date.now();
    const timeSinceLastCall = now - lastTTSCall;

    // Try OpenAI TTS if not rate limited
    if (timeSinceLastCall >= TTS_RATE_LIMIT) {
      try {
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';
        
        // Pass voice and speed preferences
        const voice = userSettings?.tts?.voice || 'nova';
        const speed = userSettings?.tts?.speed || 0.95;
        
        const response = await fetch(`${apiBaseUrl}/speech/tts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            text,
            voice,  // Pass user's voice preference
            speed   // Pass user's speed preference
          }),
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);

          audio.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
          };

          await audio.play();
          lastTTSCall = now;
          return;
        }
      } catch (error) {
        console.warn('OpenAI TTS failed, falling back to browser TTS:', error);
      }
    }

    // Fallback to browser TTS
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply user settings
    utterance.rate = userSettings?.tts?.speed || 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    // Try to use a natural voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      voice => voice.name.includes('Natural') || voice.name.includes('Premium')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Error with text-to-speech:', error);
    setIsSpeaking(false);
  }
}

/**
 * Stop any ongoing speech
 */
export function stopSpeech() {
  window.speechSynthesis.cancel();
}