import React, { useState } from 'react';
import Select from 'react-select';

function AssignAdminModal({ ticket, admins, onAssign, onClose, showToast }) {
  const [selectedAdminId, setSelectedAdminId] = useState(null);

  const adminOptions = admins.map(admin => ({
    value: admin.id,
    label: admin.name
  }));

  const handleSubmit = () => {
    if (selectedAdminId) {
      onAssign(ticket.id, selectedAdminId);
    } else {
      showToast('Pilih salah satu admin.', 'info');
    }
  };

  // Deteksi status mode gelap saat ini
  const isDarkMode = document.body.classList.contains('dark-mode');

  // Tentukan variabel CSS berdasarkan mode saat ini
  const inputBg = isDarkMode ? "var(--input-bg-dark)" : "var(--input-bg-light)";
  const borderColor = isDarkMode ? "var(--border-color-dark)" : "var(--border-color-light)";
  const textColor = isDarkMode ? "var(--text-color-dark)" : "var(--text-color-light)";
  const placeholderColor = isDarkMode ? "var(--placeholder-color-dark)" : "var(--placeholder-color-light)";
  const formInputShadow = isDarkMode ? "var(--form-input-shadow-dark)" : "var(--form-input-shadow-light)";
  const menuBg = isDarkMode ? "var(--content-bg-dark)" : "var(--content-bg-light)";
  const menuBorder = isDarkMode ? "var(--border-color-dark)" : "var(--border-color-light)";
  const optionHoverBg = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 123, 255, 0.1)"; // Warna hover opsi
  const optionActiveBg = isDarkMode ? "#007bff" : "#007bff"; // Warna saat diklik

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: inputBg,
      borderRadius: "10px",
      borderColor: borderColor,
      minHeight: "45px",
      fontWeight: 500,
      boxShadow: formInputShadow,
      color: textColor,
    }),
    input: (provided) => ({
      ...provided,
      color: textColor,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: placeholderColor,
      fontWeight: 500,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: textColor,
      fontWeight: 500,
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: menuBg,
      borderColor: menuBorder,
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }),
    option: (provided, state) => ({
      ...provided,
      color: textColor,
      backgroundColor: state.isFocused ? optionHoverBg : "transparent",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: optionHoverBg,
        color: textColor,
      },
      "&:active": {
        backgroundColor: optionActiveBg,
        color: "white",
      },
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: borderColor,
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: placeholderColor,
      "&:hover": {
        color: textColor,
      },
    }),
  };

  return (
    <div className="confirmation-modal-backdrop">
      <div className="confirmation-modal-content">
        <h3>Ticket "{ticket.title}"</h3>
        <p>Dikerjakan Oleh :</p>
        <Select
          options={adminOptions}
          onChange={(option) => setSelectedAdminId(option.value)}
          placeholder="Pilih ..."
          styles={selectStyles} // Menerapkan gaya di sini
          className="admin-select"
        />
        <div className="confirmation-modal-actions">
          <button onClick={onClose} className="btn-cancel">Batal</button>
          <button onClick={handleSubmit} className="btn-confirm">Kerjakan</button>
        </div>
      </div>
    </div>
  );
}

export default AssignAdminModal;