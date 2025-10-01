import React, { useState } from 'react';
import Select from 'react-select';

function AssignAdminModal({ ticket, admins, tools, onAssign, onClose, showToast }) {
  const [selectedAdminId, setSelectedAdminId] = useState(null);

  // PERBAIKAN: Hapus state 'selectedTools' dan 'setSelectedTools' yang tidak digunakan
  // const [selectedTools, setSelectedTools] = useState([]); 

  const [itemsToAssign, setItemsToAssign] = useState([]);

  const adminOptions = admins.map(admin => ({
    value: admin.id,
    label: admin.name
  }));

  const toolOptions = tools.map(tool => ({
    value: tool.id,
    label: `${tool.name} (Stok: ${tool.stock})`,
    stock: tool.stock,
    name: tool.name
  }));

  const handleToolSelectionChange = (selectedOptions) => {
    const newItems = selectedOptions.map(option => {
      const existingItem = itemsToAssign.find(item => item.id === option.value);
      return {
        id: option.value,
        name: option.name,
        maxStock: option.stock,
        quantity: existingItem ? existingItem.quantity : 1,
      };
    });
    setItemsToAssign(newItems);
  };

  const handleQuantityChange = (toolId, newQuantity) => {
    const quantity = parseInt(newQuantity, 10);
    setItemsToAssign(prevItems =>
      prevItems.map(item => {
        if (item.id === toolId) {
          const newQty = isNaN(quantity) ? 1 : quantity;
          if (newQty > item.maxStock) {
            showToast(`Stok ${item.name} tidak mencukupi (maks: ${item.maxStock})`, 'error');
            return { ...item, quantity: item.maxStock };
          }
          if (newQty < 1) {
            return { ...item, quantity: 1 };
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleSubmit = () => {
    if (selectedAdminId) {
      const toolsPayload = itemsToAssign.map(item => ({
        id: item.id,
        quantity: item.quantity
      }));
      onAssign(ticket.id, selectedAdminId, toolsPayload);
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
          placeholder="Pilih Admin..."
          styles={selectStyles}
          className="admin-select"
        />

        <p style={{ marginTop: '15px' }}>Barang yang Dibawa :</p>
        <Select
          isMulti
          options={toolOptions}
          value={toolOptions.filter(option => itemsToAssign.some(item => item.id === option.value))}
          onChange={handleToolSelectionChange}
          placeholder="Pilih Alat/Barang..."
          styles={selectStyles}
          className="admin-select"
          closeMenuOnSelect={false}
        />
        <div className="assigned-items-list" style={{ marginTop: '15px' }}>
          {itemsToAssign.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', justifyContent: 'space-between' }}>
              <span style={{ flexGrow: 1 }}>{item.name}</span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label htmlFor={`quantity-${item.id}`} style={{ marginRight: '10px', fontSize: '0.9em' }}>Jml:</label>
                <input
                  id={`quantity-${item.id}`}
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  style={{ width: '60px', padding: '5px', textAlign: 'center', borderRadius: '5px', border: '1px solid #ccc' }}
                  min="1"
                  max={item.maxStock}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="confirmation-modal-actions">
          <button onClick={onClose} className="btn-cancel">Batal</button>
          <button onClick={handleSubmit} className="btn-confirm">Kerjakan</button>
        </div>
      </div>
    </div>
  );
}

export default AssignAdminModal;
