import express from 'express';
import { getAllSessions } from '../controllers/sessionController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, getAllSessions);

export default router;
