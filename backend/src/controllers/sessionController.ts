import { Request, Response } from 'express';
import Session from '../models/Session';

export const getAllSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await Session.find().sort({ loginTime: -1 });
    res.status(200).json(sessions);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ message: 'Server error while fetching sessions.' });
  }
};
