import React, { useState } from 'react';

export default function ChannelForm({ onSubmit, onCancel, initialData = {} }) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    url: initialData.url || '',
    group_title: initialData.group_title || '',
    logo_url: initialData.logo_url || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label 
          htmlFor="name" 
          className="block text-sm font-medium text-gray-700"
        >
          Channel Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label 
          htmlFor="url" 
          className="block text-sm font-medium text-gray-700"
        >
          Stream URL
        </label>
        <input
          type="url"
          id="url"
          name="url"
          value={formData.url}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label 
          htmlFor="group_title" 
          className="block text-sm font-medium text-gray-700"
        >
          Group
        </label>
        <input
          type="text"
          id="group_title"
          name="group_title"
          value={formData.group_title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label 
          htmlFor="logo_url" 
          className="block text-sm font-medium text-gray-700"
        >
          Logo URL
        </label>
        <input
          type="url"
          id="logo_url"
          name="logo_url"
          value={formData.logo_url}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          {initialData.id ? 'Update Channel' : 'Add Channel'}
        </button>
      </div>
    </form>
  );
}
