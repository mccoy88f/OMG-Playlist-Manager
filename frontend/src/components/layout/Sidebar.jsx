import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { 
  Library, 
  ListMusic, 
  Settings,
  PlusCircle,
  X 
} from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const { isOpen, toggleSidebar } = useStore(state => ({
    isOpen: state.ui.sidebar.isOpen,
    toggleSidebar: state.ui.toggleSidebar
  }));

  const navigation = [
    {
      name: 'All Playlists',
      href: '/playlists',
      icon: Library,
      match: /^\/playlists(?!\/add)/
    },
    {
      name: 'Add Playlist',
      href: '/playlists/add',
      icon: PlusCircle,
      match: /^\/playlists\/add/
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      match: /^\/settings/
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-white shadow-lg transition-transform lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-end p-4 lg:hidden">
          <button
            onClick={toggleSidebar}
            className="rounded-md p-2 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close sidebar</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = item.match.test(location.pathname);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
                  'hover:bg-gray-100',
                  isActive 
                    ? 'bg-gray-100 text-blue-600' 
                    : 'text-gray-700'
                )}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    toggleSidebar();
                  }
                }}
              >
                <Icon 
                  className={cn(
                    'mr-3 h-5 w-5',
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  )} 
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Additional content */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <ListMusic className="h-10 w-10 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                OMG Playlist Manager
              </p>
              <p className="text-xs text-gray-500">
                Version 0.1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
