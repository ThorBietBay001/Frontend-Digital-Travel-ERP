import axios from 'axios';

export const AUTH_SESSION_CLEARED_EVENT = 'auth-session-cleared';

const migrateSessionCache = () => {
  const sessionToken = sessionStorage.getItem('token');
  if (!localStorage.getItem('token') && sessionToken) {
    localStorage.setItem('token', sessionToken);
    const sessionProfile = sessionStorage.getItem('userProfile');
    if (sessionProfile) {
      localStorage.setItem('userProfile', sessionProfile);
    }
  }

  sessionStorage.removeItem('token');
  sessionStorage.removeItem('userProfile');
};

migrateSessionCache();

const clearAuthSession = () => {
  const hadToken = !!localStorage.getItem('token');
  localStorage.removeItem('token');
  localStorage.removeItem('userProfile');

  if (hadToken) {
    window.dispatchEvent(new Event(AUTH_SESSION_CLEARED_EVENT));
  }
};

export const hasActiveSession = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const encodedPayload = token.split('.')[1];
    if (!encodedPayload) throw new Error('Invalid token');

    const normalizedPayload = encodedPayload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=');
    const payload = JSON.parse(atob(normalizedPayload)) as { exp?: number; maVaiTro?: string };

    if (payload.maVaiTro !== 'KHACHHANG' || (payload.exp && payload.exp * 1000 <= Date.now())) {
      clearAuthSession();
      return false;
    }
    return true;
  } catch {
    clearAuthSession();
    return false;
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = hasActiveSession() ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) {
      clearAuthSession();
    }
    return Promise.reject(error);
  }
);

export default api;
