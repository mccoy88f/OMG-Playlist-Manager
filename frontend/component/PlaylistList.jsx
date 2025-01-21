import React from 'react';
import { Link } from 'react-router-dom';
import { syncPlaylist, deletePlaylist } from '../lib/api';

export default function PlaylistList({ playlists, onUpdate }) {
  const handleSync = async (id) => {
    try {
      await syncPlaylist(id);
      onUpdate();
    } catch (error) {
      console.error('Error syncing playlist:', error);
      alert('Failed to sync playlist');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this playlist?')) {
      return;
    }

    try {
      await deletePlaylist(id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting playlist:', error);
      alert('Failed to delete playlist');
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {playlists.map((playlist) => (
        <div
          key={playlist.id}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {playlist.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {playlist.channels.length} channels
            </p>
            {playlist.last_sync && (
              <p className="text-sm text-gray-500">
                Last sync: {new Date(playlist.last_sync).toLocaleString()}
              </p>
            )}
          </div>
          
          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
            <div className="flex justify-between space-x-2">
              <Link
                to={`/playlist/${playlist.id}`}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                View Details
              </Link>
              
              <div className="flex space-x-2">
                {playlist.url && (
                  <button
                    onClick={() => handleSync(playlist.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Sync
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(playlist.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
