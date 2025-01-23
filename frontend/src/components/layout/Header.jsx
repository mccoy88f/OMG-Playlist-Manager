import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Menu, Plus, LogOut } from 'lucide-react';

export function Header() {
  const { user, logout, toggleSidebar } = useStore(state => ({
    user: state.auth.user,
    logout: state.auth.logout,
    toggleSidebar: state.ui.toggleSidebar
  }));

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow">
      <div className="flex h-16 items-center px-4">
        {/* Menu button */}
        <button
          onClick={toggleSidebar}
          className="mr-4 rounded-md p-2 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </button>

        {/* Logo */}
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <span className="hidden text-xl font-bold sm:inline-block">
            OMG Playlist Manager
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            {/* Add playlist button */}
            <Link to="/playlists/add">
              <Button size="sm" className="hidden sm:flex">
                <Plus className="mr-2 h-4 w-4" />
                Add Playlist
              </Button>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* User menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.username}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
