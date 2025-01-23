import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/store';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { RefreshCcw, Trash2, ExternalLink, Settings } from 'lucide-react';

export function PlaylistList({ playlists = [] }) {
  const { syncPlaylist, deletePlaylist, showModal } = useStore(state => ({
    syncPlaylist: state.playlists.syncPlaylist,
    deletePlaylist: state.playlists.deletePlaylist,
    showModal: state.ui.showModal
  }));

  const handleSync = async (id) => {
    await syncPlaylist(id);
  };

  const handleDelete = async (playlist) => {
    showModal({
      title: 'Delete Playlist',
      children: (
        <div>
          <p className="mb-4">
            Are you sure you want to delete "{playlist.name}"?
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              onClick={() => showModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                await deletePlaylist(playlist.id);
                showModal(null);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      )
    });
  };

  if (playlists.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">No playlists found</p>
          <Link to="/playlists/add">
            <Button className="mt-4">Add Playlist</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {playlists.map(playlist => (
        <Card key={playlist.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="truncate">{playlist.name}</span>
              {playlist.is_custom && (
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                  Custom
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Channels</p>
                  <p className="font-medium">{playlist.channels.length}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Sync</p>
                  <p className="font-medium">
                    {playlist.last_sync ? formatDate(playlist.last_sync) : 'Never'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between space-x-2">
                <div className="space-x-2">
                  {playlist.url && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSync(playlist.id)}
                    >
                      <RefreshCcw className="mr-1 h-4 w-4" />
                      Sync
                    </Button>
                  )}
                  
                  {playlist.public_token && (
                    <Button
                      size="sm"
                      variant="ghost"
                      as="a"
                      href={`/api/playlists/${playlist.public_token}/m3u`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-1 h-4 w-4" />
                      M3U
                    </Button>
                  )}
                </div>

                <div className="space-x-2">
                  <Link to={`/playlists/${playlist.id}`}>
                    <Button size="sm" variant="secondary">
                      <Settings className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(playlist)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
