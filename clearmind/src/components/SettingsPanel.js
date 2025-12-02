import React from 'react';
import { CheckCircle, Calendar, XCircle, LogOut } from 'lucide-react';

export default function SettingsPanel({ googleAccessToken, onSignIn, onSignOut }) {
  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>⚙️</span> Settings
        </h2>

        {/* Google Calendar Connection */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-400" size={24} />
              <div>
                <h3 className="font-medium text-white">Google Calendar</h3>
                <p className="text-sm text-gray-400">
                  {googleAccessToken 
                    ? 'Connected - Events will be automatically added'
                    : 'Connect to enable calendar features'
                  }
                </p>
              </div>
            </div>

            {googleAccessToken ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle size={20} />
                  <span className="text-sm font-medium">Connected</span>
                </div>
                <button
                  onClick={onSignOut}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg 
                           transition-colors text-white font-medium text-sm flex items-center gap-2"
                  title="Sign out of Google Calendar"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg 
                         transition-colors text-white font-medium"
              >
                Connect Calendar
              </button>
            )}
          </div>
        </div>

        {/* API Status */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            {process.env.REACT_APP_API_BASE_URL ? (
              <>
                <CheckCircle className="text-green-400" size={24} />
                <div>
                  <h3 className="font-medium text-white">API Connected</h3>
                  <p className="text-sm text-gray-400">
                    Backend service is configured
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="text-red-400" size={24} />
                <div>
                  <h3 className="font-medium text-white">API Not Configured</h3>
                  <p className="text-sm text-gray-400">
                    Please set REACT_APP_API_BASE_URL in your .env file
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Session Info */}
        {googleAccessToken && (
          <div className="text-xs text-gray-500 space-y-1">
            <p>🔒 Your Google Calendar token is stored securely in your browser</p>
            <p>⏰ Token will expire after 1 hour of inactivity</p>
          </div>
        )}

        {/* About */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>🧠 ClearMind AI - Your empathetic assistant for managing life's demands</p>
          <p>Built for the Sandwich Generation: caring for aging parents while raising children</p>
        </div>
      </div>
    </div>
  );
}