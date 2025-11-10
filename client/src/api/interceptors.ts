import type { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { AUTH_CONFIG } from './config';

// Request interceptor - add auth token
export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(AUTH_CONFIG.tokenKey);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Request error interceptor
export const requestErrorInterceptor = (error: AxiosError) => {
  return Promise.reject(error);
};

// Response interceptor - return response data
export const responseInterceptor = (response: AxiosResponse) => {
  return response;
};

// Response error interceptor - handle common errors
export const responseErrorInterceptor = (error: AxiosError) => {
  if (error.response) {
    // Server responded with error status
    switch (error.response.status) {
      case 401:
        // Unauthorized - redirect to login or refresh token
        console.error('Unauthorized access');
        // Clear auth tokens
        localStorage.removeItem(AUTH_CONFIG.tokenKey);
        localStorage.removeItem(AUTH_CONFIG.refreshTokenKey);
        // You can dispatch a logout action or redirect here
        // window.location.href = '/login';
        break;
      case 403:
        console.error('Forbidden access');
        break;
      case 404:
        console.error('Resource not found');
        break;
      case 500:
        console.error('Internal server error');
        break;
      default:
        console.error('An error occurred:', error.response.data);
    }
  } else if (error.request) {
    // Request made but no response received
    console.error('No response from server');
  } else {
    // Error in request configuration
    console.error('Error:', error.message);
  }
  return Promise.reject(error);
};
