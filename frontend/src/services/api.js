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

let interceptor;

export const injectAuthHooks = (authHooks) => {
    if (interceptor) {
        api.interceptors.response.eject(interceptor);
    }

    interceptor = api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (error.response.status !== 401 || originalRequest._retry) {
                return Promise.reject(error);
            }

            originalRequest._retry = true; 

            try {
                const { data } = await api.post('/auth/refresh');
                
                authHooks.setAccessToken(data.access_token);
                
                originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                
                return api(originalRequest);
            } catch (_error) {
                authHooks.logout();
                return Promise.reject(_error);
            }
        }
    );
};

export default api;