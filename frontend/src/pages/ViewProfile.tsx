import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface ChangeLog {
  action: string;
  timestamp: string;
  performedBy: string;
}

const ViewProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('All');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/logs', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const logs = Array.isArray(res.data) ? res.data : [];
        setChangeLogs(logs);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
        setChangeLogs([]); // fallback to empty array
      }
    };

    fetchLogs();
  }, [user, navigate]);

  if (!user) return null;

  const userOptions = Array.from(new Set(changeLogs.map(log => log.performedBy)));

  const visibleLogs =
    user.role === 'admin'
      ? selectedUser === 'All'
        ? changeLogs
        : changeLogs.filter(log => log.performedBy === selectedUser)
      : changeLogs.filter(log => log.performedBy === user.username);

  return (
    <div className="p-6 max-w-3xl mx-auto bg-dashboard-gradient min-h-screen fade-in transition-bg">
      <h2 className="text-2xl font-bold mb-6 text-textLight dark:text-textDark">👤 User Profile</h2>

      <div className="card space-y-2 mb-6">
        <p className="text-textLight dark:text-textDark">
          <strong>User ID:</strong> {user.username}
        </p>
        <p className="text-textLight dark:text-textDark">
          <strong>Role:</strong> {user.role}
        </p>
        <p className="text-textLight dark:text-textDark">
          <strong>Login Time:</strong> {user.loginTime}
        </p>
      </div>

      {user.role === 'admin' && (
        <div className="card mb-4">
          <h3 className="text-lg font-semibold mb-2 text-textLight dark:text-textDark">
            🔍 Filter Logs by User
          </h3>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2 border rounded dark:bg-gray-900 dark:text-white"
          >
            <option value="All">All Users</option>
            {userOptions.map((username) => (
              <option key={username} value={username}>
                {username}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold mb-2 text-textLight dark:text-textDark">📜 Change Logs</h3>
        {visibleLogs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No actions recorded yet.</p>
        ) : (
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {visibleLogs.map((log, index) => (
              <li key={index}>
                <span className="font-medium">{log.performedBy}</span> - {log.action} at{' '}
                {new Date(log.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ViewProfile;
