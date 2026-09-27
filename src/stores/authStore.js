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
      const user = data?.data;
      if (user) {
        set({ 
          user, 
          profile: { ...user, full_name: user.name || user.fullName }, 
          role: user.role, 
          loading: false,
          initialized: true 
        });
      } else {
        clearTokens();
        set({ user: null, profile: null, role: null, loading: false, initialized: true });
      }
    } catch (err) {
      console.error('Session restoration failed:', err);
      clearTokens();
      set({ user: null, profile: null, role: null, loading: false, initialized: true });
    }
  },

  /** Log in and update state instantly */
  login: async (email, password) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    const user = data?.data?.user;
    const accessToken = data?.data?.accessToken;
    
    if (accessToken) storeTokens(accessToken);
    if (user) {
      set({ 
        user, 
        profile: { ...user, full_name: user.name || user.fullName }, 
        role: user.role 
      });
    }
    return user;
  },

  /** Register and update state instantly */
  register: async (email, password, metadata) => {
    const { data } = await apiClient.post('/auth/register', { 
      email, 
      password, 
      ...metadata 
    });
    const user = data?.data?.user;
    const accessToken = data?.data?.accessToken;
    
    if (accessToken) storeTokens(accessToken);
    if (user) {
      set({ 
        user, 
        profile: { ...user, full_name: user.name || user.fullName }, 
        role: user.role 
      });
    }
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
    const updatedUser = data?.data;
    
    if (updatedUser) {
      set((state) => ({ 
        user: { ...state.user, ...updatedUser }, 
        profile: { ...state.profile, ...updatedUser } 
      }));
    }
  },
}));
