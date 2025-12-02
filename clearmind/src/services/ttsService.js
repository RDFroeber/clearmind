import { fetchTTSAudio } from './speechService.js';

// Rate limiting state
let lastTTSCall = 0;
const TTS_RATE_LIMIT_MS = 3000; // 3 seconds between calls

/**
 * Plays text-to-speech with OpenAI TTS and browser fallback
 */
export async function playTextToSpeech(text, setSpeakingState) {
  // Rate limiting
  const now = Date.now();
  if (now - lastTTSCall < TTS_RATE_LIMIT_MS) {
    console.log('TTS rate limit: using browser fallback');
    speakWithBrowserTTS(text, setSpeakingState);
    return;
  }
  lastTTSCall = now;

  setSpeakingState(true);

  try {
    // Try OpenAI TTS first
    const audioBlob = await fetchTTSAudio(text);
    const audioUrl = URL.createObjectURL(audioBlob);
    
    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      setSpeakingState(false);
      URL.revokeObjectURL(audioUrl);
    };
    
    audio.onerror = () => {
      console.error('Audio playback error, falling back to browser TTS');
      speakWithBrowserTTS(text, setSpeakingState);
    };
    
    await audio.play();

  } catch (error) {
    console.error('OpenAI TTS failed, using browser fallback:', error);
    speakWithBrowserTTS(text, setSpeakingState);
  }
}

/**
 * Browser-based text-to-speech fallback
 */
function speakWithBrowserTTS(text, setSpeakingState) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    setSpeakingState(false);
    return;
  }

  setSpeakingState(true);
  window.speechSynthesis.cancel(); // Cancel any ongoing speech

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Configure for natural, calming speech
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 0.8;

  // Select best available voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(voice => 
    voice.name.includes('Natural') || 
    voice.name.includes('Premium') ||
    voice.name.includes('Enhanced')
  );
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onend = () => setSpeakingState(false);
  utterance.onerror = () => setSpeakingState(false);

  window.speechSynthesis.speak(utterance);
}

/**
 * Stop any ongoing speech
 */
export function stopSpeech(setSpeakingState) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  setSpeakingState(false);
}