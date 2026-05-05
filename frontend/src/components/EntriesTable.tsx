// src/components/EntriesTable.tsx

import React, { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';
import { EntryType, Entry, ItemRow, Role } from '../types';
import { Pencil, Trash2, Save, X, Plus, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  type: EntryType;
  entries: Entry[];
  units: any[];                    // units passed from Dashboard
  userRole: Role | null;
  selectedUnit: string;
  onRefresh?: () => void;          // Optional refresh callback
}

const tableHeaders: Record<EntryType, string[]> = {
  Quotation: ['quotation_no', 'company_name', 'unit', 'description', 'date', 'total'],
  Invoice: ['invoice_no', 'company_name', 'unit', 'description', 'date', 'reference_no', 'total'],
  Purchase: ['buying_company', 'selling_company', 'unit', 'amount', 'mop', 'date', 'description', 'total'],
  Sale: ['selling_company', 'buying_company', 'unit', 'amount', 'mop', 'date', 'description', 'total'],
  Expense: ['date', 'unit', 'description', 'amount', 'mop'],
  'Payment Pending': ['date', 'company_name', 'unit', 'description', 'amount', 'mop'],
  'Goods Exp': ['s_no', 'date', 'unit', 'description', 'total'],
  'Cash Exp': ['s_no', 'date', 'unit', 'description', 'total'],
};

const COMPANY_OPTIONS = ['AT', 'PAM', 'MSC', 'SRS'];

export default function EntriesTable({ type, entries, units, userRole, selectedUnit, onRefresh }: Props) {
  const [visibleRows, setVisibleRows] = useState<Entry[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<Entry>({ description: [] });
  const [newEntry, setNewEntry] = useState<Entry>({ description: [] });
  const [searchUnit, setSearchUnit] = useState<string>('All');
  const [searchNo, setSearchNo] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showLocalResults, setShowLocalResults] = useState(false);

  // Using userRole from props

  // Compute total for entries from description
  const computeTotal = (desc: ItemRow[] = []) =>
    desc.reduce((sum, i) => sum + (Number(i.quantity || 0) * Number(i.rate || 0)), 0).toFixed(2);

  const formatDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  // Apply filters whenever relevant dependencies change
  useEffect(() => {
    let filtered = [...entries];

    if (searchUnit !== 'All') {
      filtered = filtered.filter((r) => r.unit === searchUnit);
    }

    if (searchNo.trim()) {
      filtered = filtered.filter((r) => {
        const term = searchNo.toLowerCase();
        if (type === 'Sale' || type === 'Purchase') {
          return (r.unit?.toLowerCase().includes(term) ?? false) ||
                 (r.buying_company?.toLowerCase().includes(term) ?? false) ||
                 (r.selling_company?.toLowerCase().includes(term) ?? false);
        }
        return (r.quotation_no?.toLowerCase().includes(term) ?? false) ||
               (r.invoice_no?.toLowerCase().includes(searchNo.toLowerCase()) ?? false);
      });
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
  }, [entries, searchUnit, searchNo, fromDate, toDate, selectedUnit]);

  // Reset new entry form when type changes
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setNewEntry({ description: [], company_name: selectedUnit, date: today });
    setSearchUnit('All');
    setSearchNo('');
    setFromDate('');
    setToDate('');
  }, [type]);

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
      const res = await api.post(
        '/api/entries',
        { ...newEntry, type, total }
      );
      const added = res.data;
      if (onRefresh) onRefresh();
      setNewEntry({ description: [], company_name: selectedUnit, date: new Date().toISOString().split('T')[0] });
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
      const res = await api.put(`/api/entries/${editData._id}`, editData);
      if (onRefresh) onRefresh();
      setEditIndex(null);
    } catch {
      alert('Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/entries/${id}`);
      if (onRefresh) onRefresh();
    } catch {
      alert('Delete failed');
    }
  };

  return (
    <div className="p-2 space-y-4">
      {/* 🔍 Search Section */}
      <div className="flex flex-wrap gap-2">
        <select
          value={searchUnit}
          onChange={(e) => setSearchUnit(e.target.value)}
          className="border rounded p-1 bg-white dark:bg-gray-700 dark:border-gray-700 dark:text-white"
        >
          <option value="All">All Units</option>
          {units.map((unit) => (
            <option key={unit._id} value={unit.name}>
              {unit.name}
            </option>
          ))}
        </select>
        <div className="relative">
          <input
            value={searchNo}
            onChange={(e) => {
              setSearchNo(e.target.value);
              setShowLocalResults(true);
            }}
            onFocus={() => setShowLocalResults(true)}
            placeholder={type === 'Sale' || type === 'Purchase' ? "Search Unit/Company" : "Quotation/Invoice No"}
            className="border rounded p-1 bg-white dark:bg-gray-700 dark:border-gray-700 dark:text-white w-48"
          />
          {showLocalResults && searchNo.trim().length > 0 && (
            <div className="absolute top-full left-0 z-50 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-lg mt-1 max-h-40 overflow-auto">
              {entries
                .filter(e => {
                  const term = searchNo.toLowerCase();
                  if (type === 'Sale' || type === 'Purchase') {
                    return (e.unit?.toLowerCase().includes(term) ?? false) ||
                           (e.buying_company?.toLowerCase().includes(term) ?? false) ||
                           (e.selling_company?.toLowerCase().includes(term) ?? false);
                  }
                  return (e.quotation_no?.toLowerCase().includes(term) ?? false) ||
                         (e.invoice_no?.toLowerCase().includes(term) ?? false);
                })
                .slice(0, 5)
                .map((e, idx) => (
                  <div 
                    key={idx}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-xs border-b dark:border-gray-700 last:border-0 dark:text-white"
                    onClick={() => {
                      setSearchNo(e.unit || e.quotation_no || e.invoice_no || '');
                      setShowLocalResults(false);
                    }}
                  >
                    <div className="font-bold text-blue-600 dark:text-blue-400">
                      {type === 'Sale' || type === 'Purchase' ? e.unit : (e.quotation_no || e.invoice_no)}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {type === 'Sale' || type === 'Purchase' ? (e.buying_company || e.selling_company) : e.unit} - {formatDate(e.date)}
                    </div>
                  </div>
                ))}
              {entries.filter(e => {
                const term = searchNo.toLowerCase();
                if (type === 'Sale' || type === 'Purchase') {
                  return (e.unit?.toLowerCase().includes(term) ?? false);
                }
                return (e.quotation_no?.toLowerCase().includes(term) ?? false) ||
                       (e.invoice_no?.toLowerCase().includes(term) ?? false);
              }).length === 0 && (
                <div className="p-2 text-gray-400 text-xs italic text-center">No matches</div>
              )}
            </div>
          )}
        </div>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border rounded p-1 bg-white dark:bg-gray-700 dark:border-gray-700 dark:text-white"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border rounded p-1 bg-white dark:bg-gray-700 dark:border-gray-700 dark:text-white"
        />
        <button
          onClick={() => {
            // Filters are reactive
          }}
          className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1"
          type="button"
        >
          <Search size={14} /> Search
        </button>
      </div>

      {/* Click outside to close local results */}
      {showLocalResults && (
        <div 
          className="fixed inset-0 z-[40]" 
          onClick={() => setShowLocalResults(false)}
        />
      )}

      <table className="min-w-full border text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            {tableHeaders[type].map((h) => (
              <th key={h} className={`p-2 border ${h === 'description' ? 'w-1/3 min-w-[300px]' : ''}`}>
                {h.replace(/_/g, ' ')}
              </th>
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
                    <select
                      value={newEntry.unit ?? ''}
                      onChange={(e) => handleNewChange('unit', e.target.value)}
                      className="border p-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full"
                    >
                      <option value="">Select</option>
                      {units.map((unit) => (
                        <option key={unit._id} value={unit.name}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                  ) : key === 'company_name' ? (
                    <select
                      value={newEntry.company_name ?? ''}
                      onChange={(e) => handleNewChange('company_name', e.target.value)}
                      className="border p-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full"
                    >
                      <option value="">Select</option>
                      {COMPANY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  ) : key === 'description' ? (
                    <div className="space-y-1">
                      {(newEntry.description || []).map((item, i) => (
                        <div key={i} className="flex gap-1">
                          <input
                            value={item.item}
                            onChange={(e) => handleNewItemChange(i, 'item', e.target.value)}
                            className="w-16 border p-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Item"
                          />
                          <input
                            value={item.denomination}
                            onChange={(e) => handleNewItemChange(i, 'denomination', e.target.value)}
                            className="w-16 border p-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Denom"
                          />
                          <input
                            value={item.quantity}
                            onChange={(e) => handleNewItemChange(i, 'quantity', e.target.value)}
                            className="w-12 border p-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Qty"
                          />
                          <input
                            value={item.rate}
                            onChange={(e) => handleNewItemChange(i, 'rate', e.target.value)}
                            className="w-14 border p-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Rate"
                          />
                        </div>
                      ))}
                      <button onClick={handleAddRow} className="text-blue-500 text-xs">
                        + Add
                      </button>
                    </div>
                  ) : (
                    <input
                      value={newEntry[key] ?? ''}
                      onChange={(e) => handleNewChange(key, e.target.value)}
                      className="w-full border p-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  )}
                </td>
              ))}
              <td className="border p-1">
                <button onClick={handleAdd} title="Add Entry">
                  <Plus size={16} className="text-green-600" />
                </button>
              </td>
            </tr>
          )}

          {/* 🔄 Display Filtered Entries */}
          {visibleRows.length > 0 ? (
            visibleRows.map((row, idx) => (
              <tr key={row._id || idx}>
                {tableHeaders[type].map((key) => (
                  <td key={key} className="border p-1">
                    {editIndex === idx ? (
                      key === 'description' ? (
                        <div className="space-y-1">
                          {(editData.description || []).map((item, i) => (
                            <div key={i} className="flex gap-1">
                              <input
                                value={item.item}
                                onChange={(e) => handleEditItemChange(i, 'item', e.target.value)}
                                className="w-16 border p-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                              <input
                                value={item.denomination}
                                onChange={(e) => handleEditItemChange(i, 'denomination', e.target.value)}
                                className="w-16 border p-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                              <input
                                value={item.quantity}
                                onChange={(e) => handleEditItemChange(i, 'quantity', e.target.value)}
                                className="w-12 border p-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                              <input
                                value={item.rate}
                                onChange={(e) => handleEditItemChange(i, 'rate', e.target.value)}
                                className="w-14 border p-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <input
                          value={editData[key] ?? ''}
                          onChange={(e) => handleEditChange(key, e.target.value)}
                          className="w-full border p-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      )
                    ) : key === 'description' ? (
                      <ul className="text-xs">
                        {(row.description || []).map((d, i) => (
                          <li key={i}>
                            {d.item} - {d.denomination} - {d.quantity} × {d.rate}
                          </li>
                        ))}
                      </ul>
                    ) : key === 'date' ? (
                      formatDate(row.date)
                    ) : (
                      // @ts-ignore
                      row[key]
                    )}
                  </td>
                ))}
                <td className="border p-1">
                  {editIndex === idx ? (
                    <div className="flex gap-1">
                      <button onClick={handleSave} title="Save changes">
                        <Save size={16} className="text-green-600" />
                      </button>
                      <button onClick={() => setEditIndex(null)} title="Cancel edit">
                        <X size={16} className="text-gray-500" />
                      </button>
                    </div>
                  ) : userRole === 'admin' ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(idx)} title="Edit entry">
                          <Pencil size={16} className="text-blue-600" />
                        </button>
                        <button onClick={() => handleDelete(row._id!)} title="Delete entry">
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium">
                        By: {row.createdBy || 'unknown'}
                      </div>
                    </div>
                  ) : (
                    <span className="italic text-gray-400">View only</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={tableHeaders[type].length + 1} className="text-center text-gray-500 p-4">
                No entries found or data is invalid.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
