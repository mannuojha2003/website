import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Session from '../models/Session';

// Remove top-level JWT_SECRET constant

// ✅ Register new user
export const registerUser = async (req: Request, res: Response) => {
  if (!req.body || !req.body.username || !req.body.password || !req.body.role) {
    return res.status(400).json({ error: 'Username, password, and role are required' });
  }

  const { username, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
    const token = jwt.sign({ id: newUser._id, username: newUser.username, role: newUser.role }, JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// ✅ Login user
export const loginUser = async (req: Request, res: Response) => {
  if (!req.body || !req.body.username || !req.body.password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, {
      expiresIn: '1d',
    });

    const newSession = new Session({
      username: user.username,
      loginTime: new Date(),
    });
    await newSession.save();

    res.json({
      message: 'Login successful',
      token,
      sessionId: newSession._id,
      user: { username: user.username, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// ✅ Logout user and calculate working time
export const logoutUser = async (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }

  try {
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    session.logoutTime = new Date();
    const diffMs = session.logoutTime.getTime() - session.loginTime.getTime();
    session.workingDurationMinutes = Math.round(diffMs / 60000); // convert ms to mins
    
    await session.save();
    res.json({ message: 'Logout successful', session });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Server error during logout' });
  }
};
