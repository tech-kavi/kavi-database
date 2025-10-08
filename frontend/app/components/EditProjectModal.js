'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditProjectModal({ project, expertId, onClose, onSave }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, []);

  const [formData, setFormData] = useState({
    code: '',
    investor: '',
    ca: '',
    call_rating: '',
    expert_rating: '',
    fc_call_rating: '',
    fc_expert_rating: '',
    date: '',
    final_amount: '',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        projectId: project.documentId,
        expertId: expertId,
        code: project.code || '',
        investor: project.investor || '',
        ca: project.ca || '',
        call_rating: project.call_rating || '',
        expert_rating: project.expert_rating || '',
        fc_call_rating: project.fc_call_rating || '',
        fc_expert_rating: project.fc_expert_rating || '',
        date: project.date || '',
        final_amount: project.final_amount || '',
        duration: project.duration ||'',
        quote: project.quote || '',

      });
    }
  }, [project, expertId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    onSave({ ...project, ...formData });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="py-3 px-4 border-b text-lg font-semibold bg-white sticky top-0 z-10">
          Edit Project
        </div>

        <label>Code</label>
        <input
          name="code"
          value={formData.code}
          onChange={handleChange}
          className="input-field"
          placeholder="Enter code"
        />

        <label>Investor</label>
        <input
          name="investor"
          value={formData.investor}
          onChange={handleChange}
          className="input-field"
          placeholder="Enter investor name"
        />

        <label>CA</label>
        <input
          name="ca"
          value={formData.ca}
          onChange={handleChange}
          className="input-field"
          placeholder="Enter CA"
        />

        <label>Call Rating</label>
        <input
          type="number"
          min="1"
          max="5"
          name="call_rating"
          value={formData.call_rating}
          onChange={handleChange}
          className="input-field"
          placeholder="1-5"
        />

        <label>Expert Rating</label>
        <input
          type="number"
          min="1"
          max="5"
          name="expert_rating"
          value={formData.expert_rating}
          onChange={handleChange}
          className="input-field"
          placeholder="1-5"
        />

        <label>FC Call Rating</label>
        <input
          type="number"
          min="1"
          max="5"
          name="fc_call_rating"
          value={formData.fc_call_rating}
          onChange={handleChange}
          className="input-field"
          placeholder="1-5"
        />

        <label>FC Expert Rating</label>
        <input
          type="number"
          min="1"
          max="5"
          name="fc_expert_rating"
          value={formData.fc_expert_rating}
          onChange={handleChange}
          className="input-field"
          placeholder="1-5"
        />

        <label>Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="input-field"
        />

        <label>Final Amount (₹)</label>
        <input
          type="number"
          name="final_amount"
          value={formData.final_amount}
          onChange={handleChange}
          className="input-field"
          placeholder="Enter final amount"
        />

        <label>Duration</label>
        <input
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          className="input-field"
          placeholder="Enter Duration"
        />

        <label>Quote</label>
        <input
          type="number"
          name="quote"
          value={formData.quote}
          onChange={handleChange}
          className="input-field"
          placeholder="Enter Quote"
        />

        <div className="modal-actions py-3 px-4 border-t bg-white sticky bottom-0 z-10 flex justify-end gap-3">
          <button className="save-btn" onClick={handleSubmit}>
            Save
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
