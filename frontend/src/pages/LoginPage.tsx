import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-light dark:bg-gradient-dark transition-colors">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-lg rounded-xl p-8 w-full max-w-sm animate-fadeIn"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {error && (
          <div className="text-red-500 text-sm mb-4 text-center font-semibold">{error}</div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Username</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 dark:text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-1">Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 dark:text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
