// src/hooks/useSpeechToText.js
import { useState, useEffect, useRef, useCallback } from 'react';

export default function useSpeechToText(onTranscriptComplete) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const silenceTimerRef = useRef(null);
  const onTranscriptCompleteRef = useRef(onTranscriptComplete);

  // Keep the callback ref updated
  useEffect(() => {
    onTranscriptCompleteRef.current = onTranscriptComplete;
  }, [onTranscriptComplete]);

  // Stop recording function using useCallback to stabilize it
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      console.log('Manually stopping recording');
      recognitionRef.current.stop();
      setIsRecording(false);
      
      // Clear silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    }
  }, []);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      // Configuration
      recognitionInstance.continuous = true;  // Keep listening through pauses
      recognitionInstance.interimResults = true;  // Show results as user speaks
      recognitionInstance.lang = 'en-US';
      recognitionInstance.maxAlternatives = 1;

      // Handle speech recognition results
      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcriptText + ' ';
          } else {
            interimTranscript += transcriptText;
          }
        }

        // Update the accumulated final transcript
        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript;
        }

        // Show current transcript (final + interim)
        const currentTranscript = finalTranscriptRef.current + interimTranscript;
        setTranscript(currentTranscript);

        // Reset silence timer - user is still speaking
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        // Set a new silence timer - auto-stop after 2 seconds of silence
        silenceTimerRef.current = setTimeout(() => {
          if (finalTranscriptRef.current.trim()) {
            console.log('Auto-stopping after silence');
            stopRecording();
          }
        }, 1500); // Chane to 2000 for 2 seconds of silence triggers auto-stop
      };

      // Handle errors
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // Don't stop on "no-speech" error - user might just be pausing
        if (event.error !== 'no-speech') {
          setIsRecording(false);
          finalTranscriptRef.current = '';
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
        }
      };

      // Handle when recognition ends
      recognitionInstance.onend = () => {
        console.log('Recognition ended');
        
        // If we have transcript, process it
        if (finalTranscriptRef.current.trim()) {
          const finalText = finalTranscriptRef.current.trim();
          console.log('Final transcript:', finalText);
          
          setIsRecording(false);
          
          if (onTranscriptCompleteRef.current) {
            onTranscriptCompleteRef.current(finalText);
          }
          
          // Clear after a delay to allow UI to show the text
          setTimeout(() => {
            setTranscript('');
            finalTranscriptRef.current = '';
          }, 100);
        }
        
        // Clear silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      };

      recognitionRef.current = recognitionInstance;
    } else {
      console.warn('Speech recognition not supported in this browser.');
    }

    // Cleanup on unmount
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [stopRecording]); // Now stopRecording is stable via useCallback

  // Toggle recording on/off
  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) {
      console.warn('Speech recognition not available');
      return;
    }

    if (isRecording) {
      // Stop recording
      stopRecording();
    } else {
      // Start recording - clear any previous transcript
      setTranscript('');
      finalTranscriptRef.current = '';
      
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        console.log('Started recording');
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  }, [isRecording, stopRecording]);

  return { isRecording, toggleRecording, transcript };
}