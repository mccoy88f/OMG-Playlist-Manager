import { playlists as playlistsApi } from '@/lib/api';
import { PLAYLIST_STATUS } from '@/lib/constants';

export const createPlaylistsSlice = (set, get) => ({
  playlists: {
    items: [],
    currentPlaylist: null,
    loading: false,
    error: null,
    syncStatus: {},
    
    // Carica tutte le playlist
    loadPlaylists: async () => {
      set(state => ({
        playlists: { ...state.playlists, loading: true, error: null }
      }));
      
      try {
        const items = await playlistsApi.getAll();
        set(state => ({
          playlists: { ...state.playlists, items, loading: false }
        }));
      } catch (error) {
        set(state => ({
          playlists: {
            ...state.playlists,
            error: error.response?.data?.detail || 'Failed to load playlists',
            loading: false
          }
        }));
      }
    },
    
    // Carica una singola playlist
    loadPlaylist: async (id) => {
      set(state => ({
        playlists: { ...state.playlists, loading: true, error: null }
      }));
      
      try {
        const playlist = await playlistsApi.getOne(id);
        set(state => ({
          playlists: { 
            ...state.playlists, 
            currentPlaylist: playlist,
            loading: false 
          }
        }));
      } catch (error) {
        set(state => ({
          playlists: {
            ...state.playlists,
            error: error.response?.data?.detail || 'Failed to load playlist',
            loading: false
          }
        }));
      }
    },
    
    // Crea una nuova playlist
    createPlaylist: async (data) => {
      set(state => ({
        playlists: { ...state.playlists, loading: true, error: null }
      }));
      
      try {
        const playlist = await playlistsApi.create(data);
        set(state => ({
          playlists: {
            ...state.playlists,
            items: [...state.playlists.items, playlist],
            loading: false
          }
        }));
        return playlist;
      } catch (error) {
        set(state => ({
          playlists: {
            ...state.playlists,
            error: error.response?.data?.detail || 'Failed to create playlist',
            loading: false
          }
        }));
        return null;
      }
    },
    
    // Sincronizza una playlist
    syncPlaylist: async (id) => {
      set(state => ({
        playlists: {
          ...state.playlists,
          syncStatus: {
            ...state.playlists.syncStatus,
            [id]: PLAYLIST_STATUS.SYNCING
          }
        }
      }));
      
      try {
        await playlistsApi.sync(id);
        await get().playlists.loadPlaylist(id);
        set(state => ({
          playlists: {
            ...state.playlists,
            syncStatus: {
              ...state.playlists.syncStatus,
              [id]: PLAYLIST_STATUS.SUCCESS
            }
          }
        }));
      } catch (error) {
        set(state => ({
          playlists: {
            ...state.playlists,
            syncStatus: {
              ...state.playlists.syncStatus,
              [id]: PLAYLIST_STATUS.ERROR
            },
            error: error.response?.data?.detail || 'Sync failed'
          }
        }));
      }
    },
    
    // Aggiorna l'ordine dei canali
    updateChannelOrder: async (playlistId, channelOrders) => {
      try {
        await playlistsApi.reorderChannels(playlistId, channelOrders);
        await get().playlists.loadPlaylist(playlistId);
      } catch (error) {
        set(state => ({
          playlists: {
            ...state.playlists,
            error: error.response?.data?.detail || 'Failed to reorder channels'
          }
        }));
      }
    },
    
    // Aggiorna una playlist
    updatePlaylist: async (id, data) => {
      try {
        const updatedPlaylist = await playlistsApi.update(id, data);
        set(state => ({
          playlists: {
            ...state.playlists,
            items: state.playlists.items.map(p => 
              p.id === id ? updatedPlaylist : p
            ),
            currentPlaylist: state.playlists.currentPlaylist?.id === id 
              ? updatedPlaylist 
              : state.playlists.currentPlaylist
          }
        }));
        return updatedPlaylist;
      } catch (error) {
        set(state => ({
          playlists: {
            ...state.playlists,
            error: error.response?.data?.detail || 'Failed to update playlist'
          }
        }));
        return null;
      }
    },
    
    // Pulisce lo stato corrente
    clearCurrent: () => {
      set(state => ({
        playlists: { ...state.playlists, currentPlaylist: null }
      }));
    },
    
    // Pulisce gli errori
    clearError: () => {
      set(state => ({
        playlists: { ...state.playlists, error: null }
      }));
    }
  }
});
