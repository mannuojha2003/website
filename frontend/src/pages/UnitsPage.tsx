import React, { useState, useEffect } from 'react';
import api from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

interface Unit {
  _id?: string;
  name: string;
  address: string;
  contact: string;
}

const UnitsPage: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [newUnit, setNewUnit] = useState<Unit>({ name: '', address: '', contact: '' });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editedUnit, setEditedUnit] = useState<Unit>({ name: '', address: '', contact: '' });
  const { userRole } = useAuth();

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const res = await api.get('/api/units');
      if (Array.isArray(res.data)) {
        setUnits(res.data);
      }
    } catch (err) {
      console.error('Error loading units:', err);
    }
  };

  const handleChange = (field: keyof Unit, value: string) => {
    setNewUnit(prev => ({ ...prev, [field]: value }));
  };

  const handleAdd = async () => {
    if (!newUnit.name.trim()) {
      alert('Unit name is required.');
      return;
    }

    try {
      const res = await api.post('/api/units', newUnit);
      setUnits(prev => [...prev, res.data]);
      setNewUnit({ name: '', address: '', contact: '' });
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to add unit');
    }
  };

  const handleDelete = async (index: number) => {
    const id = units[index]._id;
    if (!id) return;
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/api/units/${id}`);
      setUnits(units.filter((_, i) => i !== index));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditedUnit(units[index]);
  };

  const handleEditChange = (field: keyof Unit, value: string) => {
    setEditedUnit(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (editIndex === null || !editedUnit._id) return;

    try {
      const res = await api.put(`/api/units/${editedUnit._id}`, editedUnit);
      const updated = [...units];
      updated[editIndex] = res.data;
      setUnits(updated);
      setEditIndex(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleCancel = () => {
    setEditIndex(null);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-400">Unit Directory</h2>

      {/* Add Unit Form */}
      <div className="mb-6 flex gap-3 flex-wrap bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700">
        <input
          type="text"
          value={newUnit.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Unit Name"
          className="border p-2 rounded w-52 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
        />
        <input
          type="text"
          value={newUnit.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Address"
          className="border p-2 rounded flex-1 min-w-[200px] dark:bg-gray-900 dark:border-gray-700 dark:text-white"
        />
        <input
          type="text"
          value={newUnit.contact}
          onChange={(e) => handleChange('contact', e.target.value)}
          placeholder="Contact"
          className="border p-2 rounded w-52 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 transition"
        >
          Add Unit
        </button>
      </div>

      {/* Units Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border dark:border-gray-700">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white">
            <tr>
              <th className="px-4 py-3 border-b dark:border-gray-600">#</th>
              <th className="px-4 py-3 border-b dark:border-gray-600">Unit Name</th>
              <th className="px-4 py-3 border-b dark:border-gray-600">Address</th>
              <th className="px-4 py-3 border-b dark:border-gray-600">Contact</th>
              <th className="px-4 py-3 border-b dark:border-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit, index) => (
              <tr key={unit._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-3 border-b dark:border-gray-700">{index + 1}</td>
                <td className="px-4 py-3 border-b dark:border-gray-700 font-semibold text-blue-600 dark:text-blue-400">{unit.name}</td>

                {editIndex === index ? (
                  <>
                    <td className="px-4 py-3 border-b dark:border-gray-700">
                      <input
                        value={editedUnit.address}
                        onChange={(e) => handleEditChange('address', e.target.value)}
                        className="w-full p-1 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      />
                    </td>
                    <td className="px-4 py-3 border-b dark:border-gray-700">
                      <input
                        value={editedUnit.contact}
                        onChange={(e) => handleEditChange('contact', e.target.value)}
                        className="w-full p-1 border rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      />
                    </td>
                    <td className="px-4 py-3 border-b dark:border-gray-700 text-right space-x-2">
                      <button onClick={handleSave} className="text-green-600 font-bold hover:underline">Save</button>
                      <button onClick={handleCancel} className="text-gray-500 hover:underline">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 border-b dark:border-gray-700 text-gray-700 dark:text-gray-300">{unit.address}</td>
                    <td className="px-4 py-3 border-b dark:border-gray-700 text-gray-700 dark:text-gray-300">{unit.contact}</td>
                    <td className="px-4 py-3 border-b dark:border-gray-700 text-right space-x-3">
                      <button onClick={() => handleEdit(index)} className="text-blue-600 hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(index)} className="text-red-600 hover:underline font-medium">Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {units.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">
                  No units registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UnitsPage;
