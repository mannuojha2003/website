import React from 'react';
import { useAuth } from '../context/AuthContext';
import UserCircle from './UserCircle';

interface HeaderProps {
  currentOption: string;
}

export default function Header({ currentOption }: HeaderProps) {
  const { user } = useAuth();
  const nameInitial =
    user?.role === 'admin'
      ? 'A'
      : user?.username?.[0]?.toUpperCase() || 'U'; // fallback to 'U' if undefined
  const loginTime = user?.loginTime || '';

  return (
    <div className="w-full bg-white dark:bg-gray-800 shadow-md border-b border-gray-300 dark:border-gray-700 relative z-10 transition-colors">
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <div className="flex items-center justify-between px-4 sm:px-6 py-4 flex-wrap">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition">{currentOption}</h2>
        <UserCircle nameInitial={nameInitial} loginTime={loginTime} />
      </div>
    </div>
  );
}
