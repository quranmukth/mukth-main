/**
 * @store sessionStore
 * @description Store for managing live sessions. Replaces direct Supabase calls with REST API.
 */
import { create } from 'zustand';
import apiClient  from '../lib/apiClient.js';

export const useSessionStore = create((set, get) => ({
  activeSessions: [],
  loading: false,

  /**
   * Fetch active sessions for the current user.
   * Node backend filters based on role/enrollments.
   */
  fetchActiveSessions: async () => {
    set({ loading: true });
    try {
      const { data } = await apiClient.get('/sessions/active');
      set({ activeSessions: data.data });
    } catch (err) {
      console.error('Failed to fetch sessions:', err.message);
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Start a new live session (Teachers/Admins).
   */
  startSession: async (halqaId) => {
    set({ loading: true });
    try {
      const { data } = await apiClient.post('/sessions/start', { halqaId });
      const newSession = data.data;
      set((s) => ({ activeSessions: [newSession, ...s.activeSessions] }));
      return newSession;
    } finally {
      set({ loading: false });
    }
  },

  /**
   * End an active session.
   */
  endSession: async (sessionId) => {
    try {
      await apiClient.patch(`/sessions/${sessionId}/end`);
      set((s) => ({
        activeSessions: s.activeSessions.filter((as) => as._id !== sessionId),
      }));
    } catch (err) {
      console.error('Failed to end session:', err.message);
    }
  },
}));
