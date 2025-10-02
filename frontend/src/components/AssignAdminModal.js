import React, { useState } from 'react';
import Select from 'react-select';

function AssignAdminModal({ ticket, admins, tools, onAssign, onClose, showToast }) {
  const [selectedAdminId, setSelectedAdminId] = useState(null);
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
    setItemsToAssign(prevItems =>
      prevItems.map(item => {
        if (item.id === toolId) {
          if (newQuantity === '') {
            return { ...item, quantity: '' };
          }
          const quantity = parseInt(newQuantity, 10);
          if (isNaN(quantity)) {
            return item;
          }
          if (quantity > item.maxStock) {
            showToast(`Stok ${item.name} tidak mencukupi (maks: ${item.maxStock})`, 'error');
            return { ...item, quantity: item.maxStock };
          }
          return { ...item, quantity: quantity };
        }
        return item;
      })
    );
  };

  const handleQuantityBlur = (toolId, currentQuantity) => {
    const quantity = parseInt(currentQuantity, 10);
    setItemsToAssign(prevItems =>
      prevItems.map(item => {
        if (item.id === toolId) {
          if (isNaN(quantity) || quantity < 1) {
            return { ...item, quantity: 1 };
          }
        }
        return item;
      })
    );
  };

  const handleSubmit = () => {
    if (!selectedAdminId) {
      showToast('Pilih salah satu admin.', 'info');
      return;
    }
    const toolsPayload = itemsToAssign
      .filter(item => item.quantity > 0)
      .map(item => ({
        id: item.id,
        quantity: item.quantity
      }));
    onAssign(ticket.id, selectedAdminId, toolsPayload);
  };

  // [DILENGKAPI] Logika styling untuk React Select (termasuk Dark Mode)
  const isDarkMode = document.body.classList.contains('dark-mode');

  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: isDarkMode ? 'rgba(26, 32, 44, 0.7)' : '#fff',
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#ccc',
      borderRadius: "10px",
      minHeight: "45px",
      boxShadow: state.isFocused ? (isDarkMode ? '0 0 0 1px #3b82f6' : '0 0 0 1px #2563eb') : 'none',
      '&:hover': {
        borderColor: isDarkMode ? '#3b82f6' : '#2563eb',
      }
    }),
    input: (provided) => ({ ...provided, color: isDarkMode ? '#e2e8f0' : '#333' }),
    placeholder: (provided) => ({ ...provided, color: isDarkMode ? '#a0aec0' : '#aaa' }),
    singleValue: (provided) => ({ ...provided, color: isDarkMode ? '#e2e8f0' : '#333' }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode ? '#2d3748' : '#fff',
      border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #ccc',
      borderRadius: "10px",
    }),
    option: (provided, state) => ({
      ...provided,
      color: isDarkMode ? '#e2e8f0' : '#333',
      backgroundColor: state.isFocused ? (isDarkMode ? 'rgba(59, 130, 246, 0.5)' : '#e9f2ff') : 'transparent',
      '&:active': {
        backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
        color: '#fff'
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.7)' : 'rgba(37, 99, 235, 0.1)',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: isDarkMode ? '#fff' : '#1e40af',
      fontWeight: '500'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: isDarkMode ? '#e2e8f0' : '#1e40af',
      ':hover': {
        backgroundColor: isDarkMode ? '#ef4444' : '#fee2e2',
        color: isDarkMode ? '#fff' : '#991b1b',
      },
    }),
    indicatorSeparator: () => ({ display: 'none' }),
  };

  return (
    <div className="confirmation-modal-backdrop">
      <div className="confirmation-modal-content">
        <h3>Ticket "{ticket.title}"</h3>
        <div className="form-group-AssignAdmin">
          <label className="modal-label">Dikerjakan Oleh</label>
          <Select
            options={adminOptions}
            onChange={(option) => setSelectedAdminId(option.value)}
            placeholder="Pilih Admin..."
            styles={selectStyles}
            className="admin-select"
          />
        </div>

        <div className="form-group-AssignAdmin">
          <label className="modal-label">Barang yang Dibawa</label>
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
        </div>

        <div className="assigned-items-list">
          {itemsToAssign.map((item, index) => (
            <div key={`${item.id}-${index}`} className="assigned-item-row">
              <span className="item-name">{item.name}</span>
              <div className="item-quantity-group">
                <label htmlFor={`quantity-${item.id}`}>Jml:</label>
                <input
                  id={`quantity-${item.id}`}
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  onBlur={(e) => handleQuantityBlur(item.id, e.target.value)}
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