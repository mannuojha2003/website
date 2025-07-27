// backend/src/routes/entries.ts

import express from 'express';
import {
  getAllEntries,
  addEntry,
  updateEntry,
  deleteEntry,
} from '../controllers/entryController';

import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// ✅ Get all entries – both admin & employee can view
router.get('/', authenticateToken, getAllEntries);

// ✅ Add new entry – both admin & employee can add
router.post('/', authenticateToken, addEntry);

// ✅ Update entry – only admin can edit
router.put('/:id', authenticateToken, requireAdmin, updateEntry);

// ✅ Delete entry – only admin can delete
router.delete('/:id', authenticateToken, requireAdmin, deleteEntry);

export default router;
