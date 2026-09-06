import axios from 'axios';

const baseURL = import.meta.env.PROD
  ? 'https://api.attlarp.gr'
  : 'http://localhost:3001';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const t = localStorage.getItem('token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  config.headers['Pragma'] = 'no-cache';
  config.headers['Expires'] = '0';

  // Add Idempotency-Key for state-modifying requests
  if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
    if (window.crypto && window.crypto.randomUUID) {
      config.headers['Idempotency-Key'] = window.crypto.randomUUID();
    } else {
      config.headers['Idempotency-Key'] = 'idemp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
  }

  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 429) {
      console.warn('Rate limit exceeded', error.response.headers['retry-after']);
    }
    return Promise.reject(error);
  }
);

export default api;
