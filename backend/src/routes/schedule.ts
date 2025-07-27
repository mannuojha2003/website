import express from 'express';
import Schedule from '../models/Schedule';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// GET all schedule events
router.get('/', authenticateToken, async (req, res) => {
  try {
    const events = await Schedule.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// POST a new schedule event
router.post('/', authenticateToken , async (req, res) => {
  const { date, text } = req.body;
  if (!date || !text) return res.status(400).json({ error: 'Date and text required' });

  try {
    const event = new Schedule({ date, text });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save event' });
  }
});

export default router;
