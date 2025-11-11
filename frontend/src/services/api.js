import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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

// DIUBAH: Request interceptor sekarang menjadi proaktif
api.interceptors.request.use(async (config) => {
  if (config.url === '/auth/refresh') {
    return config;
  }

  const token = localStorage.getItem('auth.accessToken');
  const expiresAt = localStorage.getItem('auth.expiresAt');

  if (!token || !expiresAt) {
    return config; // Jika tidak ada token, lanjutkan saja
  }

  // Cek apakah token akan/sudah kedaluwarsa
  if (Date.now() > parseInt(expiresAt)) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        console.log("Token kedaluwarsa, memulai refresh proaktif...");
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const newAccessToken = data.access_token;
        const newExpiresAt = Date.now() + (data.expires_in * 1000) - 60000;
        
        localStorage.setItem('auth.accessToken', newAccessToken);
        localStorage.setItem('auth.expiresAt', newExpiresAt.toString());
        
        // Perbarui header untuk request yang sedang berjalan
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        
        processQueue(null, newAccessToken);
        return config;
      } catch (error) {
        processQueue(error, null);
        // Jika refresh gagal, biarkan response interceptor yang menangani logout
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // Jika proses refresh sedang berjalan, request ini akan menunggu
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then(newToken => {
      config.headers.Authorization = `Bearer ${newToken}`;
      return config;
    });
  }

  // Jika token valid, pasang header dan lanjutkan
  config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => {
  return Promise.reject(error);
});


// DIUBAH: Response interceptor sekarang hanya sebagai fallback
let interceptor;

export const injectAuthHooks = (authHooks) => {
    if (interceptor) {
        api.interceptors.response.eject(interceptor);
    }

    interceptor = api.interceptors.response.use(
        (response) => response,
        async (error) => {
            // Interceptor ini sekarang hanya bertindak sebagai jaring pengaman terakhir.
            // Jika request gagal dengan 401 (misalnya karena token refresh juga tidak valid),
            // maka kita akan langsung logout pengguna.
            if (error.response?.status === 401) {
                console.error("Proses refresh gagal atau token tidak valid. Melakukan logout...");
                authHooks.logout();
            }

            return Promise.reject(error);
        }
    );
};

export default api;