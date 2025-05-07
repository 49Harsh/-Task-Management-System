import axios from 'axios';

// Base URL for the API
// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = 'https://task-management-system-hsgu.onrender.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth state
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api; 