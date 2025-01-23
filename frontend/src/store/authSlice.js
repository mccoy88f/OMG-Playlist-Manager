import { auth as authApi } from '@/lib/api';
import { setAuthToken, removeAuthToken, getUserFromToken } from '@/lib/auth';

export const createAuthSlice = (set, get) => ({
  auth: {
    user: getUserFromToken(),
    loading: false,
    error: null,
    
    login: async (username, password) => {
      set(state => ({
        auth: { ...state.auth, loading: true, error: null }
      }));
      
      try {
        const response = await authApi.login(username, password);
        setAuthToken(response.access_token);
        const user = getUserFromToken();
        
        set(state => ({
          auth: { ...state.auth, user, loading: false }
        }));
        
        return true;
      } catch (error) {
        set(state => ({
          auth: {
            ...state.auth,
            error: error.response?.data?.detail || 'Login failed',
            loading: false
          }
        }));
        return false;
      }
    },
    
    logout: () => {
      removeAuthToken();
      set(state => ({
        auth: { ...state.auth, user: null }
      }));
    },
    
    checkAuth: async () => {
      try {
        const user = await authApi.getMe();
        set(state => ({
          auth: { ...state.auth, user }
        }));
        return true;
      } catch (error) {
        removeAuthToken();
        set(state => ({
          auth: { ...state.auth, user: null }
        }));
        return false;
      }
    },
    
    clearError: () => {
      set(state => ({
        auth: { ...state.auth, error: null }
      }));
    }
  }
});
