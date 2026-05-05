// src/pages/SignInOptionPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignInOptionPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border border-gray-300 rounded-lg shadow-md text-center">
      <h2 className="text-2xl font-semibold mb-6">Welcome!</h2>
      <p className="mb-6">Please choose how you want to continue</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
        >
          Sign In
        </button>
        <button
          onClick={() => navigate('/signup')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
