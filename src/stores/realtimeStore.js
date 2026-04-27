/**
 * @store realtimeStore
 * @description Socket.io client replacing Supabase Realtime subscriptions.
 * Same external interface — stores emit the same events, components don't change.
 */
import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useNotificationStore } from './notificationStore.js';
import { useStudentStore } from './studentStore.js';
import { useTeacherStore } from './teacherStore.js';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const useRealtimeStore = create((set, get) => ({
  socket: null,

  init: (userId, role) => {
    const token = localStorage.getItem('mukth_access_token');
    const notify = useNotificationStore.getState();
    const studentStore = useStudentStore.getState();
    const teacherStore = useTeacherStore.getState();

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.debug('[Socket] Connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    // ── Student events ───────────────────────────────────────────────────────
    if (role === 'student') {
      socket.on('feedback:new', ({ teacherName }) => {
        notify.success('ملاحظات جديدة 📝', `قام ${teacherName} بمراجعة تسجيلك`);
        studentStore.fetchDashboard(userId);
        studentStore.fetchRecordings(userId);
      });

      socket.on('badge:unlocked', ({ badgeId }) => {
        notify.success('🏆 شارة جديدة!', `حصلت على شارة جديدة!`);
        studentStore.fetchDashboard(userId);
      });

      socket.on('session:started', () => {
        notify.info('حلقة مباشرة! 🎙️', 'بدأت الحلقة الآن. انضم للمشاركة.');
      });
    }

    // ── Teacher events ───────────────────────────────────────────────────────
    if (role === 'teacher') {
      socket.on('queue:new_recording', () => {
        notify.info('تسجيل جديد 🎤', 'تم استلام تسجيل جديد للمراجعة');
        teacherStore.fetchDashboard(userId);
      });

      socket.on('queue:reviewed', ({ recordingId }) => {
        // Another teacher reviewed it — remove from local queue
        teacherStore.submitReview(recordingId, null);
      });
    }

    // ── Shared events ────────────────────────────────────────────────────────
    socket.on('notification:new', ({ title, message, type }) => {
      notify.info(title, message);
    });

    set({ socket });
  },

  cleanup: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
