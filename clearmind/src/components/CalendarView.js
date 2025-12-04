import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';

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
  const [view, setView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  // Transform events for the calendar
  const calendarEvents = events.map(event => {
    // Check if it's an all-day event (date-only format, no time component)
    const isAllDayEvent = 
      (typeof event.start === 'string' && event.start.length === 10) ||
      (typeof event.start === 'string' && !event.start.includes('T'));
    
    let start, end;
    
    if (isAllDayEvent) {
      // For all-day events, parse as local date to avoid timezone issues
      // Format is YYYY-MM-DD, so we parse it explicitly
      const [startYear, startMonth, startDay] = event.start.split('-').map(Number);
      const [endYear, endMonth, endDay] = event.end.split('-').map(Number);
      
      // Create date at midnight local time
      start = new Date(startYear, startMonth - 1, startDay);
      end = new Date(endYear, endMonth - 1, endDay);
      
      console.log('All-day event:', event.title);
      console.log('  Original:', event.start, 'to', event.end);
      console.log('  Parsed:', start, 'to', end);
    } else {
      // For timed events, parse ISO string - Date constructor handles timezone automatically
      start = new Date(event.start);
      end = new Date(event.end);
      
      console.log('Timed event:', event.title);
      console.log('  Original start:', event.start);
      console.log('  Parsed start:', start.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    }
    
    return {
      id: event.id,
      title: event.title,
      start: start,
      end: end,
      allDay: isAllDayEvent,
    };
  });

  console.log('Calendar rendering:', calendarEvents.length, 'events');
  console.log('All-day events:', calendarEvents.filter(e => e.allDay).map(e => e.title));

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
    <div className="absolute top-[82px] left-0 right-0 bottom-0 bg-gray-800 z-40 overflow-y-auto">
      <div className="max-w-6xl mx-auto pt-8 ">
        <div className="rounded-lg p-6 " style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            style={{ height: '100%' }}
            view={view}
            onView={setView}
            defaultView="week"
            views={['month', 'week', 'day']}
            date={currentDate}
            onNavigate={setCurrentDate}
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