// backend/src/routes/logs.ts

import express from 'express';
import Log from '../models/Log';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = express.Router();

// GET logs for current user (employee) or all (admin)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const username = req.user?.username;
  const role = req.user?.role;

  try {
    const logs = await Log.find(
      role === 'admin' ? {} : { performedBy: username }
    ).sort({ timestamp: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
});

export default router;
