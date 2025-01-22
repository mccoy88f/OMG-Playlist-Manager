import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlaylistForm from '../components/PlaylistForm';
import { createPlaylist } from '../lib/api';

export default function AddPlaylist() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      const newPlaylist = await createPlaylist(data);
      
      if (data.url) {
        // Se c'è un URL, reindirizza alla pagina di dettaglio per iniziare la sincronizzazione
        navigate(`/playlist/${newPlaylist.id}`);
      } else {
        // Altrimenti torna alla home
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Add New Playlist
        </h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <PlaylistForm onSubmit={handleSubmit} />
      </div>

      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-blue-900">Tips</h3>
        <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
          <li>For M3U playlists, paste the direct URL to your playlist file</li>
          <li>For custom playlists, check the "Custom Playlist" option and add channels manually later</li>
          <li>Playlist name should be descriptive and unique</li>
        </ul>
      </div>
    </div>
  );
}
