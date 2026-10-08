import axios from 'axios';

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
  (response) => {
    // If the server returned HTML (e.g. SPA index.html fallback), treat as an API error
    if (typeof response.data === 'string' && (response.data.includes('<!doctype') || response.data.includes('<html'))) {
      return Promise.reject(new Error('Backend API is currently offline or returning HTML fallback.'));
    }
    return response;
  },
  (error) => {
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
