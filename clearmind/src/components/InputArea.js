import React from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';

export default function InputArea({ 
  input, 
  setInput, 
  sendMessage, 
  toggleRecording, 
  isRecording, 
  loading 
}) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-4 bg-gray-800 border-t border-gray-700">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-2 items-end">
          {/* Voice input button */}
          <button
            onClick={toggleRecording}
            disabled={loading}
            className={`flex-shrink-0 px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-700 animate-pulse shadow-lg shadow-red-500/50' 
                : 'bg-purple-600 hover:bg-purple-700'
            } disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium`}
            title={isRecording ? 'Click to stop recording' : 'Start recording'}
          >
            {isRecording ? (
              <>
                <MicOff size={20} />
                <span className="hidden sm:inline">Stop</span>
              </>
            ) : (
              <>
                <Mic size={20} />
                <span className="hidden sm:inline">Voice</span>
              </>
            )}
          </button>

          {/* Text input */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? "Listening... (click Stop when done)" : "Type your message or use voice input..."}
            disabled={loading || isRecording}
            rows={1}
            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                     resize-none disabled:opacity-50 text-white placeholder-gray-400
                     min-h-[48px] max-h-[120px]"
            style={{
              height: 'auto',
              overflowY: input.length > 100 ? 'auto' : 'hidden'
            }}
          />

          {/* Send button */}
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim() || isRecording}
            className="flex-shrink-0 px-6 py-3 bg-blue-600 hover:bg-blue-700 
                     disabled:bg-gray-600 disabled:cursor-not-allowed 
                     rounded-lg transition-colors flex items-center gap-2 text-white font-medium"
            title="Send message"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Send size={20} />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </div>

        {/* Helper text */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          {isRecording ? (
            <span className="text-red-400 animate-pulse">
              🎤 Recording... Click "Stop" when finished or pause for 2 seconds
            </span>
          ) : (
            <span>Press Enter to send • Shift+Enter for new line</span>
          )}
        </div>
      </div>
    </div>
  );
}