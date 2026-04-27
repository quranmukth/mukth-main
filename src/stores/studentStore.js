// ── Student Store — unchanged API (now backed by REST) ────────────────────────
import { create } from 'zustand';
import { studentApi } from '../lib/api.js';

export const useStudentStore = create((set, get) => ({
  currentStreak: 0,
  longestStreak: 0,
  streakHistory: {},
  pagesMemorized: 0,
  accuracy: 0,
  recordings: [],
  unlockedBadges: [],
  dashboardData: null,
  loading: false,

  fetchDashboard: async (studentId) => {
    set({ loading: true });
    try {
      const [dashboard, recordings, badges] = await Promise.all([
        studentApi.getDashboard(studentId),
        studentApi.getRecordings(studentId),
        studentApi.getBadges(studentId),
      ]);
      set({
        dashboardData: dashboard,
        recordings,
        unlockedBadges: badges.map((b) => b.badge_id),
        currentStreak: dashboard.stats?.currentStreak ?? 0,
        pagesMemorized: dashboard.stats?.pagesMemorized ?? 0,
        accuracy: dashboard.stats?.accuracy ?? 0,
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchRecordings: async (studentId) => {
    const recordings = await studentApi.getRecordings(studentId);
    set({ recordings });
  },

  addRecording: async (recordingData) => {
    const newRec = await studentApi.submitRecording(recordingData);
    set((s) => ({ recordings: [newRec, ...s.recordings] }));
    return newRec;
  },

  updateProgress: (updates) => set(updates),
}));
