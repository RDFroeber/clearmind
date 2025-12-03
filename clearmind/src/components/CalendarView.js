import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarView({ googleAccessToken, events, onSignIn }) {
  // Transform events for the calendar
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start),
    end: new Date(event.end),
    allDay: false,
  }));

  console.log('Calendar rendering:', calendarEvents.length, 'events');

  if (!googleAccessToken) {
    return (
      <div className="p-6 bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-300 mb-4">Connect your Google Calendar to view events</p>
          <button
            onClick={onSignIn}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Connect Google Calendar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 border-b border-gray-700">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg p-6" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            style={{ height: '100%' }}
            defaultView="week"
            views={['month', 'week', 'day']}
            step={30}
            showMultiDayTimes
            defaultDate={new Date()}
            popup
          />
        </div>
        <div className="text-center mt-4 text-gray-400">
          {events.length} event{events.length !== 1 ? 's' : ''} found
        </div>
      </div>
    </div>
  );
}