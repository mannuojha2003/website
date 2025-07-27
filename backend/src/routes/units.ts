import express, { Request, Response } from 'express';
import Unit from '../models/Unit';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * GET /api/units
 * ✅ Fetch all units (for any authenticated user)
 */
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const units = await Unit.find().sort({ name: 1 });
    res.json(units);
  } catch (error) {
    console.error('Fetch units failed:', error);
    res.status(500).json({ message: 'Failed to fetch units' });
  }
});

/**
 * GET /api/units/:name
 * ✅ Fetch a specific unit by name (case-insensitive)
 */
router.get('/:name', authenticateToken, async (req: Request, res: Response) => {
  try {
    const name = req.params.name;
    const unit = await Unit.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    res.json(unit);
  } catch (error) {
    console.error('Get unit by name failed:', error);
    res.status(500).json({ message: 'Failed to get unit' });
  }
});

/**
 * POST /api/units
 * ✅ Create a new unit (admin only)
 */
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { name, address, contact } = req.body;

  if (!name || !address || !contact) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existing = await Unit.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      return res.status(409).json({ message: 'Unit with this name already exists' });
    }

    const unit = new Unit({ name: name.trim(), address: address.trim(), contact: contact.trim() });
    await unit.save();

    res.status(201).json(unit);
  } catch (error) {
    console.error('Create unit failed:', error);
    res.status(500).json({ message: 'Error creating unit' });
  }
});

/**
 * PUT /api/units/:id
 * ✅ Update a unit (admin only)
 */
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  const { name, address, contact } = req.body;

  if (!name || !address || !contact) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const updated = await Unit.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        address: address.trim(),
        contact: contact.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'Unit not found' });

    res.json(updated);
  } catch (error) {
    console.error('Update unit failed:', error);
    res.status(500).json({ message: 'Error updating unit' });
  }
});

/**
 * DELETE /api/units/:id
 * ✅ Delete a unit (admin only)
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await Unit.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Unit not found' });

    res.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    console.error('Delete unit failed:', error);
    res.status(500).json({ message: 'Error deleting unit' });
  }
});

export default router;
