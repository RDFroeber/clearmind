import React from 'react';
import { Trash2, Settings, Calendar, Check } from 'lucide-react';

export default function Header({ 
  clearChat, 
  toggleSettings, 
  toggleCalendar,
  showCalendar,
  showSettings,
  hasCalendarAccess 
}) {
  return (
    <header className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-full p-2 w-12 h-12 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🧠</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">ClearMind AI</h1>
            <p className="text-sm text-purple-100">Your empathetic assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleCalendar}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${
              showCalendar 
                ? 'bg-white text-purple-600' 
                : 'bg-purple-700 hover:bg-purple-800 text-white'
            }`}
            title={hasCalendarAccess ? 'View Calendar' : 'Connect Calendar'}
          >
            <Calendar size={20} />
            {hasCalendarAccess && <Check size={16} className="text-green-500" />}
          </button>

          <button
            onClick={toggleSettings}
            className={`p-2 rounded-lg transition-colors ${
              showSettings 
                ? 'bg-white text-purple-600' 
                : 'bg-purple-700 hover:bg-purple-800 text-white'
            }`}
            title="Settings"
          >
            <Settings size={20} />
          </button>

          <button
            onClick={clearChat}
            className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors text-white"
            title="Clear conversation"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}