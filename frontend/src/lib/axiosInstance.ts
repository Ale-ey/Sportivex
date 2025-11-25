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
    if (error.response && error.response.status === 403) {
      localStorage.clear();
      window.location.href="/auth/signin"
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;