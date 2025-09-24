import axios from 'axios';
import { getToken } from '../auth';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = typeof getToken === 'function' ? getToken() : null;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// Bisa tambah fungsi bantu lain jika diperlukan, misal untuk POST/PUT dengan auth otomatis
export default api;
