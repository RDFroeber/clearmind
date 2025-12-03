import React, { useState } from 'react';
import { Mic, Send, Keyboard, X } from 'lucide-react';

export default function InputArea({ 
  input, 
  setInput, 
  sendMessage, 
  toggleRecording, 
  isRecording, 
  loading 
}) {
  const [showTextInput, setShowTextInput] = useState(false);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage();
      setShowTextInput(false); // Close text input after sending
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextInputToggle = () => {
    setShowTextInput(!showTextInput);
    if (showTextInput) {
      setInput(''); // Clear input when closing
    }
  };

  return (
    <div className="border-t border-gray-700 bg-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Text Input Mode (Hidden by default on mobile) */}
        {showTextInput ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 bg-gray-700 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="3"
                autoFocus
              />
              <button
                onClick={handleTextInputToggle}
                className="px-4 bg-gray-600 hover:bg-gray-500 rounded-lg transition flex items-center justify-center"
                title="Close text input"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition flex items-center gap-2"
              >
                <Send size={16} />
                Send
              </button>
            </div>
          </div>
        ) : (
          /* Voice Input Mode (Default) */
          <div className="flex flex-col items-center gap-4">
            {/* Large Voice Button */}
            <button
              onClick={toggleRecording}
              disabled={loading}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse scale-110'
                  : 'bg-purple-600 hover:bg-purple-700 hover:scale-105'
              } disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg`}
              title={isRecording ? 'Stop recording' : 'Start recording'}
            >
              <Mic size={32} className="text-white" />
            </button>

            {/* Status Text */}
            <div className="text-center">
              {isRecording ? (
                <div className="space-y-1">
                  <p className="text-red-400 font-semibold text-lg">Recording...</p>
                  <p className="text-gray-400 text-sm">
                    Click again to stop or pause for 2 seconds
                  </p>
                </div>
              ) : loading ? (
                <p className="text-gray-400">Processing...</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-gray-300 text-lg">Tap to speak</p>
                  <p className="text-gray-500 text-sm">Voice is the easiest way to interact</p>
                </div>
              )}
            </div>

            {/* Show current transcript if recording */}
            {isRecording && input && (
              <div className="w-full bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-gray-300 italic">"{input}"</p>
              </div>
            )}

            {/* Toggle to Text Input Button */}
            <button
              onClick={handleTextInputToggle}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm text-gray-300"
              disabled={loading}
            >
              <Keyboard size={16} />
              <span>Type instead</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}