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
  const { logout } = useAuth();

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleViewProfile = () => navigate('/view-profile');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Parse login time to separate Date and Time
  const dateObj = new Date(loginTime);
  const formattedDate = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString() : '';
  const formattedTime = !isNaN(dateObj.getTime()) ? dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : loginTime;

  return (
    <div className="relative flex items-center gap-3">
      {/* Date and Time Info */}
      <div className="text-right hidden sm:block">
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Logged In</div>
        <div className="text-xs text-gray-800 dark:text-gray-200">{formattedTime}</div>
        <div className="text-xs text-gray-800 dark:text-gray-200">{formattedDate}</div>
      </div>

      {/* Circle Badge */}
      <div
        onClick={toggleDropdown}
        className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold cursor-pointer shadow-md transition hover:scale-105"
        title="Account Options"
      >
        {nameInitial}
      </div>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 top-12 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 px-3 text-sm space-y-1 animate-fadeIn border dark:border-gray-700 min-w-[120px]">
          <div
            className="cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 py-1"
            onClick={handleViewProfile}
          >
            <span>👤</span> Profile
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <div
            className="cursor-pointer text-red-600 dark:text-red-400 hover:underline flex items-center gap-2 py-1"
            onClick={handleLogout}
          >
            <span>🚪</span> Logout
          </div>
        </div>
      )}
    </div>
  );
}
