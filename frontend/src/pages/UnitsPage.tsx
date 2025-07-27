import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const res = await axios.get('/api/units', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnits(res.data);
    } catch (err) {
      console.error('Error loading units:', err);
    }
  };

  const handleChange = (field: keyof Unit, value: string) => {
    setNewUnit(prev => ({ ...prev, [field]: value }));
  };

  const handleAdd = async () => {
    const alphanumericRegex = /^[a-zA-Z0-9\s]+$/;

    if (!newUnit.name.trim()) {
      alert('Unit name is required.');
      return;
    }

    if (!alphanumericRegex.test(newUnit.name.trim())) {
      alert('Unit name must be alphanumeric.');
      return;
    }

    try {
      const res = await axios.post('/api/units', newUnit, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnits(prev => [...prev, res.data]);
      setNewUnit({ name: '', address: '', contact: '' });
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to add unit');
    }
  };

  const handleDelete = async (index: number) => {
    const id = units[index]._id;
    if (!id) return;
    try {
      await axios.delete(`/api/units/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnits(units.filter((_, i) => i !== index));
    } catch (err) {
      console.error('Delete failed:', err);
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
      const res = await axios.put(`/api/units/${editedUnit._id}`, editedUnit, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = [...units];
      updated[editIndex] = res.data;
      setUnits(updated);
      setEditIndex(null);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleCancel = () => {
    setEditIndex(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Unit Directory</h2>

      {/* Add Unit Form */}
      <div className="mb-4 flex gap-4 flex-wrap">
        <input
          type="text"
          value={newUnit.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Unit Name"
          className="border p-2 rounded w-52"
        />
        <input
          type="text"
          value={newUnit.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Address"
          className="border p-2 rounded w-72"
        />
        <input
          type="text"
          value={newUnit.contact}
          onChange={(e) => handleChange('contact', e.target.value)}
          placeholder="Contact"
          className="border p-2 rounded w-52"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:brightness-110"
        >
          Add Unit
        </button>
      </div>

      {/* Units Table */}
      <table className="w-full border text-left text-sm">
        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white">
          <tr>
            <th className="border px-4 py-2">#</th>
            <th className="border px-4 py-2">Unit Name</th>
            <th className="border px-4 py-2">Address</th>
            <th className="border px-4 py-2">Contact</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit, index) => (
            <tr key={unit._id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="border px-4 py-2">{index + 1}</td>
              <td className="border px-4 py-2 font-semibold text-blue-600">{unit.name}</td>

              {editIndex === index ? (
                <>
                  <td className="border px-4 py-2">
                    <input
                      value={editedUnit.address}
                      onChange={(e) => handleEditChange('address', e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      value={editedUnit.contact}
                      onChange={(e) => handleEditChange('contact', e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                  </td>
                  <td className="border px-4 py-2 space-x-2">
                    <button onClick={handleSave} className="text-green-600 hover:underline">Save</button>
                    <button onClick={handleCancel} className="text-gray-600 hover:underline">Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="border px-4 py-2">{unit.address}</td>
                  <td className="border px-4 py-2">{unit.contact}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button onClick={() => handleEdit(index)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(index)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
          {units.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">
                No units found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UnitsPage;
