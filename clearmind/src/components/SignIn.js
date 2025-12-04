import React from 'react';

export default function SignIn({ onSignIn }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8 border border-purple-700">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🧠</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ClearMind AI</h1>
          <p className="text-purple-200 text-sm">
            Your empathetic assistant for the Sandwich Generation
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-lg">📅</span>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Calendar Integration</h3>
              <p className="text-gray-300 text-sm">
                Automatically schedule appointments and manage your busy life
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-lg">🎤</span>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Voice Conversations</h3>
              <p className="text-gray-300 text-sm">
                Speak naturally and get empathetic voice responses
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-lg">❤️</span>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Empathetic Support</h3>
              <p className="text-gray-300 text-sm">
                Designed for caregivers balancing parents and children
              </p>
            </div>
          </div>
        </div>

        {/* Sign In Button */}
        <button
          onClick={onSignIn}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>

        {/* Privacy Note */}
        <p className="text-xs text-gray-400 text-center mt-6">
          We'll access your Google Calendar to help manage your schedule. 
          Your data is never stored on our servers.
        </p>
      </div>
    </div>
  );
}