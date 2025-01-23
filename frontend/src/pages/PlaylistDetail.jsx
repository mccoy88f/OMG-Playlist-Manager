import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { PlaylistDetails } from '@/components/playlist';
import { Button } from '@/components/ui/Button';

export function PlaylistDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { playlist, loading, error, loadPlaylist } = useStore(state => ({
    playlist: state.playlists.currentPlaylist,
    loading: state.playlists.loading,
    error: state.playlists.error,
    loadPlaylist: state.playlists.loadPlaylist
  }));

  useEffect(() => {
    loadPlaylist(id);
    
    // Cleanup on unmount
    return () => {
      useStore.getState().playlists.clearCurrent();
    };
  }, [id, loadPlaylist]);

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
          <div className="mt-4 space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => loadPlaylist(id)}
            >
              Try Again
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/playlists')}
            >
              Back to Playlists
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Playlist not found</p>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/playlists')}
            className="mt-4"
          >
            Back to Playlists
          </Button>
        </div>
      </div>
    );
  }

  return <PlaylistDetails playlist={playlist} />;
}
