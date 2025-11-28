import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  return config;
}, (error) => {
    return Promise.reject(error);
});

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

            if (originalRequest.url.includes('/auth/refresh')) {
                 return Promise.reject(error);
            }

            if (error.response?.status === 401 && !originalRequest._retry) {
                if (isRefreshing) {
                    return new Promise(function(resolve, reject) {
                        failedQueue.push({resolve, reject});
                    }).then(() => {
                        return api(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }
                originalRequest._retry = true;
                isRefreshing = true;
                try {
                    console.log("Token kadaluarsa. Memulai proses refresh tunggal...");
                    await api.post('/auth/refresh'); 
                    console.log("Refresh sukses. Memproses antrean request yang tertunda...");
                    processQueue(null, "success"); 
                    return api(originalRequest);
                } catch (refreshError) {
                    console.error("Gagal refresh token. Logout semua sesi.", refreshError);
                    processQueue(refreshError, null);
                    authHooks.logout();
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }
            return Promise.reject(error);
        }
    );
};

export default api;