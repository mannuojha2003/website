import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance';

interface Unit {
  _id?: string;
  name: string;
}

export default function PendingListMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await api.get('/api/units');
        setUnits(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch units:', err);
      }
    };
    fetchUnits();
  }, []);

  const handleUnitClick = (unitName: string) => {
    setIsOpen(false);
    navigate(`/pending-list/${encodeURIComponent(unitName)}`);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-blue-600 text-white rounded font-semibold shadow hover:bg-blue-700 transition"
      >
        Pending List
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-lg z-50 max-h-64 overflow-y-auto">
          {units.length > 0 ? (
            units.map(unit => (
              <div 
                key={unit._id || unit.name}
                onClick={() => handleUnitClick(unit.name)}
                className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-200"
              >
                {unit.name}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 text-sm">No units found</div>
          )}
        </div>
      )}
    </div>
  );
}
