import axios from 'axios';

// Base API instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiMessage = error.response?.data?.message || error.response?.data?.error;
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      return Promise.reject(new Error(apiMessage || 'Bạn không có quyền thực hiện thao tác này (403 Forbidden).'));
    }
    if (apiMessage) {
      return Promise.reject(new Error(apiMessage));
    }
    return Promise.reject(error);
  }
);

export default api;
