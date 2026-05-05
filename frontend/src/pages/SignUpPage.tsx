// src/pages/SignUpPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignUpPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'employee'>('employee');
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await register(username, password, role);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border border-gray-300 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-center">Create an Account</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="username" className="font-medium">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Enter username"
        />

        <label htmlFor="password" className="font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Enter password"
        />

        <label htmlFor="role" className="font-medium">
          Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as 'admin' | 'employee')}
          className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>

        {error && (
          <p className="text-red-600 text-center font-semibold">{error}</p>
        )}

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded mt-4"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
