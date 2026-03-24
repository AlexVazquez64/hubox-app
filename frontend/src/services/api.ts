import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/google') || url.includes('/auth/me');
    const isLoginPage = window.location.pathname === '/login';
    if (error.response?.status === 401 && !isAuthEndpoint && !isLoginPage) {
      localStorage.removeItem('access_token');
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);