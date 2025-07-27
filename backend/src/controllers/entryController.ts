import { Request, Response } from 'express';
import Entry from '../models/Entry';

// GET all entries
export const getAllEntries = async (req: Request, res: Response) => {
  try {
    const entries = await Entry.find().sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (err) {
    console.error('Error fetching entries:', err);
    res.status(500).json({ message: 'Server error while fetching entries.' });
  }
};

// POST add new entry
export const addEntry = async (req: Request, res: Response) => {
  try {
    const { type, company_name, unit, description, date, ...rest } = req.body;

    if (!type || !company_name || !unit || !description || !Array.isArray(description)) {
      return res.status(400).json({ message: 'Missing required fields or invalid description.' });
    }

    const total = description.reduce((sum: number, item: any) => {
      const qty = parseFloat(item.quantity || '0');
      const rate = parseFloat(item.rate || '0');
      return sum + qty * rate;
    }, 0);

    const entry = new Entry({
      type,
      company_name,
      unit,
      description,
      date,
      total: total.toFixed(2),
      ...rest,
    });

    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    console.error('Error adding entry:', err);
    res.status(400).json({ message: 'Failed to add entry.' });
  }
};

// PUT update entry
export const updateEntry = async (req: Request, res: Response) => {
  try {
    const { description } = req.body;

    let total = 0;
    if (Array.isArray(description)) {
      total = description.reduce((sum: number, item: any) => {
        const qty = parseFloat(item.quantity || '0');
        const rate = parseFloat(item.rate || '0');
        return sum + qty * rate;
      }, 0);
    }

    const updated = await Entry.findByIdAndUpdate(
      req.params.id,
      { ...req.body, total: total.toFixed(2) },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Entry not found' });

    res.json(updated);
  } catch (err) {
    console.error('Error updating entry:', err);
    res.status(500).json({ message: 'Failed to update entry.' });
  }
};

// DELETE entry
export const deleteEntry = async (req: Request, res: Response) => {
  try {
    const deleted = await Entry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Entry not found' });

    res.json({ message: 'Entry deleted successfully' });
  } catch (err) {
    console.error('Error deleting entry:', err);
    res.status(500).json({ message: 'Failed to delete entry.' });
  }
};
