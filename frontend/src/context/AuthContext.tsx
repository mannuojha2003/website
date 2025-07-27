// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

type Role = 'admin' | 'employee';

interface User {
  username: string;
  role: Role;
  loginTime: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: Role | null;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
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
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });

      const { token, user } = res.data;
      const loginTime = new Date().toISOString();
      const userWithLoginTime = { ...user, loginTime };

      // Save token and user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userWithLoginTime));

      setIsAuthenticated(true);
      setUserRole(user.role);
      setUser(userWithLoginTime);
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, user, login, logout }}>
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
