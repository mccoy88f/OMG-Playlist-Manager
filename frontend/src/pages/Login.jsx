import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="mb-8 text-2xl font-bold">
            OMG Playlist Manager
          </h1>
        </div>
        
        <LoginForm />
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Use username: admin, password: admin to login
        </p>
      </div>
    </div>
  );
}
