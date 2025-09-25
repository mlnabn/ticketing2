import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('auth.accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
});


// --- PERBAIKAN LOGIKA REFRESH TOKEN ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

let interceptor;

export const injectAuthHooks = (authHooks) => {
    if (interceptor) {
        api.interceptors.response.eject(interceptor);
    }

    interceptor = api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (error.response.status === 401) {
              if (originalRequest.url === '/auth/refresh') {
                  authHooks.logout();
                  return Promise.reject(error);
              }

              if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                  failedQueue.push({resolve, reject})
                }).then(token => {
                  originalRequest.headers['Authorization'] = 'Bearer ' + token;
                  return api(originalRequest);
                });
              }

              originalRequest._retry = true;
              isRefreshing = true;

              return new Promise(function (resolve, reject) {
                api.post('/auth/refresh').then(({data}) => {
                  authHooks.setAccessToken(data.access_token);
                  originalRequest.headers['Authorization'] = 'Bearer ' + data.access_token;
                  processQueue(null, data.access_token);
                  resolve(api(originalRequest));
                }).catch((err) => {
                  processQueue(err, null);
                  authHooks.logout();
                  reject(err);
                }).finally(() => { 
                  isRefreshing = false 
                });
              });
            }

            return Promise.reject(error);
        }
    );
};

export default api;