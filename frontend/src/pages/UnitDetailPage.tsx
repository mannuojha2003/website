import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

interface Unit {
  _id: string;
  name: string;
  address: string;
  contact: string;
}

const UnitDetailPage: React.FC = () => {
  const { unitName } = useParams<{ unitName: string }>();
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const [unit, setUnit] = useState<Unit | null>(null);
  const [editedUnit, setEditedUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const res = await api.get(`/api/units/${encodeURIComponent(unitName || '')}`);
        setUnit(res.data);
        setEditedUnit({ ...res.data });
      } catch (err: any) {
        console.error('Error fetching unit:', err);
        alert(err.response?.data?.message || 'Failed to fetch unit');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (unitName) fetchUnit();
  }, [unitName, navigate]);

  const handleChange = (field: keyof Unit, value: string) => {
    if (!editedUnit) return;
    setEditedUnit(prev => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = async () => {
    if (!editedUnit || !editedUnit._id) return;

    try {
      await api.put(`/api/units/${editedUnit._id}`, {
        name: editedUnit.name,
        address: editedUnit.address,
        contact: editedUnit.contact,
      });

      alert('Changes saved successfully');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error updating unit:', err);
      alert(err.response?.data?.message || 'Failed to save changes');
    }
  };

  const handleDelete = async () => {
    if (!unit || !unit._id) return;
    if (!window.confirm(`Are you sure you want to delete unit "${unit.name}"?`)) return;

    try {
      await api.delete(`/api/units/${unit._id}`);
      alert('Unit deleted successfully');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error deleting unit:', err);
      alert(err.response?.data?.message || 'Failed to delete unit');
    }
  };

  if (loading) return <div className="p-6 text-gray-700 dark:text-gray-300">Loading Unit Details...</div>;
  if (!unit || !editedUnit) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg mt-10 border dark:border-gray-700">
      <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-6 border-b pb-2">Unit Management: {unit.name}</h2>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Unit Name:</label>
          <input
            value={editedUnit.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Location / Address:</label>
          <textarea
            value={editedUnit.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full border p-3 rounded h-24 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Contact Number:</label>
          <input
            value={editedUnit.contact}
            onChange={(e) => handleChange('contact', e.target.value)}
            className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap gap-4 pt-4 border-t dark:border-gray-700">
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-6 py-2.5 rounded font-bold hover:bg-green-700 transition shadow-md"
          >
            Save Changes
          </button>
          
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-6 py-2.5 rounded font-bold hover:bg-red-700 transition shadow-md"
          >
            Delete Unit
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="ml-auto text-gray-600 dark:text-gray-400 hover:underline font-medium"
          >
            Cancel & Return
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnitDetailPage;
