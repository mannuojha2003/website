import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Entry } from '../types';
import { useAuth } from '../context/AuthContext';
import { Pencil, Trash2, Save, X, Plus, Search } from 'lucide-react';

interface Props {
  type: 'Goods Exp' | 'Cash Exp';
}

const salesHeaders = ['s_no', 'company_name', 'date', 'unit', 'description', 'denomination', 'quantity', 'rate', 'total'];
const COMPANY_OPTIONS = ['AT', 'PAM', 'MSC', 'SRS'];

const SalesTable: React.FC<Props> = ({ type }) => {
  const { userRole } = useAuth();
  const [rows, setRows] = useState<Entry[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<Entry>({ type });
  const [newEntry, setNewEntry] = useState<Entry>({ type });
  const [units, setUnits] = useState<string[]>([]);

  const [searchUnit, setSearchUnit] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchClicked, setSearchClicked] = useState(false);

  const formatDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/entries/${type}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRows(res.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();

    const stored = localStorage.getItem('units');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUnits(parsed.map((u: any) => u.name));
    }
  }, [type]);

  const handleChange = (key: string, value: string) => {
    setEditData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNewChange = (key: string, value: string) => {
    setNewEntry((prev) => ({ ...prev, [key]: value }));
  };

  const handleAdd = async () => {
    const isEmpty = salesHeaders.some((key) => key !== 'total' && !newEntry[key]);
    if (isEmpty) return alert('Please fill all fields');

    const entry = {
      ...newEntry,
      total: (Number(newEntry.quantity) * Number(newEntry.rate)).toFixed(2),
      type,
    };

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/api/entries`, entry, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRows([res.data, ...rows]);
      setNewEntry({ type });
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to add entry');
    }
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditData({ ...rows[index] });
  };

  const handleSave = async () => {
    try {
      const updatedEntry = {
        ...editData,
        total: (Number(editData.quantity) * Number(editData.rate)).toFixed(2),
      };

      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/entries/${editData._id}`, updatedEntry, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = [...rows];
      updated[editIndex!] = res.data;
      setRows(updated);
      setEditIndex(null);
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  const handleDelete = async (index: number) => {
    const entryId = rows[index]._id;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/entries/${entryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = [...rows];
      updated.splice(index, 1);
      setRows(updated);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const applyFilters = () => setSearchClicked(true);

  const filteredRows = searchClicked
    ? rows.filter((entry) => {
        const unitMatch = String(entry.unit ?? '').toLowerCase().includes(searchUnit.toLowerCase());
        const entryDate = new Date(entry.date as string);
        const isStartOK = startDate ? entryDate >= new Date(startDate) : true;
        const isEndOK = endDate ? entryDate <= new Date(endDate) : true;
        return unitMatch && isStartOK && isEndOK;
      })
    : rows.slice(0, 5);

  return (
    <div className="overflow-x-auto fade-in">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <input
          type="text"
          value={searchUnit}
          onChange={(e) => setSearchUnit(e.target.value)}
          placeholder="Search Unit"
          className="px-3 py-2 border rounded w-64 dark:bg-gray-900 dark:text-white"
        />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2 border rounded dark:bg-gray-900 dark:text-white" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2 border rounded dark:bg-gray-900 dark:text-white" />
        <button onClick={applyFilters}
          className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
          <Search size={16} />
          Search
        </button>
      </div>

      <table className="min-w-full border border-gray-300 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            {salesHeaders.map((key) => (
              <th key={key} className="px-4 py-2 border-b border-gray-300 capitalize">
                {key.replace(/_/g, ' ')}
              </th>
            ))}
            {userRole === 'admin' && (
              <th className="px-4 py-2 border-b border-gray-300">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {/* Add New Entry Row */}
          {(userRole === 'admin' || userRole === 'employee') && (
            <tr className="bg-yellow-50 dark:bg-gray-800">
              {salesHeaders.map((key) => (
                <td key={key} className="px-4 py-2 border-b">
                  {key === 'total' ? (
                    <span className="text-gray-400 italic">Auto</span>
                  ) : key === 'unit' ? (
                    <select value={newEntry.unit ?? ''} onChange={(e) => handleNewChange('unit', e.target.value)}
                      className="w-full px-2 py-1 border rounded dark:bg-gray-900 dark:text-white">
                      <option value="">Select unit</option>
                      {units.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  ) : key === 'company_name' ? (
                    <select value={newEntry.company_name ?? ''} onChange={(e) => handleNewChange('company_name', e.target.value)}
                      className="w-full px-2 py-1 border rounded dark:bg-gray-900 dark:text-white">
                      <option value="">Select company</option>
                      {COMPANY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : key === 'date' ? (
                    <input type="date" value={newEntry.date ?? ''} onChange={(e) => handleNewChange('date', e.target.value)}
                      className="w-full px-2 py-1 border rounded dark:bg-gray-900 dark:text-white" />
                  ) : (
                    <input value={newEntry[key] ?? ''} placeholder={key} onChange={(e) => handleNewChange(key, e.target.value)}
                      className="w-full px-2 py-1 border rounded dark:bg-gray-900 dark:text-white" />
                  )}
                </td>
              ))}
              <td><button onClick={handleAdd}><Plus size={18} className="text-green-600" /></button></td>
            </tr>
          )}

          {/* Display Data Rows */}
          {filteredRows.length === 0 ? (
            <tr><td colSpan={salesHeaders.length + 1} className="text-center py-4 text-gray-500">No entries found.</td></tr>
          ) : (
            filteredRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                {salesHeaders.map((key) => (
                  <td key={key} className="px-4 py-2 border-b">
                    {editIndex === idx && key !== 'total' && userRole === 'admin' ? (
                      key === 'unit' ? (
                        <select value={editData.unit ?? ''} onChange={(e) => handleChange('unit', e.target.value)}
                          className="w-full px-2 py-1 border rounded dark:bg-gray-900 dark:text-white">
                          <option value="">Select unit</option>
                          {units.map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                      ) : key === 'company_name' ? (
                        <select value={editData.company_name ?? ''} onChange={(e) => handleChange('company_name', e.target.value)}
                          className="w-full px-2 py-1 border rounded dark:bg-gray-900 dark:text-white">
                          <option value="">Select company</option>
                          {COMPANY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : key === 'date' ? (
                        <input type="date" value={editData.date ?? ''} onChange={(e) => handleChange('date', e.target.value)}
                          className="w-full px-2 py-1 border rounded dark:bg-gray-900 dark:text-white" />
                      ) : (
                        <input value={editData[key] ?? ''} onChange={(e) => handleChange(key, e.target.value)}
                          className="w-full px-2 py-1 border rounded dark:bg-gray-900 dark:text-white" />
                      )
                    ) : key === 'date' ? (
                      formatDate(row.date)
                    ) : (
                      row[key]
                    )}
                  </td>
                ))}
                {userRole === 'admin' && (
                  <td className="px-4 py-2 border-b">
                    {editIndex === idx ? (
                      <div className="flex gap-2">
                        <button onClick={handleSave}><Save size={16} className="text-green-600" /></button>
                        <button onClick={() => setEditIndex(null)}><X size={16} className="text-gray-500" /></button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(idx)}><Pencil size={16} className="text-blue-600" /></button>
                        <button onClick={() => handleDelete(idx)}><Trash2 size={16} className="text-red-600" /></button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;
