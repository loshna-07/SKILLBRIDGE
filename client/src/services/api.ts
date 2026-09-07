import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to all outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillbridge_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      localStorage.removeItem('skillbridge_token');
      localStorage.removeItem('skillbridge_user');
    }
    return Promise.reject(error);
  }
);

export default api;
