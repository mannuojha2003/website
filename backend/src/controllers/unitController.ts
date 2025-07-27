import { Request, Response } from 'express';
import Unit from '../models/Unit';

// ✅ Get all units (sorted alphabetically)
export const getAllUnits = async (_req: Request, res: Response): Promise<void> => {
  try {
    const units = await Unit.find().sort({ name: 1 });
    res.status(200).json(units);
  } catch (err) {
    console.error('❌ Error fetching units:', err);
    res.status(500).json({ message: 'Server error while fetching units.' });
  }
};

// ✅ Get a unit by name (case-insensitive)
export const getUnitByName = async (req: Request, res: Response): Promise<void> => {
  try {
    const name = req.params.name?.trim();
    if (!name) {
      res.status(400).json({ message: 'Unit name is required in the URL.' });
      return;
    }

    const unit = await Unit.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

    if (!unit) {
      res.status(404).json({ message: 'Unit not found' });
      return;
    }

    res.status(200).json(unit);
  } catch (err) {
    console.error('❌ Error fetching unit by name:', err);
    res.status(500).json({ message: 'Server error while fetching unit.' });
  }
};

// ✅ Add a new unit
export const addUnit = async (req: Request, res: Response): Promise<void> => {
  const { name, address, contact } = req.body;

  if (!name?.trim() || !address?.trim() || !contact?.trim()) {
    res.status(400).json({ message: 'All fields (name, address, contact) are required.' });
    return;
  }

  try {
    const exists = await Unit.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });

    if (exists) {
      res.status(409).json({ message: 'Unit already exists.' });
      return;
    }

    const newUnit = new Unit({
      name: name.trim(),
      address: address.trim(),
      contact: contact.trim(),
    });

    const saved = await newUnit.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Error adding unit:', err);
    res.status(500).json({ message: 'Failed to add unit due to server error.' });
  }
};

// ✅ Update a unit by ID
export const updateUnit = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, address, contact } = req.body;

  if (!name?.trim() || !address?.trim() || !contact?.trim()) {
    res.status(400).json({ message: 'All fields (name, address, contact) are required.' });
    return;
  }

  try {
    const updated = await Unit.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        address: address.trim(),
        contact: contact.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      res.status(404).json({ message: 'Unit not found.' });
      return;
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error('❌ Error updating unit:', err);
    res.status(500).json({ message: 'Failed to update unit.' });
  }
};

// ✅ Delete a unit by ID
export const deleteUnit = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const deleted = await Unit.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ message: 'Unit not found.' });
      return;
    }

    res.status(200).json({ message: 'Unit deleted successfully.' });
  } catch (err) {
    console.error('❌ Error deleting unit:', err);
    res.status(500).json({ message: 'Failed to delete unit.' });
  }
};
