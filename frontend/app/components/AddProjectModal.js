'use client'

import { useState } from 'react';
import './styles/EditExperienceModal.css';
import axios from 'axios'

export default function AddProjectModal({ expertId, onClose, onProjectAdd }) {
  const [formData, setFormData] = useState({
    code: '',
    investor: '',
    ca: '',
    call_rating: '',
    expert_rating:'',
    fc_call_rating:'',
    fc_expert_rating:'',
    date:'',
    final_amount: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log(formData,expertId);

       const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects`, {
        data:{
            ...formData,
            expert:expertId
        },
    },
    {
        headers: {
          Authorization: `Bearer ${token}`,
        }

    });
      console.log(res);
      onProjectAdd(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to add project.');
    }
  };

  return (
    <div className="modal-overlay">
  <div className="modal-content overflow-y-auto max-h-[90vh]">
    {/* Sticky Header */}
    <div className="py-3 px-4 border-b text-lg font-semibold bg-white sticky top-0">
      Add New Project
    </div>

    <label>Code</label>
    <input
      className="input-field"
      value={formData.code}
      onChange={(e) => handleChange('code', e.target.value)}
      placeholder="Enter project code"
    />

    <label>Investor</label>
    <input
      className="input-field"
      value={formData.investor}
      onChange={(e) => handleChange('investor', e.target.value)}
      placeholder="Enter investor name"
    />

    <label>CA</label>
    <input
      className="input-field"
      value={formData.ca}
      onChange={(e) => handleChange('ca', e.target.value)}
      placeholder="Enter CA name"
    />

    {/* Ratings can be optional, so no validation on rendering here */}
    <label>Call Rating (1 to 5)</label>
    <input
      type="number"
      className="input-field"
      min="1"
      max="5"
      value={formData.call_rating}
      onChange={(e) => handleChange('call_rating', e.target.value)}
      placeholder="Enter call rating"
    />

    <label>Expert Rating (1 to 5)</label>
    <input
      type="number"
      className="input-field"
      min="1"
      max="5"
      value={formData.expert_rating}
      onChange={(e) => handleChange('expert_rating', e.target.value)}
      placeholder="Enter expert rating"
    />

    <label>FC Call Rating (1 to 5)</label>
    <input
      type="number"
      className="input-field"
      min="1"
      max="5"
      value={formData.fc_call_rating}
      onChange={(e) => handleChange('fc_call_rating', e.target.value)}
      placeholder="Enter FC call rating"
    />

    <label>FC Expert Rating (1 to 5)</label>
    <input
      type="number"
      className="input-field"
      min="1"
      max="5"
      value={formData.fc_expert_rating}
      onChange={(e) => handleChange('fc_expert_rating', e.target.value)}
      placeholder="Enter FC expert rating"
    />

    <label>Date</label>
    <input
      type="date"
      className="input-field"
      value={formData.date}
      onChange={(e) => handleChange('date', e.target.value)}
      placeholder="Enter date"
    />

    <label>Final Amount</label>
    <input
      type="number"
      className="input-field"
      value={formData.final_amount}
      onChange={(e) => handleChange('final_amount', e.target.value)}
      placeholder="Enter final amount"
    />

     {/* Sticky Footer Buttons */}
    <div className="modal-actions py-3 px-4 border-t bg-white sticky bottom-0 flex justify-end gap-3">
      <button className="save-btn" onClick={handleSubmit}>Save</button>
      <button className="cancel-btn" onClick={onClose}>Cancel</button>
    </div>
  </div>
</div>
  );
}
