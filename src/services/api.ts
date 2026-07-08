import axios from 'axios';

export const HDV_UNAUTHORIZED_EVENT = 'hdv:unauthorized';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url || '');
    const isAuthEndpoint = requestUrl.includes('/auth/');

    if (status === 401 && !isAuthEndpoint && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent(HDV_UNAUTHORIZED_EVENT));
    }

    return Promise.reject(error);
  }
);

export default api;
