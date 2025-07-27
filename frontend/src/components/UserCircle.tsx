import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface UserCircleProps {
  nameInitial: string;
  loginTime: string;
}

export default function UserCircle({ nameInitial, loginTime }: UserCircleProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth(); // ✅ use context-based logout

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleViewProfile = () => navigate('/view-profile');

  const handleLogout = () => {
    logout(); // ✅ Clears token and user from localStorage and context
    navigate('/login');
  };

  return (
    <div className="absolute top-4 right-4 flex flex-col items-end z-50">
      <div
        onClick={toggleDropdown}
        className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold cursor-pointer shadow-md transition hover:scale-105"
      >
        {nameInitial}
      </div>

      {dropdownOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg mt-2 py-2 px-3 text-sm space-y-1 animate-fadeIn">
          <div
            className="cursor-pointer text-purple-800 dark:text-purple-400 hover:underline"
            onClick={handleViewProfile}
          >
            👤 View Profile
          </div>
          <div
            className="cursor-pointer text-red-600 dark:text-red-400 hover:underline"
            onClick={handleLogout}
          >
            📦 Logout
          </div>
        </div>
      )}

      <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
        Login: {loginTime}
      </div>
    </div>
  );
}
