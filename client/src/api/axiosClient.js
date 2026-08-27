import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization header if token exists
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('teacherToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid on a protected route, remove it
      if (localStorage.getItem('teacherToken')) {
        localStorage.removeItem('teacherToken');
        localStorage.removeItem('teacherData');
        if (window.location.pathname.startsWith('/teacher') && window.location.pathname !== '/teacher/login') {
          window.location.href = '/teacher/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
