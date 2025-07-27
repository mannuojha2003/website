import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import EntriesTable from '../components/EntriesTable';
import WelcomeScreen from '../components/WelcomeScreen';
import { useAuth } from '../context/AuthContext';
import { Entry, EntryType } from '../types';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const { userRole } = useAuth();
  const [selectedMenu, setSelectedMenu] = useState<EntryType | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('AT');
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all entries from backend
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/entries', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Ensure response is an array to avoid `.filter()` error
        const entries = Array.isArray(res.data) ? res.data : [];
        setAllEntries(entries);
      } catch (err) {
        console.error('Failed to fetch entries:', err);
        setAllEntries([]); // fallback to empty on error
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const isHome = !selectedMenu;

  // ✅ Filter data by selected type & unit
  const filteredData = selectedMenu
    ? allEntries.filter(
        (entry) =>
          entry.data?.type === selectedMenu && entry.data?.unit === selectedUnit
      )
    : [];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-light dark:bg-gradient-dark transition-all duration-500">
      <Sidebar
        onSelectMenu={(menu) => setSelectedMenu(menu)}
        onSelectUnit={(unit) => setSelectedUnit(unit)}
      />

      <div className="flex flex-col flex-1 overflow-hidden animate-fadeIn">
        <Header
          currentOption={
            isHome ? 'Dashboard' : `${selectedMenu} - ${selectedUnit}`
          }
        />

        <div className="p-4 overflow-auto flex-1 bg-white dark:bg-gray-900 rounded-t-md shadow-inner transition-colors duration-500">
          {loading ? (
            <div className="text-center text-gray-500">Loading entries...</div>
          ) : isHome ? (
            <WelcomeScreen />
          ) : (
            <>
              <button
                onClick={() => setSelectedMenu(null)}
                className="mb-4 px-4 py-2 bg-accent text-white rounded hover:scale-105 transition-all"
              >
                ← Return to Dashboard
              </button>
              <EntriesTable type={selectedMenu!} />

            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
