import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { VALIDATION_RULES } from '@/lib/constants';

export function PlaylistForm({ playlist = null }) {
  const navigate = useNavigate();
  const { createPlaylist, updatePlaylist } = useStore(state => ({
    createPlaylist: state.playlists.createPlaylist,
    updatePlaylist: state.playlists.updatePlaylist
  }));

  const isEditing = !!playlist;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      url: formData.get('url') || null,
      epg_url: formData.get('epg_url') || null,
      is_custom: formData.get('is_custom') === 'true'
    };

    try {
      if (isEditing) {
        await updatePlaylist(playlist.id, data);
        navigate(`/playlists/${playlist.id}`);
      } else {
        const newPlaylist = await createPlaylist(data);
        navigate(`/playlists/${newPlaylist.id}`);
      }
    } catch (error) {
      console.error('Error saving playlist:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Playlist' : 'Create New Playlist'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name field */}
          <div className="space-y-2">
            <label 
              htmlFor="name"
              className="text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <Input
              id="name"
              name="name"
              defaultValue={playlist?.name}
              required
              minLength={VALIDATION_RULES.NAME.minLength.value}
            />
          </div>

          {/* URL field */}
          <div className="space-y-2">
            <label 
              htmlFor="url"
              className="text-sm font-medium text-gray-700"
            >
              M3U URL (optional)
            </label>
            <Input
              id="url"
              name="url"
              type="url"
              defaultValue={playlist?.url}
              placeholder="https://example.com/playlist.m3u"
            />
            <p className="text-sm text-gray-500">
              Leave empty for a custom playlist
            </p>
          </div>

          {/* EPG URL field */}
          <div className="space-y-2">
            <label 
              htmlFor="epg_url"
              className="text-sm font-medium text-gray-700"
            >
              EPG URL (optional)
            </label>
            <Input
              id="epg_url"
              name="epg_url"
              type="url"
              defaultValue={playlist?.epg_url}
              placeholder="https://example.com/epg.xml"
            />
          </div>

          {/* Custom playlist toggle */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_custom"
                value="true"
                defaultChecked={playlist?.is_custom}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Custom Playlist
              </span>
            </label>
            <p className="text-sm text-gray-500">
              Custom playlists allow you to manually add and organize channels
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Save Changes' : 'Create Playlist'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
