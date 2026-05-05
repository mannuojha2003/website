// src/components/SchedulePlanner.tsx
import React, { useState, useEffect } from 'react';
import api from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Trash2 } from 'lucide-react';

interface Event {
  _id?: string;
  date: string;
  text: string;
}

const SchedulePlanner: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [eventText, setEventText] = useState('');
  const { isAuthenticated } = useAuth();

  const fetchEvents = async () => {
    try {
      const res = await api.get('/api/schedule');
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch events', err);
      setEvents([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchEvents();
  }, [isAuthenticated]);

  const addEvent = async () => {
    if (!selectedDate || !eventText.trim()) return;
    try {
      const res = await api.post('/api/schedule', { date: selectedDate, text: eventText });
      setEvents([...events, res.data]);
      setSelectedDate('');
      setEventText('');
    } catch (err) {
      console.error('Failed to add event', err);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await api.delete(`/api/schedule/${id}`);
      setEvents(events.filter(e => e._id !== id));
    } catch (err) {
      console.error('Failed to delete event', err);
    }
  };

  const eventsByDate = events.reduce((acc, curr) => {
    const date = curr.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(curr);
    return acc;
  }, {} as Record<string, Event[]>);

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
        {Object.entries(eventsByDate)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([date, items]) => (
          <div key={date} className="mb-3">
            <h4 className="font-semibold text-textLight dark:text-textDark border-b dark:border-gray-700 pb-1 mb-2">{date}</h4>
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item._id} className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2 rounded group">
                  <span>{item.text}</span>
                  <button 
                    onClick={() => deleteEvent(item._id!)} 
                    className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchedulePlanner;
