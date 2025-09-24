import api from './api';

export async function listTickets({ page = 1, search = '' } = {}) {
  const params = { page };
  if (search) params.search = search;
  const res = await api.get('/tickets', { params });
  return res.data;
}

export async function createTicket(formData) {
  const res = await api.post('/tickets', formData);
  return res.data;
}
