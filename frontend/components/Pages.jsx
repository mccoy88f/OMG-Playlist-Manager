import React, { useState, useEffect } from 'react';
import { getPlaylists } from '../lib/api';
import PlaylistList from '../components/PlaylistList';

export default function Home() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const data = await getPlaylists();
      setPlaylists(data);
      setError(null);
    } catch (err) {
      setError('Failed to load playlists');
      console.error('Error loading playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 text-red-800 p-4 rounded-md inline-block">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Your Playlists
        </h1>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">
            No playlists yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by adding your first playlist
          </p>
        </div>
      ) : (
        <PlaylistList 
          playlists={playlists} 
          onUpdate={loadPlaylists} 
        />
      )}
    </div>
  );
}
