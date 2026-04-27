/**
 * @module apiClient
 * @description Axios-based API client with automatic token injection and transparent refresh.
 * Replaces the old Supabase client while maintaining data structure compatibility.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Axios instance ─────────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Sends the HttpOnly refresh-token cookie automatically
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach access token ───────────────────────────────────

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mukth_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// ── Response interceptor: transparent token refresh ───────────────────────────

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Expired access token)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post('/auth/refresh');
        const newToken = data.data.accessToken;
        
        localStorage.setItem('mukth_access_token', newToken);
        processQueue(null, newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('mukth_access_token');
        
        // Only redirect to login if we're not already on a public page
        if (!['/login', '/register', '/'].includes(window.location.pathname)) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Standardize error message for frontend consumption
    const message = error.response?.data?.message || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

// ── Convenience helpers ───────────────────────────────────────────────────────

/** Store tokens after successful auth */
export const storeTokens = (accessToken) => {
  localStorage.setItem('mukth_access_token', accessToken);
};

/** Clear tokens on logout */
export const clearTokens = () => {
  localStorage.removeItem('mukth_access_token');
};

export default apiClient;
