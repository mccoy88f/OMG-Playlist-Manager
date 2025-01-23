import React, { useState } from 'react';
import { useStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Plus, X } from 'lucide-react';

export function ChannelForm({ 
  playlistId, 
  channel = null, 
  onSuccess, 
  onCancel 
}) {
  const { addChannel, updateChannel } = useStore(state => ({
    addChannel: state.playlists.addChannel,
    updateChannel: state.playlists.updateChannel
  }));

  const [extraTags, setExtraTags] = useState(() => {
    if (channel?.extra_tags) {
      return Object.entries(channel.extra_tags).map(([key, value]) => ({
        key, value
      }));
    }
    return [{ key: '', value: '' }];
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Raccogli gli extra tags validi
    const validExtraTags = extraTags
      .filter(tag => tag.key && tag.value)
      .reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {});

    const data = {
      name: formData.get('name'),
      url: formData.get('url'),
      group_title: formData.get('group_title') || null,
      logo_url: formData.get('logo_url') || null,
      tvg_id: formData.get('tvg_id') || null,
      extra_tags: validExtraTags
    };

    try {
      if (channel) {
        await updateChannel(channel.id, data);
      } else {
        await addChannel(playlistId, data);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error saving channel:', error);
    }
  };

  const addExtraTag = () => {
    setExtraTags([...extraTags, { key: '', value: '' }]);
  };

  const removeExtraTag = (index) => {
    setExtraTags(extraTags.filter((_, i) => i !== index));
  };

  const updateExtraTag = (index, field, value) => {
    const newTags = [...extraTags];
    newTags[index][field] = value;
    setExtraTags(newTags);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {channel ? 'Edit Channel' : 'Add Channel'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                name="name"
                defaultValue={channel?.name}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                URL
              </label>
              <Input
                name="url"
                type="url"
                defaultValue={channel?.url}
                required
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Group
              </label>
              <Input
                name="group_title"
                defaultValue={channel?.group_title}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Logo URL
              </label>
              <Input
                name="logo_url"
                type="url"
                defaultValue={channel?.logo_url}
              />
            </div>
          </div>

          {/* TVG ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              TVG ID
            </label>
            <Input
              name="tvg_id"
              defaultValue={channel?.tvg_id}
            />
            <p className="text-sm text-gray-500">
              Used for EPG mapping
            </p>
          </div>

          {/* Extra Tags */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Extra Tags
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addExtraTag}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Tag
              </Button>
            </div>

            <div className="space-y-2">
              {extraTags.map((tag, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2"
                >
                  <Input
                    placeholder="Tag name"
                    value={tag.key}
                    onChange={(e) => updateExtraTag(index, 'key', e.target.value)}
                  />
                  <Input
                    placeholder="Tag value"
                    value={tag.value}
                    onChange={(e) => updateExtraTag(index, 'value', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExtraTag(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button type="submit">
              {channel ? 'Save Changes' : 'Add Channel'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
