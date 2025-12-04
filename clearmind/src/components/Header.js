import React from 'react';
import { RefreshCcw, Settings, Trash2, Users, Calendar as CalendarIcon } from 'lucide-react';

export default function Header({ 
  clearChat, 
  toggleSettings, 
  toggleCalendar, 
  toggleFamilyGroups,
  showFamilyGroups,
  showCalendar, 
  showSettings, 
  hasCalendarAccess,
  onRefreshCalendar 
}) {
  return (
    <header className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 border-b border-purple-700 p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo and title */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-xl md:text-2xl">🧠</span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white">ClearMind AI</h1>
            <p className="text-xs md:text-sm text-purple-200 hidden sm:block">
              Your empathetic assistant
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={toggleFamilyGroups}
            className={`p-2 rounded-lg transition flex items-center gap-1 md:gap-2 ${
              showFamilyGroups 
                ? 'bg-white text-purple-900 shadow-md' 
                : 'bg-purple-700 hover:bg-purple-600 text-purple-100'
            }`}
            title="Family Groups"
          >
            <Users size={18} className="md:w-5 md:h-5" />
          </button>
          
          {/* Refresh Calendar Button */}
          {hasCalendarAccess && (
            <button
              onClick={onRefreshCalendar}
              className="p-2 rounded-lg bg-purple-700 hover:bg-purple-600 transition text-purple-100"
              title="Refresh calendar events"
            >
              <RefreshCcw size={18} className="text-lg md:text-xl" />
            </button>
          )}
          
          <button
            onClick={toggleCalendar}
            className={`p-2 rounded-lg transition flex items-center gap-1 md:gap-2 ${
              showCalendar 
                ? 'bg-white text-purple-900 shadow-md' 
                : 'bg-purple-700 hover:bg-purple-600 text-purple-100'
            }`}
            title="Calendar"
          >
            <CalendarIcon size={18} className="md:w-5 md:h-5" />
            {hasCalendarAccess && <span className="text-xs">✓</span>}
          </button>

          <button
            onClick={toggleSettings}
            className={`p-2 rounded-lg transition ${
              showSettings 
                ? 'bg-white text-purple-900 shadow-md' 
                : 'bg-purple-700 hover:bg-purple-600 text-purple-100'
            }`}
            title="Settings"
          >
            <Settings size={18} className="md:w-5 md:h-5" />
          </button>

          <button
            onClick={clearChat}
            className="p-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-lg transition-all text-white shadow-md"
            title="Clear conversation"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}