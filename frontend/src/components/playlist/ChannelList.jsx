import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ChannelCard } from './ChannelCard';
import { Search, GripVertical } from 'lucide-react';
import { groupChannelsByGroup } from '@/lib/utils';

export function ChannelList({ 
  playlistId, 
  channels = [], 
  onEditChannel,
  showGroups = true 
}) {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  
  const { updateChannelOrder } = useStore(state => ({
    updateChannelOrder: state.playlists.updateChannelOrder
  }));

  // Get unique groups for filter
  const groups = [...new Set(channels.map(ch => ch.group_title).filter(Boolean))];

  // Filter channels
  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = !groupFilter || channel.group_title === groupFilter;
    return matchesSearch && matchesGroup;
  });

  // Group channels if showGroups is true
  const groupedChannels = showGroups ? groupChannelsByGroup(filteredChannels) : { 'All': filteredChannels };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;

    const updatedChannels = Array.from(filteredChannels);
    const [removed] = updatedChannels.splice(sourceIndex, 1);
    updatedChannels.splice(destinationIndex, 0, removed);

    const channelOrders = updatedChannels.map((channel, index) => ({
      id: channel.id,
      position: index + 1
    }));

    await updateChannelOrder(playlistId, channelOrders);
  };

  if (channels.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">No channels found</p>
        <Button 
          className="mt-4" 
          onClick={() => onEditChannel(null)}
        >
          Add Channel
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search channels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {groups.length > 0 && (
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
          >
            <option value="">All Groups</option>
            {groups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        )}
      </div>

      {/* Channel list */}
      <DragDropContext onDragEnd={handleDragEnd}>
        {Object.entries(groupedChannels).map(([group, groupChannels]) => (
          <div key={group} className="space-y-2">
            {showGroups && groupChannels.length > 0 && (
              <h3 className="font-semibold text-gray-900">{group}</h3>
            )}
            
            <Droppable droppableId={group}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {groupChannels.map((channel, index) => (
                    <Draggable
                      key={channel.id}
                      draggableId={String(channel.id)}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`transition-shadow ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab p-2 hover:text-gray-600"
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>
                            
                            <div className="flex-1">
                              <ChannelCard
                                channel={channel}
                                onEdit={() => onEditChannel(channel)}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
}
