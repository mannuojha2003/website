import React, { useState, useEffect } from 'react';
import { getLocal, setLocal } from '../utils/localstorage';

interface Event {
  date: string;
  text: string;
}

const SchedulePlanner: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(getLocal('scheduleEvents', []));
  const [selectedDate, setSelectedDate] = useState('');
  const [eventText, setEventText] = useState('');

  useEffect(() => {
    setLocal('scheduleEvents', events);
  }, [events]);

  const addEvent = () => {
    if (!selectedDate || !eventText.trim()) return;
    setEvents([...events, { date: selectedDate, text: eventText }]);
    setSelectedDate('');
    setEventText('');
  };

  const eventsByDate = events.reduce((acc, curr) => {
    (acc[curr.date] = acc[curr.date] || []).push(curr.text);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
        <input
          value={eventText}
          onChange={(e) => setEventText(e.target.value)}
          placeholder="Event detail..."
          className="px-3 py-2 border rounded flex-1 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
        <button
          onClick={addEvent}
          className="button-primary"
        >
          Add
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto border rounded p-3 bg-white dark:bg-gray-800">
        {Object.keys(eventsByDate).length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No scheduled events.</p>
        )}
        {Object.entries(eventsByDate).map(([date, items]) => (
          <div key={date} className="mb-3">
            <h4 className="font-semibold text-textLight dark:text-textDark">{date}</h4>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
              {items.map((text, idx) => (
                <li key={idx}>{text}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchedulePlanner;
