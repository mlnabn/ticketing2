import React, { useState } from 'react';
import Select from 'react-select';

function AssignAdminModal({ ticket, admins, onAssign, onClose }) {
  const [selectedAdminId, setSelectedAdminId] = useState(null);

  const adminOptions = admins.map(admin => ({
    value: admin.id,
    label: admin.name
  }));

  const handleSubmit = () => {
    if (selectedAdminId) {
      onAssign(ticket.id, selectedAdminId);
    } else {
      alert('Pilih salah satu admin.');
    }
  };

  

  return (
    <div className="confirmation-modal-backdrop">
      <div className="confirmation-modal-content">
        <h3>Tugaskan Pekerjaan "{ticket.title}"</h3>
        <p>Pilih admin yang akan mengerjakan tiket ini:</p>
        <Select
          options={adminOptions}
          onChange={(option) => setSelectedAdminId(option.value)}
          placeholder="Pilih Admin..."
          className="admin-select"
        />
        <div className="confirmation-modal-actions">
          <button onClick={onClose} className="btn-cancel">Batal</button>
          <button onClick={handleSubmit} className="btn-confirm">Tugaskan</button>
        </div>
      </div>
    </div>
  );
}

export default AssignAdminModal;
