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

      // Handle token expiration
      if (status === 401 && (errorCode === 'TOKEN_EXPIRED' || errorMessage?.includes('expired') || errorMessage?.includes('Token has expired'))) {
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();
        // Redirect to sign-in page
        window.location.href = '/auth/signin';
        return Promise.reject(error);
      }

      // Handle forbidden access (403)
      if (status === 403) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/auth/signin';
        return Promise.reject(error);
      }

      // Handle any other 401 (invalid token, etc.)
      if (status === 401) {
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