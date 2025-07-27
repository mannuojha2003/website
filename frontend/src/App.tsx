import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ViewProfile from './pages/ViewProfile';
import UnitsPage from './pages/UnitsPage';
import UnitDetailPage from './pages/UnitDetailPage';
import DarkModeToggle from './components/DarkModeToggle';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <DarkModeToggle />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-profile"
            element={
              <ProtectedRoute>
                <ViewProfile />
              </ProtectedRoute>
            }
          />

          {/* Unit list */}
          <Route
            path="/units"
            element={
              <ProtectedRoute>
                <UnitsPage />
              </ProtectedRoute>
            }
          />

          {/* Single unit detail */}
          <Route
            path="/units/:unitName"
            element={
              <ProtectedRoute>
                <UnitDetailPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
