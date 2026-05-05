// src/pages/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import EntriesTable from '../components/EntriesTable';
import WelcomeScreen from '../components/WelcomeScreen';
import { useAuth } from '../context/AuthContext';
import { Entry, EntryType } from '../types';
import api from '../utils/axiosInstance';

const Dashboard: React.FC = () => {
  const { userRole } = useAuth();

  const [selectedMenu, setSelectedMenu] = useState<EntryType | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('AT');
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [units, setUnits] = useState<any[]>([]); // New state for units
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesRes, unitsRes] = await Promise.all([
        api.get('/api/entries'),
        api.get('/api/units')
      ]);
      setAllEntries(Array.isArray(entriesRes.data) ? entriesRes.data : []);
      setUnits(Array.isArray(unitsRes.data) ? unitsRes.data : []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isHome = !selectedMenu;

  const filteredData = selectedMenu
    ? allEntries.filter(
        (entry) => entry.type === selectedMenu && entry.company_name === selectedUnit
      )
    : [];

  const handleGlobalSearchResult = (company: string, menu: EntryType) => {
    setSelectedUnit(company);
    setSelectedMenu(menu);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onSelectMenu={setSelectedMenu} onSelectUnit={setSelectedUnit} />
      <div className="flex flex-col flex-1 overflow-auto">
        <Header 
          selectedMenu={selectedMenu} 
          selectedUnit={selectedUnit} 
          allEntries={allEntries}
          onSearchResultClick={handleGlobalSearchResult}
        />
        <main className="p-4 flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {loading ? (
            <div>Loading entries...</div>
          ) : isHome ? (
            <WelcomeScreen />
          ) : (
            <>
              <button
                onClick={() => setSelectedMenu(null)}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:scale-105 transition-transform"
              >
                ← Return to Dashboard
              </button>

              <EntriesTable
                type={selectedMenu!}
                entries={filteredData}
                units={units}
                userRole={userRole}
                selectedUnit={selectedUnit}
                onRefresh={fetchData}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
