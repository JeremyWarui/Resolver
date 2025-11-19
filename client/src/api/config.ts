// API Configuration
const ENV = import.meta.env.VITE_ENV || 'development';
const API_URL_DEV = import.meta.env.VITE_API_URL_DEV || 'http://localhost:8000/api';
const API_URL_PROD = import.meta.env.VITE_API_URL_PROD || 'https://django-resolver.onrender.com/api';

// Select API URL based on environment
const getApiUrl = () => {
  if (ENV === 'production') {
    return API_URL_PROD;
  }
  return API_URL_DEV;
};

export const API_CONFIG = {
  baseURL: getApiUrl(),
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// Auth configuration
export const AUTH_CONFIG = {
  tokenKey: 'authToken',
  refreshTokenKey: 'refreshToken',
};

// Export for debugging
export const ENV_INFO = {
  environment: ENV,
  apiUrl: getApiUrl(),
};

// Log environment info in development
if (ENV === 'development') {
  console.log('🔧 Environment:', ENV);
  console.log('🌐 API URL:', getApiUrl());
}
