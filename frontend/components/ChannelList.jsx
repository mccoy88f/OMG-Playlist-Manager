import React, { useState } from 'react';
import { deleteChannel, updateChannel } from '../lib/api';
import ChannelForm from './ChannelForm';

export default function ChannelList({ channels, playlistId, onUpdate }) {
  const [editingChannel, setEditingChannel] = useState(null);
  const [groupFilter, setGroupFilter] = useState('');
  
  // Get unique groups for filter
  const groups = [...new Set(channels.map(ch => ch.group_title).filter(Boolean))];
  
  // Filter channels by group
  const filteredChannels = groupFilter 
    ? channels.filter(ch => ch.group_title === groupFilter)
    : channels;

  const handleDelete = async (channelId) => {
    if (!confirm('Are you sure you want to delete this channel?')) {
      return;
    }

    try {
      await deleteChannel(channelId);
      onUpdate();
    } catch (error) {
      console.error('Error deleting channel:', error);
      alert('Failed to delete channel');
    }
  };

  const handleUpdate = async (channelId, data) => {
    try {
      await updateChannel(channelId, data);
      setEditingChannel(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating channel:', error);
      alert('Failed to update channel');
    }
  };

  return (
    <div>
      {/* Group filter */}
      {groups.length > 0 && (
        <div className="mb-4">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Groups</option>
            {groups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
      )}

      {/* Channels list */}
      <div className="space-y-4">
        {filteredChannels.map((channel) => (
          <div 
            key={channel.id} 
            className="bg-white shadow rounded-lg p-4"
          >
            {editingChannel === channel.id ? (
              <ChannelForm
                initialData={channel}
                onSubmit={(data) => handleUpdate(channel.id, data)}
                onCancel={() => setEditingChannel(null)}
              />
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {channel.name}
                    </h3>
                    {channel.group_title && (
                      <p className="text-sm text-gray-500">
                        Group: {channel.group_title}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {channel.url}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingChannel(channel.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(channel.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {channel.logo_url && (
                  <img 
                    src={channel.logo_url} 
                    alt={`${channel.name} logo`}
                    className="mt-2 h-8 w-auto"
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
