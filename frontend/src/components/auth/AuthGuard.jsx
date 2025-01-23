import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store';
import { isAuthenticated } from '@/lib/auth';

export function AuthGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const checkAuth = useStore(state => state.auth.checkAuth);
  
  useEffect(() => {
    const init = async () => {
      // Se non siamo in login e non siamo autenticati, redirect
      if (!isAuthenticated() && location.pathname !== '/login') {
        navigate('/login', { replace: true });
        return;
      }

      // Se siamo autenticati ma il token potrebbe essere scaduto
      if (isAuthenticated()) {
        const isValid = await checkAuth();
        if (!isValid && location.pathname !== '/login') {
          navigate('/login', { replace: true });
        }
      }
    };

    init();
  }, [location.pathname, navigate, checkAuth]);

  // Se siamo in login e siamo già autenticati, redirect alla home
  useEffect(() => {
    if (isAuthenticated() && location.pathname === '/login') {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  return children;
}
