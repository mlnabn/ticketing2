import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function TicketReportAdminList({ onSelectAdmin }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admins');
      setAdmins(res.data);
    } catch (err) {
      console.error('Gagal mengambil daftar admin:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-container">
      <h2>Pilih Admin</h2>
      {loading ? <p>Memuat data...</p> : (
        <div className="admin-list-grid">
          {admins.map(admin => (
            <div key={admin.id} className="admin-card" onClick={() => onSelectAdmin(admin)}>
              <div className="avatar">{admin.name.charAt(0)}</div>
              <div className="info">
                <h3>{admin.name}</h3>
                <p>{admin.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
