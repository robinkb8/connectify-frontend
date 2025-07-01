// src/components/ProtectedRoute.jsx - Fixed routing for landing page

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If route requires authentication but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to landing page (/) where login forms are located
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If route doesn't require authentication but user is authenticated (like login/register pages)
  if (!requireAuth && isAuthenticated) {
    // Redirect to home page
    const from = location.state?.from?.pathname || '/home';
    return <Navigate to={from} replace />;
  }

  // User has correct authentication status for this route
  return children;
};

export default ProtectedRoute;