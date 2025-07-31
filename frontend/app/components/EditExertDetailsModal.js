'use client'


import { useState } from 'react';
import './styles/EditExperienceModal.css';
import axios from 'axios';

export default function EditExpertDetailsModal({ expert, onClose, onSave }) {
  const [formData, setFormData] = useState({
    email: expert.email || '',
    phone: expert.phone || '',
    quote: expert.quote || '',
    ra_comments: expert.ra_comments || '',
    notes: expert.notes || '',
    screening: expert.screening || '',
    bank_details: expert.bank_details || '',
    source_of_response: expert.source_of_response || '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:1337/api/experts/${expert.documentId}`,
        {
          data: formData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onSave(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update expert details.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
       <div className="py-3 px-4 border-b text-lg font-semibold bg-white sticky top-0 z-10">
          Edit Expert Details
        </div>
        <div className="flex-1 overflow-y-auto space-y-4">

          <div>
            <label>Email</label>
            <input
              className="input-field"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div>
            <label>Phone</label>
            <input
              className="input-field"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>

          <div>
            <label>Quote</label>
            <input
              className="input-field"
              value={formData.quote}
              onChange={(e) => handleChange('quote', e.target.value)}
            />
          </div>

          <div>
            <label>Source of Response</label>
            <select
              className="input-field"
              value={formData.source_of_response}
              onChange={(e) => handleChange('source_of_response', e.target.value)}
            >
              <option value="">Select Source</option>
              <option value="Cold Calling">Cold Calling</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Email">Email</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div>
            <label>RA Comments</label>
            <textarea
              className="input-field"
              rows={3}
              value={formData.ra_comments}
              onChange={(e) => handleChange('ra_comments', e.target.value)}
            ></textarea>
          </div>

          <div>
            <label>Notes</label>
            <textarea
              className="input-field"
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            ></textarea>
          </div>

          <div>
            <label>Screening</label>
            <textarea
              className="input-field"
              rows={3}
              value={formData.screening}
              onChange={(e) => handleChange('screening', e.target.value)}
            ></textarea>
          </div>

          <div>
            <label>Bank Details</label>
            <textarea
              className="input-field"
              rows={3}
              value={formData.bank_details}
              onChange={(e) => handleChange('bank_details', e.target.value)}
            ></textarea>
          </div>

        </div>

       <div className="modal-actions py-3 px-4 border-t bg-white sticky bottom-0 z-10 flex justify-end gap-3">
          <button className="save-btn" onClick={handleSubmit}>Save</button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
