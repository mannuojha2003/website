import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Unit {
  _id: string;
  name: string;
  address: string;
  contact: string;
}

const UnitDetailPage: React.FC = () => {
  const { unitName } = useParams<{ unitName: string }>();
  const navigate = useNavigate();

  const [unit, setUnit] = useState<Unit | null>(null);
  const [editedUnit, setEditedUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Get token from localStorage
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const res = await fetch('/api/units', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const units = await res.json();
        const found = units.find((u: Unit) => u.name === unitName);
        if (found) {
          setUnit(found);
          setEditedUnit({ ...found });
        } else {
          alert('Unit not found');
          navigate('/units');
        }
      } catch (err) {
        console.error('Error fetching unit:', err);
        alert('Failed to fetch unit');
      } finally {
        setLoading(false);
      }
    };

    if (unitName) fetchUnit();
  }, [unitName, navigate, token]);

  const handleChange = (field: keyof Unit, value: string) => {
    if (!editedUnit) return;
    setEditedUnit(prev => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = async () => {
    if (!editedUnit || !editedUnit._id) return;

    try {
      const res = await fetch(`/api/units/${editedUnit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editedUnit.name,
          address: editedUnit.address,
          contact: editedUnit.contact,
        }),
      });

      if (!res.ok) throw new Error('Update failed');

      alert('Changes saved');
      navigate('/units');
    } catch (err) {
      console.error('Error updating unit:', err);
      alert('Failed to save changes');
    }
  };

  if (loading) return <div className="p-6 text-gray-700 dark:text-gray-300">Loading...</div>;
  if (!unit || !editedUnit) return null;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-blue-700 mb-4">Unit: {unit.name}</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Address:</label>
          <input
            value={editedUnit.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full border p-2 rounded bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Contact:</label>
          <input
            value={editedUnit.contact}
            onChange={(e) => handleChange('contact', e.target.value)}
            className="w-full border p-2 rounded bg-white dark:bg-gray-800"
          />
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
          <button
            onClick={() => navigate('/units')}
            className="text-gray-600 dark:text-gray-300 hover:underline"
          >
            Back to Units
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnitDetailPage;
