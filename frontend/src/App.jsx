import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { AuthGuard, RequireAuth } from '@/components/auth';
import { LoginPage } from '@/pages/Login';
// Importa altre pagine qui...

export default function App() {
  return (
    <BrowserRouter>
      <AuthGuard>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<Navigate to="/playlists" replace />} />
            {/* Add other protected routes here... */}
          </Route>
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  );
}
