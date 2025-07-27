import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
    role: 'admin' | 'employee';
  };
}

// ✅ Middleware: Verify JWT and attach user info
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No Token Provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: 'admin' | 'employee' };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or Expired Token.' });
  }
};

// ✅ Middleware: Allow only admins
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

// ✅ Middleware: Allow admins or employees
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
