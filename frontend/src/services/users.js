import api from './api';

export async function listAllUsers() {
  const res = await api.get('/users/all');
  return res.data;
}
