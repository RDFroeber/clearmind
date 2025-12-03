import React from 'react';
import { RefreshCcw, Settings, Trash2, Calendar as CalendarIcon } from 'lucide-react';

export default function Header({ 
  clearChat, 
  toggleSettings, 
  toggleCalendar, 
  showCalendar, 
  showSettings, 
  hasCalendarAccess,
  onRefreshCalendar 
}) {
  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo and title */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl md:text-2xl">🧠</span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold">ClearMind AI</h1>
            <p className="text-xs md:text-sm text-gray-400 hidden sm:block">
              Your empathetic assistant
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Refresh Calendar Button */}
          {hasCalendarAccess && (
            <button
              onClick={onRefreshCalendar}
              className="p-2 rounded-lg hover:bg-gray-700 transition"
              title="Refresh calendar events"
            >
              <RefreshCcw size={18} className="text-lg md:text-xl" />
            </button>
          )}
          
          <button
            onClick={toggleCalendar}
            className={`p-2 rounded-lg transition flex items-center gap-1 md:gap-2 ${
              showCalendar ? 'bg-white text-gray-900' : 'hover:bg-gray-700'
            }`}
            title="Calendar"
          >
            <CalendarIcon size={18} className="md:w-5 md:h-5" />
            {hasCalendarAccess && <span className="text-xs">✓</span>}
          </button>

          <button
            onClick={toggleSettings}
            className={`p-2 rounded-lg transition ${
              showSettings ? 'bg-white text-gray-900' : 'hover:bg-gray-700'
            }`}
            title="Settings"
          >
            <Settings size={18} className="md:w-5 md:h-5" />
          </button>

          <button
            onClick={clearChat}
            className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors text-white"
            title="Clear conversation"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}