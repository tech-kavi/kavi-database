'use client'

import React, { useState, useEffect } from 'react'
import './styles/EditExperienceModal.css'
import { useRouter } from 'next/navigation'

const ENGAGEMENT_OPTIONS = [
  'Uncontacted',
  'No response',
  'Contacted but not screened',
  'Contacted & screened',
  'Sent to client',
  'Negotiation',
  'Contacted but ghosting',
  '6 mos rule',
  'Out of budget',
  'NDA',
  'Not Interested at all',
  'Not interested in project',
  'Call Scheduled',
  'Call Done',
]



export default function EditExperienceModal({ experience, expertId, onClose, onSave }) {

  const router = useRouter()

  useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
  }
}, []);


  const [formData, setFormData] = useState({
    designation: '',
    type: '',
    start_date: '',
    end_date: '',
    engagement_status: '',
    company: '',
    target_company: '',
    original_quote: '',
  })

  useEffect(() => {
    if (experience) {
      setFormData({
        experienceId: experience.documentId,
        expertId: expertId,
        designation: experience.designation || '',
        type: experience.type || '',
        start_date: experience.start_date || '',
        end_date: experience.end_date || '',
        engagement_status: experience.engagement_status || '',
        company: experience.company || '',
        target_company: experience.target_company || '',
        original_quote: experience.original_quote || '',
      })
    }
  }, [experience])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = () => {
    onSave({ ...experience, ...formData })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="py-3 px-4 border-b text-lg font-semibold bg-white sticky top-0 z-10">
          Edit Experience
        </div>

        <label>Designation</label>
        <input
          name="designation"
          value={formData.designation}
          onChange={handleChange}
          className="input-field"
          placeholder="Enter designation"
        />

        <label>Type</label>
        <input
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="input-field"
          placeholder="e.g. Current, Former"
        />

        <label>Start Date</label>
        <input
          type="date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          className="input-field"
        />

        <label>End Date</label>
        <input
          type="date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
          className="input-field"
        />

        <label>Engagement Status</label>
        <select
          name="engagement_status"
          value={formData.engagement_status}
          onChange={handleChange}
          className="input-field"
        >
          <option value="">Select status</option>
          {ENGAGEMENT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>


        <label>Company</label>
        <input
          name="company"
          value={formData.company.name}
          readOnly
          className="input-field read-only"
          placeholder="Company name"
        />

        <label>Target Company</label>
        <input
          name="target_company"
          value={formData.target_company.name}
          readOnly
          className="input-field read-only"
          placeholder="Target company name"
        />

        <label>Original Quote</label>
        <input
          name="original_quote"
          value={formData.original_quote}
          onChange={handleChange}
          className="input-field"
          placeholder="Enter original quote"
        />

        <div className="modal-actions py-3 px-4 border-t bg-white sticky bottom-0 z-10 flex justify-end gap-3">
          <button className="save-btn" onClick={handleSubmit}>Save</button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
