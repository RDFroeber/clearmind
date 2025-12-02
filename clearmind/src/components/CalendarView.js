import React from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export default function CalendarView({ googleAccessToken, events, onSignIn }) {
  if (!googleAccessToken) {
    return (
      <div className="bg-gray-800 border-b border-gray-700 p-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-xl font-semibold text-white">Connect Your Calendar</h2>
          <p className="text-gray-400">
            Sign in to Google Calendar to view and manage your events
          </p>
          <button
            onClick={onSignIn}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg 
                     transition-colors text-white font-medium"
          >
            Connect Google Calendar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg p-4 calendar-container" style={{ height: '500px' }}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            style={{ height: '100%' }}
            views={['month', 'week', 'day']}
            defaultView="week"
          />
        </div>
        
        <div className="mt-4 text-sm text-gray-400 text-center">
          <p>{events.length} events in your calendar</p>
        </div>
      </div>
    </div>
  );
}