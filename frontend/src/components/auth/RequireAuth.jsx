import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '@/lib/auth';

export function RequireAuth({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    // Redirect alla login mantenendo la route di origine
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
