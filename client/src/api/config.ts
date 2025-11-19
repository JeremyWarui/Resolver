// API Configuration
// Vite automatically sets import.meta.env.MODE:
// - 'development' when running 'npm run dev'
// - 'production' when running 'npm run build' or in Render
const MODE = import.meta.env.MODE;
const API_URL_DEV = import.meta.env.VITE_API_URL_DEV || 'http://localhost:8000/api';
const API_URL_PROD = import.meta.env.VITE_API_URL_PROD || 'https://django-resolver.onrender.com/api';

// Select API URL based on Vite mode
const getApiUrl = () => {
  const isDevelopment = MODE === 'development';
  
  // Log environment for debugging
  if (isDevelopment) {
    console.log('🔧 Vite Environment: DEVELOPMENT');
    console.log('📡 API URL:', API_URL_DEV);
  } else {
    console.log('🚀 Vite Environment: PRODUCTION');
    console.log('📡 API URL:', API_URL_PROD);
  }
  
  return isDevelopment ? API_URL_DEV : API_URL_PROD;
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
  environment: MODE,
  apiUrl: getApiUrl(),
};
