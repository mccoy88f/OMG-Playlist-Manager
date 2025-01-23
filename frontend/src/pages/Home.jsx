import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store';
import { PageHeader } from '@/components/layout';
import { PlaylistList } from '@/components/playlist';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export function HomePage() {
  const { playlists, loading, error, loadPlaylists } = useStore(state => ({
    playlists: state.playlists.items,
    loading: state.playlists.loading,
    error: state.playlists.error,
    loadPlaylists: state.playlists.loadPlaylists
  }));

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button 
            variant="ghost" 
            onClick={loadPlaylists}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your Playlists"
        description={`${playlists.length} playlist${playlists.length === 1 ? '' : 's'}`}
      >
        <Link to="/playlists/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Playlist
          </Button>
        </Link>
      </PageHeader>

      <PlaylistList playlists={playlists} />
    </div>
  );
}
