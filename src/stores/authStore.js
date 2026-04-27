/**
 * @store AuthStore
 * @description Centralized auth state using Zustand.
 * Handles persistence and session restoration from JWT.
 */
import { create } from 'zustand';
import apiClient, { storeTokens, clearTokens } from '../lib/apiClient.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  role: null,
  loading: true,
  initialized: false,

  /** Restore session from localStorage on app mount */
  init: async () => {
    const token = localStorage.getItem('mukth_access_token');
    if (!token) {
      set({ loading: false, initialized: true });
      return;
    }

    try {
      const { data } = await apiClient.get('/auth/me');
      const user = data.data;
      set({ 
        user, 
        profile: { ...user, full_name: user.name }, 
        role: user.role, 
        loading: false,
        initialized: true 
      });
    } catch (err) {
      console.error('Session restoration failed:', err);
      clearTokens();
      set({ user: null, profile: null, role: null, loading: false, initialized: true });
    }
  },

  /** Log in and update state instantly */
  login: async (email, password) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    const { user, accessToken } = data.data;
    
    storeTokens(accessToken);
    set({ 
      user, 
      profile: { ...user, full_name: user.name }, 
      role: user.role 
    });
    return user;
  },

  /** Register and update state instantly */
  register: async (email, password, metadata) => {
    const { data } = await apiClient.post('/auth/register', { 
      email, 
      password, 
      ...metadata 
    });
    const { user, accessToken } = data.data;
    
    storeTokens(accessToken);
    set({ 
      user, 
      profile: { ...user, full_name: user.name }, 
      role: user.role 
    });
    return user;
  },

  /** Invalidate session locally and on server */
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.warn('Server-side logout failed, clearing local session anyway.');
    }
    clearTokens();
    set({ user: null, profile: null, role: null });
  },

  /** Update user profile in state and DB */
  updateProfile: async (updates) => {
    const userId = get().user?._id;
    if (!userId) return;

    const { data } = await apiClient.patch(`/users/${userId}`, updates);
    const updatedUser = data.data;
    
    set((state) => ({ 
      user: { ...state.user, ...updatedUser }, 
      profile: { ...state.profile, ...updatedUser } 
    }));
  },
}));
