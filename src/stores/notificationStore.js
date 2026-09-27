// ── Notification Store — Toast queue ─────────────────────────────────────────
import { create } from 'zustand';

let toastId = 0;

export const useNotificationStore = create((set, get) => ({
  toasts: [],

  addToast: ({ title, message, type = 'info', duration = 4000, action = null }) => {
    const id = ++toastId;
    set((s) => ({
      toasts: [...s.toasts, { id, title, message, type, action, createdAt: Date.now() }],
    }));
    if (duration > 0) {
      setTimeout(() => get().removeToast(id), duration);
    }
    return id;
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  clearAll: () => set({ toasts: [] }),

  // Convenience methods
  success: (title, message) => get().addToast({ title, message, type: 'success' }),
  error: (title, message) => get().addToast({ title, message, type: 'error', duration: 6000 }),
  info: (title, message) => get().addToast({ title, message, type: 'info' }),
  warning: (title, message) => get().addToast({ title, message, type: 'warning' }),
}));
