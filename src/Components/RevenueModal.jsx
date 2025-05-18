// src/components/AddRevenueModal.js

import React from 'react';

const AddRevenueModal = ({ show, onClose, onAddDetails, year, setYear, revenueType, setRevenueType }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Revenue Form</h2>
        <div>
          <label>Year</label>
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Enter Year"
          />
        </div>
        <div>
          <label>Type</label>
          <select value={revenueType} onChange={(e) => setRevenueType(e.target.value)}>
            <option value="">Select Revenue Type</option>
            <option value="Revenue">Revenue</option>
            <option value="Charter Services">Charter Services</option>
            <option value="Emergency Services">Emergency Services</option>
          </select>
        </div>
        <button onClick={onAddDetails}>Add Revenue</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AddRevenueModal;
