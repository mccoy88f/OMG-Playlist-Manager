import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { LogIn } from 'lucide-react';

export function LoginForm() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useStore(state => ({
    login: state.auth.login,
    loading: state.auth.loading,
    error: state.auth.error,
    clearError: state.auth.clearError
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    const success = await login(username, password);
    if (success) {
      navigate('/playlists');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-center space-x-2">
          <LogIn className="h-6 w-6" />
          <span>Login</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label 
              htmlFor="username"
              className="text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
