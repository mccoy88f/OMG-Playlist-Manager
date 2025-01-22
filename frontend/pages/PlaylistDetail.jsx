import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getPlaylist, 
  updatePlaylist, 
  syncPlaylist,
  addChannel,
  getPlaylistM3U
} from '../lib/api';
import PlaylistForm from '../components/PlaylistForm';
import ChannelList from '../components/ChannelList';
import ChannelForm from '../components/ChannelForm';

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      const data = await getPlaylist(id);
      setPlaylist(data);
      setError(null);
    } catch (err) {
      setError('Failed to load playlist');
      console.error('Error loading playlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  const handleUpdate = async (data) => {
    try {
      await updatePlaylist(id, data);
      await loadPlaylist();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating playlist:', error);
      alert('Failed to update playlist');
    }
  };

  const handleSync = async () => {
    if (!playlist.url) {
      alert('No URL specified for this playlist');
      return;
    }

    try {
      setSyncing(true);
      await syncPlaylist(id);
      await loadPlaylist();
    } catch (error) {
      console.error('Error syncing playlist:', error);
      alert('Failed to sync playlist');
    } finally {
      setSyncing(false);
    }
  };

  const handleAddChannel = async (data) => {
    try {
      await addChannel(id, data);
      await loadPlaylist();
      setIsAddingChannel(false);
    } catch (error) {
      console.error('Error adding channel:', error);
      alert('Failed to add channel');
    }
  };

  const handleDownloadM3U = async () => {
    try {
      const content = await getPlaylistM3U(id);
      
      // Crea un blob e un link per il download
      const blob = new Blob([content], { type: 'application/x-mpegurl' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${playlist.name}.m3u`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading M3U:', error);
      alert('Failed to download M3U file');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 text-red-800 p-4 rounded-md inline-block">
          {error || 'Playlist not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        {isEditing ? (
          <PlaylistForm 
            initialData={playlist}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {playlist.name}
                </h1>
                {playlist.url && (
                  <p className="mt-1 text-sm text-gray-500">{playlist.url}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Edit
                </button>
                {playlist.url && (
                  <button
                    onClick={handleSync}
                    disabled={syncing}
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 ${
                      syncing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {syncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                )}
                <button
                  onClick={handleDownloadM3U}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Download M3U
                </button>
              </div>
            </div>
            {playlist.last_sync && (
              <p className="text-sm text-gray-500">
                Last synced: {new Date(playlist.last_sync).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Channels */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Channels
          </h2>
          <button
            onClick={() => setIsAddingChannel(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Channel
          </button>
        </div>

        {isAddingChannel && (
          <div className="mb-6 bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add New Channel
            </h3>
            <ChannelForm
              onSubmit={handleAddChannel}
              onCancel={() => setIsAddingChannel(false)}
            />
          </div>
        )}

        <ChannelList
          channels={playlist.channels}
          playlistId={id}
          onUpdate={loadPlaylist}
        />
      </div>
    </div>
  );
}
