import axios from 'axios';
import { handleMockFallback } from './mockHandler';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token from localStorage if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aura_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor
apiClient.interceptors.response.use(
  async (response) => {
    // If the server returned HTML (e.g. SPA index.html fallback), attempt demo mock fallback
    if (typeof response.data === 'string' && (response.data.includes('<!doctype') || response.data.includes('<html'))) {
      const fallback = await handleMockFallback(response.config);
      if (fallback) {
        return fallback;
      }
      return Promise.reject(new Error('Backend API is currently offline.'));
    }
    return response;
  },
  async (error) => {
    // If the request resulted in 404, network error, or server offline, gracefully activate demo fallback
    if (
      !error.response ||
      error.response.status === 404 ||
      error.response.status === 502 ||
      error.response.status === 503 ||
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('HTML')
    ) {
      if (error.config) {
        try {
          const fallback = await handleMockFallback(error.config);
          if (fallback) {
            return fallback;
          }
        } catch (fbErr) {
          console.error('Fallback error:', fbErr);
        }
      }
    }

    const data = error.response?.data;
    let message = data?.message || error.message || 'An unexpected error occurred';
    if (data?.errors) {
      if (typeof data.errors === 'object') {
        const firstError = Object.values(data.errors)[0];
        if (firstError) {
          message = String(firstError);
        }
      } else if (typeof data.errors === 'string') {
        message = data.errors;
      }
    }
    return Promise.reject(new Error(message));
  }
);
