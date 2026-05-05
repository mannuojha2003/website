// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { EntryType } from '../types';
import { Menu, X, Users, MapPin, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance';

interface SidebarProps {
  onSelectMenu: (menu: EntryType) => void;
  onSelectUnit: (unit: string) => void;
}

interface Unit {
  _id?: string;
  name: string;
  address: string;
  contact: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelectMenu, onSelectUnit }) => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const companies = ['AT', 'PAM', 'MSC', 'SRS'];
  const menus: EntryType[] = ['Quotation', 'Invoice', 'Sale', 'Purchase'];
  
  const [units, setUnits] = useState<Unit[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: '', address: '', contact: '' });

  React.useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const res = await api.get('/api/units');
      if (Array.isArray(res.data)) {
        setUnits(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch units', err);
    }
  };

  const handleAddUnit = async () => {
    try {
      await api.post('/api/units', newUnit);
      setNewUnit({ name: '', address: '', contact: '' });
      setShowAddUnit(false);
      fetchUnits();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add unit');
    }
  };

  const handleSubOptionClick = (company: string, menu: EntryType) => {
    onSelectUnit(company);
    onSelectMenu(menu);
  };

  return (
    <>
      <div className="px-4 py-4 bg-gray-100 dark:bg-gray-900 shadow-sm flex justify-between items-center md:hidden">
        <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle sidebar">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`w-64 px-4 py-6 bg-white dark:bg-gray-800 h-full overflow-auto shadow-md ${isOpen ? 'block' : 'hidden'} md:block`}>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 tracking-wide">COMPANIES</h2>
        {companies.map((company) => (
          <div 
            key={company} 
            className="mb-2 relative"
            onMouseEnter={() => setHoveredCompany(company)}
            onMouseLeave={() => setHoveredCompany(null)}
          >
            <div className="cursor-pointer font-semibold text-lg py-2 px-3 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200">
              {company}
            </div>
            
            {/* Dropdown Menu on Hover */}
            <div 
              className={`ml-4 mt-1 space-y-1 transition-all duration-300 ease-in-out overflow-hidden ${
                hoveredCompany === company ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              {menus.map((menu) => (
                <div
                  key={menu}
                  onClick={() => handleSubOptionClick(company, menu)}
                  className="cursor-pointer text-sm py-1.5 px-3 rounded text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-300 font-medium"
                >
                  {menu}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Admin only: Employee Logs */}
        {userRole === 'admin' && (
          <div className="mt-8 border-t dark:border-gray-700 pt-4">
            <button
              onClick={() => navigate('/employee-logs')}
              className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-semibold transition"
            >
              <Users size={20} />
              Employee Logs
            </button>
          </div>
        )}

        {/* Units Section */}
        <div className="mt-8 border-t dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wider uppercase">Units</h3>
            <button 
              onClick={() => setShowAddUnit(!showAddUnit)}
              className="text-blue-600 hover:text-blue-700"
              title="Add New Unit"
            >
              <PlusCircle size={18} />
            </button>
          </div>

          {showAddUnit && (
            <div className="px-3 mb-4 space-y-2 bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
              <input
                placeholder="Unit Name"
                className="w-full text-xs p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                value={newUnit.name}
                onChange={e => setNewUnit({...newUnit, name: e.target.value})}
              />
              <input
                placeholder="Location"
                className="w-full text-xs p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                value={newUnit.address}
                onChange={e => setNewUnit({...newUnit, address: e.target.value})}
              />
              <input
                placeholder="Contact Number"
                className="w-full text-xs p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                value={newUnit.contact}
                onChange={e => setNewUnit({...newUnit, contact: e.target.value})}
              />
              <button 
                onClick={handleAddUnit}
                className="w-full bg-blue-600 text-white text-xs py-2 rounded font-bold hover:bg-blue-700"
              >
                Save Unit
              </button>
            </div>
          )}

          <div className="space-y-1">
            {units.map(unit => (
              <div
                key={unit._id}
                onClick={() => navigate(`/units/${encodeURIComponent(unit.name)}`)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer transition"
              >
                <MapPin size={14} className="text-gray-400" />
                <span className="truncate">{unit.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
