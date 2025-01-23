import { create } from 'zustand';
import { createAuthSlice } from './authSlice';
import { createPlaylistsSlice } from './playlistsSlice';
import { createUiSlice } from './uiSlice';

export const useStore = create((...args) => ({
  ...createAuthSlice(...args),
  ...createPlaylistsSlice(...args),
  ...createUiSlice(...args),
}));
