import React, { useRef, useEffect } from 'react';
import { Loader2, User, Bot, Calendar as CalendarIcon, Heart, HelpCircle } from 'lucide-react';

const IntentIcon = ({ intent }) => {
  switch (intent) {
    case 'event':
      return <CalendarIcon size={16} className="text-blue-400" />;
    case 'vent':
      return <Heart size={16} className="text-pink-400" />;
    case 'question':
      return <HelpCircle size={16} className="text-purple-400" />;
    default:
      return null;
  }
};

export default function MessageList({ messages, loading, isSpeaking }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
      <div className="max-w-3xl mx-auto space-y-6">  {/* Changed from space-y-4 to space-y-6 */}
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">💭</div>
            <h2 className="text-xl font-semibold mb-2">Welcome to ClearMind AI</h2>
            <p className="text-sm">
              I'm here to listen and help you manage your schedule. 
              You can vent, ask questions, or tell me about events to add to your calendar.
            </p>
            <div className="mt-6 text-xs space-y-2">
              <p className="flex items-center justify-center gap-2">
                <CalendarIcon size={14} /> Say things like: "Schedule a doctor's appointment tomorrow at 3pm"
              </p>
              <p className="flex items-center justify-center gap-2">
                <Heart size={14} /> Or just share: "I'm feeling so overwhelmed today"
              </p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 mb-4 ${  /* Added mb-4 for extra margin between messages */
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100 border border-gray-700'
              }`}
            >
              {message.role === 'assistant' && message.intent && (
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                  <IntentIcon intent={message.intent} />
                  <span className="capitalize">{message.intent}</span>
                </div>
              )}
              
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>  {/* Added leading-relaxed for better line spacing */}
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start mb-4">  {/* Added mb-4 */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3">
              <Loader2 className="animate-spin text-purple-400" size={20} />
            </div>
          </div>
        )}

        {isSpeaking && !loading && (
          <div className="flex justify-center mb-4">  {/* Added mb-4 */}
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span className="animate-pulse">🔊</span>
              Speaking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}