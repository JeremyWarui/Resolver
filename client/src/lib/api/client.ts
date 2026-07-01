import axios from 'axios';

// Allow _retry flag on axios request configs without casting everywhere
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// In production, VITE_API_URL_PROD overrides (set via hosting env vars).
// Fallback is relative /api/v1 so the vite preview proxy works for LAN/phone testing.
const BASE_URL =
  import.meta.env.MODE === 'production'
    ? (import.meta.env.VITE_API_URL_PROD ?? '/api/v1')
    : (import.meta.env.VITE_API_URL_DEV ?? 'http://localhost:8000/api/v1');

const TOKEN_KEY = 'authToken';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send/receive httpOnly refresh cookie
});

// ── Request interceptor — attach JWT Bearer token ─────────────────────────────

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — JWT refresh + 401 handling ────────────────────────
// On 401: attempt POST /auth/refresh/ (uses httpOnly resolver_refresh cookie).
// If the refresh succeeds, update the stored access token and replay the
// original request once. If it fails, clear the session and redirect.
// A failedQueue drains all requests that arrived while a refresh was in flight.

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
}

function clearSessionAndRedirect(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('currentUser');
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Queue concurrent 401s while a refresh is already in progress
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Use bare axios (not apiClient) to avoid triggering this interceptor again
      const { data } = await axios.post<{ accessToken: string }>(
        `${BASE_URL}/auth/refresh/`,
        {},
        { withCredentials: true }
      );
      const newToken = data.accessToken;
      localStorage.setItem(TOKEN_KEY, newToken);
      apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearSessionAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
