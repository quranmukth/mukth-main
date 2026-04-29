/**
 * @module api
 * @description Drop-in replacement for supabaseApi.js using the new REST backend.
 * Data shapes are intentionally kept identical so Zustand stores require zero changes.
 */
import apiClient from './apiClient.js';
import { DAILY_VERSES } from '../data/quranData.js';

// ─── Student API ──────────────────────────────────────────────────────────────

export const studentApi = {
  getDashboard: async (studentId) => {
    const { data } = await apiClient.get(`/stats/student/${studentId}`);
    return data.data; // { student, dailyVerse, stats, nextSession, enrollments }
  },

  getRecordings: async (studentId) => {
    const { data } = await apiClient.get('/recordings', { params: { studentId } });
    return data.data;
  },

  getBadges: async (studentId) => {
    const { data } = await apiClient.get(`/users/${studentId}`);
    // Return badges in the shape the store expects: [{ badge_id }]
    return (data.data.badges || []).map((b) => ({ badge_id: b.badgeId }));
  },

  submitRecording: async (recordingData) => {
    const { data } = await apiClient.post('/recordings', recordingData);
    return data.data;
  },

  getUploadUrl: async (contentType = 'audio/webm') => {
    const { data } = await apiClient.get('/recordings/upload-url', { params: { contentType } });
    return data.data; // { uploadUrl, s3Key }
  },

  getPlaybackUrl: async (recordingId) => {
    const { data } = await apiClient.get(`/recordings/${recordingId}/url`);
    return data.data.url;
  },

  getProgress: async (studentId) => {
    const { data } = await apiClient.get(`/stats/student/${studentId}`);
    const stats = data.data.stats;
    const totalJuz = data.data.student?.totalJuzMemorized || 0;
    const juzProgress = Array.from({ length: 30 }, (_, i) => {
      const juzNum = 30 - i;
      let status = 'locked', pct = 0;
      if (juzNum <= totalJuz) { status = 'completed'; pct = 100; }
      else if (juzNum === totalJuz + 1) { status = 'inProgress'; pct = 25; }
      return { juz: juzNum, pct, status };
    });
    return { totalPages: stats.pagesMemorized, juzProgress };
  },
};

// ─── Teacher API ──────────────────────────────────────────────────────────────

export const teacherApi = {
  getDashboard: async (teacherId) => {
    const { data } = await apiClient.get(`/stats/teacher/${teacherId}`);
    return {
      stats: data.data.stats,
      pendingRecordings: data.data.pendingRecordings,
      todaySessions: data.data.halaqat,
    };
  },

  getStudents: async (teacherId) => {
    const { data } = await apiClient.get('/users', { params: { role: 'student' } });
    return data.data;
  },

  getSchedule: async (teacherId) => {
    const { data } = await apiClient.get('/halaqat');
    return data.data;
  },

  submitReview: async (recordingId, feedback) => {
    const { data } = await apiClient.post('/feedback', { recordingId, ...feedback });
    return data.data;
  },
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = {
  getUsers: async (filters = {}) => {
    const { data } = await apiClient.get('/users', { params: filters });
    return data.data;
  },

  createUser: async (user) => {
    const { data } = await apiClient.post('/auth/register', {
      name: user.name,
      email: user.email,
      password: user.password || 'TempPass@123',
      phone: user.phone,
      role: user.role,
    });
    return data.data;
  },

  getDashboard: async () => {
    const { data } = await apiClient.get('/stats/admin');
    return data.data;
  },

  updateUserRole: async (userId, role) => {
    const { data } = await apiClient.patch(`/users/${userId}`, { role });
    return data.data;
  },

  deleteUser: async (userId) => {
    const { data } = await apiClient.delete(`/users/${userId}`);
    return data.data;
  },

  getHalaqat: async () => {
    const { data } = await apiClient.get('/halaqat');
    return data.data;
  },

  createHalqa: async (halqa) => {
    const { data } = await apiClient.post('/halaqat', halqa);
    return data.data;
  },

  deleteHalqa: async (id) => {
    const { data } = await apiClient.delete(`/halaqat/${id}`);
    return data.data;
  },
};

// ─── Leads API ──────────────────────────────────────────────────────────────

export const leadsApi = {
  createLead: async (leadData) => {
    const { data } = await apiClient.post('/leads', leadData);
    return data.data;
  },

  getLeads: async () => {
    const { data } = await apiClient.get('/leads');
    return data.data;
  },

  updateLeadStatus: async (id, status) => {
    const { data } = await apiClient.patch(`/leads/${id}`, { status });
    return data.data;
  },
};
