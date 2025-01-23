// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PLAYLISTS: '/playlists',
  PLAYLIST_DETAIL: '/playlists/:id',
  ADD_PLAYLIST: '/playlists/add',
  EDIT_PLAYLIST: '/playlists/:id/edit',
};

// Query keys for React Query
export const QUERY_KEYS = {
  ME: 'me',
  PLAYLISTS: 'playlists',
  PLAYLIST: 'playlist',
  AVAILABLE_CHANNELS: 'available-channels',
};

// Tipi di playlist
export const PLAYLIST_TYPES = {
  NORMAL: 'normal',
  CUSTOM: 'custom',
};

// Stati delle playlist
export const PLAYLIST_STATUS = {
  SYNCING: 'syncing',
  ERROR: 'error',
  SUCCESS: 'success',
};

// Tipi di messaggi toast
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

// Configurazione per react-beautiful-dnd
export const DND_TYPES = {
  CHANNEL: 'channel',
};

// Regole di validazione comuni
export const VALIDATION_RULES = {
  REQUIRED: { required: 'Questo campo è obbligatorio' },
  URL: { 
    pattern: {
      value: /^https?:\/\/.+/i,
      message: 'Inserisci un URL valido'
    }
  },
  NAME: {
    required: 'Il nome è obbligatorio',
    minLength: {
      value: 3,
      message: 'Il nome deve essere di almeno 3 caratteri'
    }
  },
};

// Timings
export const TIMINGS = {
  TOAST_DURATION: 5000,
  SYNC_POLLING_INTERVAL: 5000,
};

// Media queries
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};
