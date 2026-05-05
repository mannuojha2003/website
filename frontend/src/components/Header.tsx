import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserCircle from './UserCircle';
import PendingListMenu from './PendingListMenu';
import { Search, MapPin, FileText } from 'lucide-react';
import { Entry, EntryType } from '../types';

interface HeaderProps {
  selectedMenu: string | null;
  selectedUnit: string;
  allEntries?: Entry[];
  onSearchResultClick?: (company: string, menu: EntryType) => void;
}

export default function Header({ selectedMenu, selectedUnit, allEntries = [], onSearchResultClick }: HeaderProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  const nameInitial =
    user?.role === 'admin'
      ? 'A'
      : user?.username?.[0]?.toUpperCase() || 'U';

  const loginTime = user?.loginTime || new Date().toLocaleString();
  const headerTitle = selectedMenu ? `${selectedUnit} - ${selectedMenu}` : 'Dashboard';

  // Filter entries based on search term
  const results = searchTerm.trim().length > 1
    ? allEntries.filter(e => 
        (e.quotation_no?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.invoice_no?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.buying_company?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.selling_company?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.company_name?.toLowerCase().includes(searchTerm.toLowerCase()))
      ).slice(0, 10) // Limit to 10 results
    : [];

  const handleResultClick = (e: Entry) => {
    if (onSearchResultClick) {
      onSearchResultClick(e.company_name || 'AT', e.type);
    }
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 shadow-md border-b border-gray-300 dark:border-gray-700 relative z-50 transition-colors h-20 flex items-center">
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <div className="w-full grid grid-cols-3 items-center px-4 sm:px-6 h-full">
        
        {/* 🔍 Global Search Section */}
        <div className="relative group">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 border border-transparent focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-gray-600 transition-all w-64 md:w-80">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search everywhere..." 
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full dark:text-white"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
            />
          </div>

          {/* 🔽 Search Results Dropdown */}
          {showResults && searchTerm.trim().length > 1 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 overflow-hidden animate-slideDown">
              {results.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  {results.map((res, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleResultClick(res)}
                      className="p-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-700 last:border-0 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                          {res.quotation_no || res.invoice_no || 'Entry'}
                        </span>
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                          {res.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <MapPin size={12} /> {res.company_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText size={12} /> {res.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No matching entries found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center section: Dynamic Title */}
        <div className="flex justify-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white transition tracking-wide text-center truncate px-4">
            {headerTitle}
          </h2>
        </div>

        {/* Right section: Pending List + User Circle */}
        <div className="flex justify-end items-center gap-4 sm:gap-6">
          <PendingListMenu />
          <UserCircle nameInitial={nameInitial} loginTime={loginTime} />
        </div>

      </div>
      
      {/* Click outside to close results */}
      {showResults && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
