// src/components/Sidebar.tsx

import React, { useState, useEffect } from 'react';
import { EntryType } from '../types';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // ✅ added

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
  const companies = ['AT', 'PAM', 'MSC', 'SRS'];
  const menus: EntryType[] = ['Quotation', 'Invoice', 'Purchase'];
  const salesMenus: EntryType[] = ['Goods Exp', 'Cash Exp'];

  const [units, setUnits] = useState<Unit[]>([]);
  const [activeCompany, setActiveCompany] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [showSales, setShowSales] = useState(false);
  const [newUnit, setNewUnit] = useState<Unit>({ name: '', address: '', contact: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const { userRole } = useAuth(); // ✅ get role

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const res = await axios.get('/api/units', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setUnits(data);
    } catch (err) {
      console.error('Failed to fetch units:', err);
      setUnits([]);
    }
  };

  const handleCompanyClick = (company: string) => {
    setActiveCompany(prev => (prev === company ? null : company));
    onSelectUnit(company);
  };

  const handleAddUnit = async () => {
    const trimmedName = newUnit.name.trim();
    const alphanumericRegex = /^[a-zA-Z0-9\s]+$/;

    if (!trimmedName) return alert('Unit name is required.');
    if (!alphanumericRegex.test(trimmedName)) return alert('Unit name must be alphanumeric.');
    if (units.some(u => u.name.toLowerCase() === trimmedName.toLowerCase())) return alert('A unit with this name already exists.');

    try {
      const res = await axios.post('/api/units', newUnit, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnits(prev => [...prev, res.data]);
      setNewUnit({ name: '', address: '', contact: '' });
      setShowAddForm(false);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        alert('Only admins can add new units.');
      } else {
        alert(err?.response?.data?.message || 'Failed to add unit');
      }
    }
  };

  const handleUnitClick = (unitName: string) => {
    onSelectUnit(unitName);
    navigate(`/units/${encodeURIComponent(unitName)}`);
  };

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg border-r transform transition-transform duration-300 z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:block`}
      >
        <div className="relative h-full">
          <div className="p-4 space-y-4 pb-24 overflow-y-auto">
            <ul className="space-y-4">
              {companies.map(company => (
                <li key={company}>
                  <div
                    onClick={() => handleCompanyClick(company)}
                    className={`cursor-pointer font-semibold text-md transition-colors hover:text-blue-600 ${
                      activeCompany === company ? 'text-blue-600' : 'text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {company}
                  </div>
                  {activeCompany === company && (
                    <ul className="ml-4 mt-2 space-y-1 animate-fadeIn">
                      {menus.map(menu => (
                        <li
                          key={menu}
                          onClick={() => onSelectMenu(menu)}
                          className="cursor-pointer text-sm text-gray-600 dark:text-gray-300 hover:underline"
                        >
                          {menu}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}

              {/* Sales Section */}
              <li>
                <div
                  onClick={() => setShowSales(prev => !prev)}
                  className="cursor-pointer font-semibold text-md text-gray-800 dark:text-gray-200 hover:text-blue-600"
                >
                  Sales
                </div>
                {showSales && (
                  <ul className="ml-4 mt-2 space-y-1 animate-fadeIn">
                    {salesMenus.map(menu => (
                      <li
                        key={menu}
                        onClick={() => onSelectMenu(menu)}
                        className="cursor-pointer text-sm text-gray-600 dark:text-gray-300 hover:underline"
                      >
                        {menu}
                      </li>
                    ))}
                  </ul>
                )}
              </li>

              {/* Units Section */}
              <li>
                <div className="font-semibold text-md text-gray-700 dark:text-gray-300">
                  Units
                </div>
                <ul className="ml-2 mt-2 space-y-1">
                  {Array.isArray(units) && units.length > 0 ? (
                    units.map(unit => (
                      <li
                        key={unit._id || unit.name}
                        onClick={() => handleUnitClick(unit.name)}
                        className="cursor-pointer text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600"
                      >
                        {unit.name}
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-gray-500 italic">No units found</li>
                  )}
                </ul>

                {/* Only allow admin to add */}
                {userRole === 'admin' && (
                  <>
                    <button
                      onClick={() => setShowAddForm(prev => !prev)}
                      className="mt-3 text-blue-500 text-xs hover:underline"
                    >
                      + Add Unit
                    </button>

                    {showAddForm && (
                      <div className="mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="text"
                          placeholder="Name"
                          value={newUnit.name}
                          onChange={e => setNewUnit({ ...newUnit, name: e.target.value })}
                          className="w-full p-1 rounded bg-white dark:bg-gray-800 border text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Address"
                          value={newUnit.address}
                          onChange={e => setNewUnit({ ...newUnit, address: e.target.value })}
                          className="w-full p-1 rounded bg-white dark:bg-gray-800 border text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Contact"
                          value={newUnit.contact}
                          onChange={e => setNewUnit({ ...newUnit, contact: e.target.value })}
                          className="w-full p-1 rounded bg-white dark:bg-gray-800 border text-sm"
                        />
                        <button
                          onClick={handleAddUnit}
                          className="w-full p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Save Unit
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
