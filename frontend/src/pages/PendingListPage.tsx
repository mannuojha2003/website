import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import EntriesTable from '../components/EntriesTable';
import { EntryType, Entry } from '../types';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axiosInstance';

type PendingTab = 'Expense' | 'Invoice' | 'Payment Pending';

export default function PendingListPage() {
  const { unitName } = useParams<{ unitName: string }>();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  
  const [activeTab, setActiveTab] = useState<PendingTab>('Expense');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [units, setUnits] = useState<any[]>([]); // New state for units
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [entriesRes, unitsRes] = await Promise.all([
          api.get('/api/entries'),
          api.get('/api/units')
        ]);
        setEntries(Array.isArray(entriesRes.data) ? entriesRes.data : []);
        setUnits(Array.isArray(unitsRes.data) ? unitsRes.data : []);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEntries = entries.filter(
    e => e.unit === unitName && e.type === activeTab
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col flex-1 overflow-auto">
        <Header 
          selectedMenu={null} 
          selectedUnit={`Pending List - ${unitName}`} 
          allEntries={entries}
          onSearchResultClick={(company, menu) => navigate('/dashboard')} 
        />
        
        <main className="p-4 flex-1 overflow-auto">
          <button 
            onClick={() => navigate('/dashboard')}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded shadow hover:bg-gray-700 transition"
          >
            ← Back to Dashboard
          </button>

          {/* Top Bar Options for Pending List */}
          <div className="flex items-center justify-between border-b dark:border-gray-700 pb-2 mb-4">
            <div className="flex space-x-4">
              {(['Expense', 'Invoice', 'Payment Pending'] as PendingTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-t font-semibold transition-colors ${
                    activeTab === tab 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-gray-500">Loading entries...</div>
          ) : (
            <EntriesTable 
              type={activeTab as EntryType} 
              entries={filteredEntries} 
              units={units}
              userRole={userRole} 
              selectedUnit={unitName || ''}
            />
          )}
        </main>
      </div>
    </div>
  );
}
