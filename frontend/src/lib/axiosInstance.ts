import axios, { type AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 30000,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If FormData, don't set Content-Type - let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
axiosInstance.interceptors.response.use(
  (response) => response, // Just return the response if successful
  async (error) => {
    // Handle token expiration (401) or forbidden (403)
    if (error.response) {
      const status = error.response.status;
      const errorCode = error.response.data?.code;
      const errorMessage = error.response.data?.message;
      const token = localStorage.getItem('authToken');

      // Only handle auth errors if we actually have a token
      // This prevents logging out on initial page load or when token hasn't been set yet
      if (!token) {
        return Promise.reject(error);
      }

      // Handle token expiration
      if (status === 401 && (errorCode === 'TOKEN_EXPIRED' || errorMessage?.includes('expired') || errorMessage?.includes('Token has expired'))) {
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();
        // Redirect to sign-in page
        window.location.href = '/auth/signin';
        return Promise.reject(error);
      }

      // Handle invalid token format
      if (status === 401 && (errorCode === 'INVALID_TOKEN' || errorMessage?.includes('Invalid token'))) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/auth/signin';
        return Promise.reject(error);
      }

      // Handle "Access token required" - means token is missing from request
      if (status === 401 && errorMessage?.includes('Access token required')) {
        // Don't log out, just reject - might be a temporary issue
        return Promise.reject(error);
      }

      // Handle gym registration required (402) - don't log out, just reject
      if (status === 402 && (errorCode === 'GYM_REGISTRATION_REQUIRED' || errorMessage?.includes('Gym registration'))) {
        // Don't log out for gym registration errors - these are handled in the UI
        return Promise.reject(error);
      }

      // Handle forbidden access (403) - but only if it's an auth-related 403
      if (status === 403 && (errorMessage?.includes('Authentication') || errorMessage?.includes('permission'))) {
        // Check if token exists - if not, don't log out (might be a role issue)
        if (token) {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/auth/signin';
        }
        return Promise.reject(error);
      }

      // For other 401 errors, only log out if it's clearly an auth issue
      // Don't log out on generic 401s that might be temporary network issues
      if (status === 401 && (errorMessage?.includes('Authentication failed') || errorMessage?.includes('user not found'))) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/auth/signin';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;