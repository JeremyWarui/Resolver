import axios from 'axios';
import { API_CONFIG } from './config';
import {
  requestInterceptor,
  requestErrorInterceptor,
  responseInterceptor,
  responseErrorInterceptor,
} from './interceptors';

// Create axios instance with default configuration
const apiClient = axios.create(API_CONFIG);

// Add interceptors
apiClient.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
apiClient.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

export default apiClient;
