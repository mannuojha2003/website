import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

interface SessionLog {
  _id: string;
  username: string;
  loginTime: string;
  logoutTime?: string;
  workingDurationMinutes?: number;
}

export default function EmployeeLogsPage() {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/dashboard'); // redirect non-admins
      return;
    }

    const fetchLogs = async () => {
      try {
        const res = await api.get('/api/sessions');
        setLogs(res.data);
      } catch (err) {
        console.error('Failed to fetch employee logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [userRole, navigate]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col flex-1 overflow-auto">
        <Header selectedMenu={null} selectedUnit="Employee Logs" />
        
        <main className="p-4 flex-1 overflow-auto">
          <button 
            onClick={() => navigate('/dashboard')}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow"
          >
            ← Return to Dashboard
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-2">
              Login Sessions & Working Hours
            </h3>

            {loading ? (
              <div className="text-gray-500">Loading logs...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      <th className="p-2 border dark:border-gray-600">Employee</th>
                      <th className="p-2 border dark:border-gray-600">Login Time</th>
                      <th className="p-2 border dark:border-gray-600">Logout Time</th>
                      <th className="p-2 border dark:border-gray-600">Duration (Mins)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length > 0 ? (
                      logs.map((log) => (
                        <tr key={log._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-300">
                          <td className="p-2 border dark:border-gray-600 font-semibold">{log.username}</td>
                          <td className="p-2 border dark:border-gray-600">{new Date(log.loginTime).toLocaleString()}</td>
                          <td className="p-2 border dark:border-gray-600">{log.logoutTime ? new Date(log.logoutTime).toLocaleString() : <span className="text-green-500 italic">Active Session</span>}</td>
                          <td className="p-2 border dark:border-gray-600">{log.workingDurationMinutes !== undefined ? log.workingDurationMinutes : '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500">No logs found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
