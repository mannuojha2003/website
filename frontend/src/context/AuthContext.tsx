// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

type Role = 'admin' | 'employee';

interface User {
  username: string;
  role: Role;
  loginTime: string;
  sessionId?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: Role | null;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;

  // Add register signature here:
  register: (username: string, password: string, role: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Load saved user and token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setUserRole(parsedUser.role);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string) => {
    // Clear any old session data first
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    
    try {
      console.log('Attempting login for:', username);
      const res = await axios.post('/api/auth/login', { username, password });
      console.log('Login response received:', res.status);

      const { token, user, sessionId } = res.data;
      console.log('User role:', user?.role);
      
      const loginTime = new Date().toISOString();
      const userWithLoginTime = { ...user, loginTime, sessionId };

      // Save token and user
      localStorage.setItem('token', token);
      if (sessionId) localStorage.setItem('sessionId', sessionId);
      localStorage.setItem('user', JSON.stringify(userWithLoginTime));
      console.log('Credentials saved to localStorage');

      setIsAuthenticated(true);
      setUserRole(user.role);
      setUser(userWithLoginTime);
      console.log('Auth state updated');
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Login failed');
    }
  };

  // Register function talking to backend
  const register = async (username: string, password: string, role: Role) => {
    try {
      const res = await axios.post('/api/auth/register', {
        username,
        password,
        role,
      });

      // Optionally, you can auto-login here or just resolve so signup page redirects user
      // For example, do nothing special:
      return;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Registration failed');
    }
  };

  const logout = async () => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      try {
        await axios.post('/api/auth/logout', { sessionId });
      } catch (err) {
        console.error('Logout error', err);
      }
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
