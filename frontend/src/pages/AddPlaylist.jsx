import React from 'react';
import { PageHeader } from '@/components/layout';
import { PlaylistForm } from '@/components/playlist';

export function AddPlaylistPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Playlist"
        description="Create a new M3U or custom playlist"
      />

      <PlaylistForm />

      <div className="mt-8 rounded-lg bg-blue-50 p-4">
        <h3 className="text-sm font-medium text-blue-800">Tips</h3>
        <ul className="mt-2 list-inside list-disc text-sm text-blue-700">
          <li>
            For M3U playlists, use a direct URL to your playlist file
          </li>
          <li>
            Custom playlists allow you to manually add and organize channels
          </li>
          <li>
            You can add an EPG URL to get program guide information
          </li>
          <li>
            Make your playlist public to share it with others
          </li>
        </ul>
      </div>
    </div>
  );
}
