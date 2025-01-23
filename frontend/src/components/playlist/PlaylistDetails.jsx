import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout';
import { ChannelList } from './ChannelList';
import { ChannelForm } from './ChannelForm';
import { PlaylistForm } from './PlaylistForm';
import { formatDate, getPublicPlaylistUrl } from '@/lib/utils';
import {
  RefreshCcw,
  Link as LinkIcon,
  Download,
  Edit,
  Settings,
  Copy,
  ExternalLink
} from 'lucide-react';

export function PlaylistDetails({ playlist }) {
  const navigate = useNavigate();
  const [editingChannel, setEditingChannel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const { syncPlaylist, generateToken } = useStore(state => ({
    syncPlaylist: state.playlists.syncPlaylist,
    generateToken: state.playlists.generateToken
  }));

  const handleSync = async () => {
    await syncPlaylist(playlist.id);
  };

  const handleGenerateToken = async () => {
    await generateToken(playlist.id);
  };

  const handleCopyUrl = () => {
    if (playlist.public_token) {
      const url = getPublicPlaylistUrl(playlist.public_token);
      navigator.clipboard.writeText(url);
    }
  };

  const handleDownload = () => {
    if (playlist.public_token) {
      window.open(getPublicPlaylistUrl(playlist.public_token), '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={playlist.name}
        description={
          <>
            {playlist.is_custom ? 'Custom Playlist' : 'M3U Playlist'} •{' '}
            {playlist.channels.length} channels •{' '}
            {playlist.last_sync && `Last sync: ${formatDate(playlist.last_sync)}`}
          </>
        }
      >
        <div className="flex items-center space-x-2">
          {/* Sync button for M3U playlists */}
          {!playlist.is_custom && playlist.url && (
            <Button
              variant="secondary"
              onClick={handleSync}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Sync Now
            </Button>
          )}

          {/* Share button */}
          {playlist.public_token ? (
            <Button
              variant="secondary"
              onClick={handleCopyUrl}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy URL
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={handleGenerateToken}
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              Make Public
            </Button>
          )}

          {/* Download button */}
          {playlist.public_token && (
            <Button
              variant="secondary"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download M3U
            </Button>
          )}

          {/* Edit button */}
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </PageHeader>

      {/* Playlist info */}
      <Card>
        <CardContent className="p-6">
          <dl className="grid gap-6 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">URL</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {playlist.url || 'Custom Playlist'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">EPG URL</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {playlist.epg_url || 'Not set'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Public URL</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {playlist.public_token ? (
                  <a
                    href={getPublicPlaylistUrl(playlist.public_token)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    View M3U
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                ) : (
                  'Not public'
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Channels */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Channels</h2>
          {playlist.is_custom && (
            <Button onClick={() => setEditingChannel({})}>
              Add Channel
            </Button>
          )}
        </div>

        <ChannelList
          playlistId={playlist.id}
          channels={playlist.channels}
          onEditChannel={setEditingChannel}
        />
      </div>

      {/* Edit Channel Modal */}
      {editingChannel && (
        <Modal
          isOpen={true}
          onClose={() => setEditingChannel(null)}
          size="lg"
        >
          <ChannelForm
            playlistId={playlist.id}
            channel={editingChannel.id ? editingChannel : null}
            onSuccess={() => setEditingChannel(null)}
            onCancel={() => setEditingChannel(null)}
          />
        </Modal>
      )}

      {/* Edit Playlist Modal */}
      {isEditing && (
        <Modal
          isOpen={true}
          onClose={() => setIsEditing(false)}
          size="lg"
        >
          <PlaylistForm
            playlist={playlist}
            onSuccess={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
          />
        </Modal>
      )}
    </div>
  );
}
