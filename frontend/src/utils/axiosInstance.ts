// src/utils/axiosInstance.ts

import axios from 'axios';

const api = axios.create({
  // Using Vite proxy
  baseURL: '',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Interpreting request to:', config.url, 'Token found:', !!token);
    if (token && config.headers) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
