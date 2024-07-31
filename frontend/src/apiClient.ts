import axios from 'axios';

const baseURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000/api'
    : process.env.REACT_APP_API_URL || 'https://backend-ts-mern-thaitogo-8cadca05287e.herokuapp.com/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-type': 'application/json',
  },
});

// Optionally, add authorization headers if needed
apiClient.interceptors.request.use(
  async (config) => {
    if (localStorage.getItem('userInfo')) {
      config.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('userInfo')!).token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
