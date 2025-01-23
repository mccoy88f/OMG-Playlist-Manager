import axios from 'axios';
import { getAuthToken } from './auth';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints
export const auth = {
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const { data } = await api.post('/token', formData);
    return data;
  },
  getMe: async () => {
    const { data } = await api.get('/users/me');
    return data;
  },
};

export const playlists = {
  getAll: async () => {
    const { data } = await api.get('/playlists');
    return data;
  },
  
  getOne: async (id) => {
    const { data } = await api.get(`/playlists/${id}`);
    return data;
  },
  
  create: async (playlist) => {
    const { data } = await api.post('/playlists', playlist);
    return data;
  },
  
  update: async (id, playlist) => {
    const { data } = await api.put(`/playlists/${id}`, playlist);
    return data;
  },
  
  delete: async (id) => {
    const { data } = await api.delete(`/playlists/${id}`);
    return data;
  },
  
  sync: async (id) => {
    const { data } = await api.post(`/playlists/${id}/sync`);
    return data;
  },
  
  generateToken: async (id) => {
    const { data } = await api.post(`/playlists/${id}/generate-token`);
    return data;
  },
  
  addChannel: async (playlistId, channel) => {
    const { data } = await api.post(`/playlists/${playlistId}/channels`, channel);
    return data;
  },
  
  updateChannel: async (channelId, channel) => {
    const { data } = await api.put(`/channels/${channelId}`, channel);
    return data;
  },
  
  deleteChannel: async (channelId) => {
    const { data } = await api.delete(`/channels/${channelId}`);
    return data;
  },
  
  reorderChannels: async (playlistId, channelOrders) => {
    const { data } = await api.put(
      `/playlists/${playlistId}/channels/reorder`,
      channelOrders
    );
    return data;
  },
  
  updateEpg: async (playlistId, epgUrl) => {
    const { data } = await api.put(`/playlists/${playlistId}/epg`, { epg_url: epgUrl });
    return data;
  },
  
  getAvailableChannels: async (playlistId) => {
    const { data } = await api.get(`/playlists/${playlistId}/channels-available`);
    return data;
  },
  
  addChannelToCustom: async (playlistId, channelId) => {
    const { data } = await api.post(
      `/playlists/${playlistId}/add-channel/${channelId}`
    );
    return data;
  },
  
  removeChannelFromCustom: async (playlistId, channelId) => {
    const { data } = await api.delete(
      `/playlists/${playlistId}/channels/${channelId}`
    );
    return data;
  },
};

export default api;
