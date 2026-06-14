import axios from 'axios';

// Get API URL from env, fallback to localhost in dev
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create a configured axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach JWT Token
apiClient.interceptors.request.use(
  (config) => {
    // Prevent axios from treating URLs starting with '/' as domain-relative
    // which discards the '/api' part of the baseURL.
    if (config.url) {
        if (config.url.startsWith('/')) {
            config.url = config.url.substring(1);
        }
        // If the URL already included 'api/', strip it to avoid duplication
        // since our baseURL already ends with /api
        if (config.url.startsWith('api/')) {
            config.url = config.url.substring(4);
        }
    }
    
    const token = localStorage.getItem('wkn_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Global Auth Errors (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If the token is invalid or expired
    if (error.response && error.response.status === 401) {
      console.error("Authentication expired or invalid.");
      // Clear token and force logout if needed
      // Note: Full logout logic is usually in AuthContext, 
      // but we clear the local storage here as a fallback
      localStorage.removeItem('wkn_auth_token');
      localStorage.removeItem('wkn_user');
      
      // We can also trigger a custom event that AuthContext listens to
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);
