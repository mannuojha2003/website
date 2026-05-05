import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Remove top-level JWT_SECRET constant

export interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
    role: 'admin' | 'employee';
  };
}

// Middleware: Verify JWT and attach user info
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  console.log('Incoming Authorization Header:', authHeader ? 'Present' : 'Missing');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('Authentication failed: No token provided');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: 'admin' | 'employee' };
    console.log('Token verified for user:', decoded.username);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Token verification failed:', (err as Error).message);
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// Middleware: Allow only admins
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only.' });
  }
  next();
};

// Middleware: Allow admins or employees
export const requireEmployeeOrAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !['admin', 'employee'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: Authorized roles only.' });
  }
  next();
};
