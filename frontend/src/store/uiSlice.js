import { TOAST_TYPES } from '@/lib/constants';

export const createUiSlice = (set, get) => ({
  ui: {
    toast: null,
    modal: null,
    sidebar: {
      isOpen: true,
      content: null
    },
    
    // Toast notifications
    showToast: (message, type = TOAST_TYPES.INFO) => {
      set(state => ({
        ui: {
          ...state.ui,
          toast: { message, type }
        }
      }));

      // Auto-hide toast after 5 seconds
      setTimeout(() => {
        set(state => ({
          ui: {
            ...state.ui,
            toast: null
          }
        }));
      }, 5000);
    },

    clearToast: () => {
      set(state => ({
        ui: {
          ...state.ui,
          toast: null
        }
      }));
    },

    // Modal management
    showModal: (content) => {
      set(state => ({
        ui: {
          ...state.ui,
          modal: content
        }
      }));
    },

    closeModal: () => {
      set(state => ({
        ui: {
          ...state.ui,
          modal: null
        }
      }));
    },

    // Sidebar management
    toggleSidebar: () => {
      set(state => ({
        ui: {
          ...state.ui,
          sidebar: {
            ...state.ui.sidebar,
            isOpen: !state.ui.sidebar.isOpen
          }
        }
      }));
    },

    setSidebarContent: (content) => {
      set(state => ({
        ui: {
          ...state.ui,
          sidebar: {
            ...state.ui.sidebar,
            content
          }
        }
      }));
    }
  }
});
