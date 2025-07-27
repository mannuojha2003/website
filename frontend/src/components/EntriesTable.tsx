import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { EntryType, Entry, ItemRow } from '../types';
import { useAuth } from '../context/AuthContext';
import { Pencil, Trash2, Save, X, Plus, Search } from 'lucide-react';

interface Props {
  type: EntryType;
}

const tableHeaders: Record<EntryType, string[]> = {
  Quotation: ['quotation_no', 'company_name', 'unit', 'description', 'date', 'total'],
  Invoice: ['invoice_no', 'company_name', 'unit', 'description', 'date', 'reference_no', 'total'],
  Purchase: ['buying_company', 'selling_company', 'unit', 'amount', 'mop', 'date', 'description', 'total'],
  'Goods Exp': ['s_no', 'date', 'unit', 'description', 'total'],
  'Cash Exp': ['s_no', 'date', 'unit', 'description', 'total'],
};

const COMPANY_OPTIONS = ['AT', 'PAM', 'MSC', 'SRS'];

export default function EntriesTable({ type }: Props) {
  const [rows, setRows] = useState<Entry[]>([]);
  const [visibleRows, setVisibleRows] = useState<Entry[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<Entry>({ description: [] });
  const [newEntry, setNewEntry] = useState<Entry>({ description: [] });
  const [units, setUnits] = useState<string[]>([]);
  const [searchUnit, setSearchUnit] = useState<string>('All');
  const [searchNo, setSearchNo] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const { userRole } = useAuth();
  const token = localStorage.getItem('token');

  const computeTotal = (desc: ItemRow[] = []) =>
    desc.reduce((sum, i) => sum + (Number(i.quantity || 0) * Number(i.rate || 0)), 0).toFixed(2);

  const formatDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  useEffect(() => {
    fetchEntries();
    const stored = localStorage.getItem('units');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUnits(parsed.map((u: any) => u.name));
      } catch {}
    }
  }, [type]);

  const fetchEntries = async () => {
    try {
      const res = await axios.get(`/api/entries?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data)) {
        setRows(res.data);
        setVisibleRows(res.data.slice(0, 5)); // show 5 by default
      } else {
        setRows([]);
        setVisibleRows([]);
      }
    } catch (err) {
      console.error('Fetch failed:', err);
    }
  };

  const handleSearch = () => {
    let filtered = [...rows];

    if (searchUnit !== 'All') {
      filtered = filtered.filter((r) => r.unit === searchUnit);
    }

    if (searchNo.trim()) {
      filtered = filtered.filter(
        (r) => r.quotation_no?.includes(searchNo) || r.invoice_no?.includes(searchNo)
      );
    }

    if (fromDate) {
      const from = new Date(fromDate);
      filtered = filtered.filter((r) => new Date(r.date) >= from);
    }

    if (toDate) {
      const to = new Date(toDate);
      filtered = filtered.filter((r) => new Date(r.date) <= to);
    }

    setVisibleRows(filtered);
  };

  const handleAddRow = () => {
    setNewEntry((prev) => ({
      ...prev,
      description: [...(prev.description || []), { item: '', denomination: '', quantity: '', rate: '' }],
    }));
  };

  const handleNewItemChange = (i: number, key: keyof ItemRow, value: string) => {
    const desc = [...(newEntry.description || [])];
    desc[i] = { ...desc[i], [key]: value };
    setNewEntry({ ...newEntry, description: desc, total: computeTotal(desc) });
  };

  const handleNewChange = (key: string, val: string) => {
    setNewEntry((prev) => ({ ...prev, [key]: val }));
  };

  const handleAdd = async () => {
    const total = computeTotal(newEntry.description || []);
    try {
      const res = await axios.post('/api/entries', { ...newEntry, type, total }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const added = res.data;
      setRows((prev) => [added, ...prev]);
      setVisibleRows((prev) => [added, ...prev]);
      setNewEntry({ description: [] });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Add failed');
    }
  };

  const handleEdit = (i: number) => {
    setEditIndex(i);
    setEditData({ ...visibleRows[i] });
  };

  const handleEditChange = (key: string, value: string) => {
    setEditData((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditItemChange = (i: number, key: keyof ItemRow, value: string) => {
    const desc = [...(editData.description || [])];
    desc[i] = { ...desc[i], [key]: value };
    setEditData({ ...editData, description: desc, total: computeTotal(desc) });
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(`/api/entries/${editData._id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = res.data;
      const newRows = [...rows];
      const origIndex = rows.findIndex((r) => r._id === updated._id);
      newRows[origIndex] = updated;
      setRows(newRows);
      handleSearch(); // re-apply filters
      setEditIndex(null);
    } catch {
      alert('Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/entries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRows((prev) => prev.filter((r) => r._id !== id));
      handleSearch();
    } catch {
      alert('Delete failed');
    }
  };

  return (
    <div className="p-2 space-y-4">
      {/* 🔍 Search Section */}
      <div className="flex flex-wrap gap-2">
        <select value={searchUnit} onChange={(e) => setSearchUnit(e.target.value)} className="border rounded p-1">
          <option value="All">All Units</option>
          {units.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
        <input value={searchNo} onChange={(e) => setSearchNo(e.target.value)} placeholder="Quotation/Invoice No" className="border rounded p-1" />
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border rounded p-1" />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border rounded p-1" />
        <button onClick={handleSearch} className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1">
          <Search size={14} /> Search
        </button>
      </div>

      <table className="min-w-full border text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            {tableHeaders[type].map((h) => (
              <th key={h} className="p-2 border">{h.replace(/_/g, ' ')}</th>
            ))}
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* ➕ New Entry Row */}
          {(userRole === 'admin' || userRole === 'employee') && (
            <tr className="bg-yellow-50 dark:bg-gray-800">
              {tableHeaders[type].map((key) => (
                <td key={key} className="border p-1">
                  {key === 'total' ? (
                    <span>{newEntry.total ?? '0.00'}</span>
                  ) : key === 'unit' ? (
                    <select value={newEntry.unit ?? ''} onChange={(e) => handleNewChange('unit', e.target.value)} className="border p-1">
                      <option value="">Select</option>
                      {units.map((u) => <option key={u}>{u}</option>)}
                    </select>
                  ) : key === 'company_name' ? (
                    <select value={newEntry.company_name ?? ''} onChange={(e) => handleNewChange('company_name', e.target.value)} className="border p-1">
                      <option value="">Select</option>
                      {COMPANY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  ) : key === 'description' ? (
                    <div className="space-y-1">
                      {(newEntry.description || []).map((item, i) => (
                        <div key={i} className="flex gap-1">
                          <input value={item.item} onChange={(e) => handleNewItemChange(i, 'item', e.target.value)} className="w-16 border p-1" placeholder="Item" />
                          <input value={item.denomination} onChange={(e) => handleNewItemChange(i, 'denomination', e.target.value)} className="w-16 border p-1" placeholder="Denom" />
                          <input value={item.quantity} onChange={(e) => handleNewItemChange(i, 'quantity', e.target.value)} className="w-12 border p-1" placeholder="Qty" />
                          <input value={item.rate} onChange={(e) => handleNewItemChange(i, 'rate', e.target.value)} className="w-14 border p-1" placeholder="Rate" />
                        </div>
                      ))}
                      <button onClick={handleAddRow} className="text-blue-500 text-xs">+ Add</button>
                    </div>
                  ) : (
                    <input value={newEntry[key] ?? ''} onChange={(e) => handleNewChange(key, e.target.value)} className="w-full border p-1" />
                  )}
                </td>
              ))}
              <td className="border p-1"><button onClick={handleAdd}><Plus size={16} className="text-green-600" /></button></td>
            </tr>
          )}

          {/* 🔄 Display Entries */}
          {Array.isArray(visibleRows) && visibleRows.length > 0 ? visibleRows.map((row, idx) => (
            <tr key={row._id || idx}>
              {tableHeaders[type].map((key) => (
                <td key={key} className="border p-1">
                  {editIndex === idx ? (
                    key === 'description' ? (
                      <div className="space-y-1">
                        {(editData.description || []).map((item, i) => (
                          <div key={i} className="flex gap-1">
                            <input value={item.item} onChange={(e) => handleEditItemChange(i, 'item', e.target.value)} className="w-16 border p-1" />
                            <input value={item.denomination} onChange={(e) => handleEditItemChange(i, 'denomination', e.target.value)} className="w-16 border p-1" />
                            <input value={item.quantity} onChange={(e) => handleEditItemChange(i, 'quantity', e.target.value)} className="w-12 border p-1" />
                            <input value={item.rate} onChange={(e) => handleEditItemChange(i, 'rate', e.target.value)} className="w-14 border p-1" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <input value={editData[key] ?? ''} onChange={(e) => handleEditChange(key, e.target.value)} className="w-full border p-1" />
                    )
                  ) : key === 'description' ? (
                    <ul className="text-xs">
                      {(row.description || []).map((d, i) => (
                        <li key={i}>{d.item} - {d.denomination} - {d.quantity} × {d.rate}</li>
                      ))}
                    </ul>
                  ) : key === 'date' ? (
                    formatDate(row.date)
                  ) : (
                    row[key]
                  )}
                </td>
              ))}
              <td className="border p-1">
                {editIndex === idx ? (
                  <div className="flex gap-1">
                    <button onClick={handleSave}><Save size={16} className="text-green-600" /></button>
                    <button onClick={() => setEditIndex(null)}><X size={16} className="text-gray-500" /></button>
                  </div>
                ) : (
                  userRole === 'admin' ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(idx)}><Pencil size={16} className="text-blue-600" /></button>
                      <button onClick={() => handleDelete(row._id!)}><Trash2 size={16} className="text-red-600" /></button>
                    </div>
                  ) : <span className="italic text-gray-400">View only</span>
                )}
              </td>
            </tr>
          )) : (
            <tr><td colSpan={tableHeaders[type].length + 1} className="text-center text-gray-500 p-4">No entries found or data is invalid.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
