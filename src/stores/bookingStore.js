import { create } from 'zustand';
import { bookingsApi } from '../lib/api';

export const useBookingStore = create((set, get) => ({
  bookings: [],
  loading: false,
  error: null,

  createBooking: async (bookingData) => {
    set({ loading: true, error: null });
    try {
      const response = await bookingsApi.createBooking(bookingData);
      set({ loading: false });
      return response; // { success, booking, waLink }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Error creating booking';
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },

  fetchBookings: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await bookingsApi.getBookings(params);
      set({ bookings: response.bookings || [], loading: false });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  updateBookingStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const response = await bookingsApi.updateBookingStatus(id, status);
      set((state) => ({
        bookings: state.bookings.map((b) => (b._id === id ? response.booking : b)),
        loading: false,
      }));
      return response.booking;
    } catch (err) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },
}));
