'use client'


import { useState } from 'react';
import './styles/EditExperienceModal.css';
import axios from 'axios';

// const ENGAGEMENT_OPTIONS = [
//   'Uncontacted',
//   'No response',
//   'Contacted but not screened',
//   'Contacted & screened',
//   'Sent to client',
//   'Negotiation',
//   'Contacted but ghosting',
//   '6 mos rule',
//   'Out of budget',
//   'NDA',
//   'Not Interested at all',
//   'Not interested in project',
//   'Call Scheduled',
//   'Call Done',
// ]

import { ENGAGEMENT_OPTIONS } from '../constants/options';
import { SOURCE_OF_RESPONSE } from '../constants/options';

export default function EditExpertDetailsModal({ expert, onClose, onSave }) {

  const [formData, setFormData] = useState({
    email: expert.email || '',
    linkedin: expert.linkedin || '',
    phone: expert.phone || '',
    original_quote: expert.original_quote || '',
    ra_comments: expert.ra_comments || '',
    notes: expert.notes || '',
    expert_status:expert.expert_status||'',
    screening: expert.screening || '',
    bank_details: expert.bank_details || '',
    source_of_response: expert.source_of_response || '',
    tags: expert.tags ||[],
    credits: expert.credits || 0,
    compliance: expert.compliance || '',
  });



  // const [tagsInput, setTagsInput] = useState(formData.tags.join(', '));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

     const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Call your onSave which does the API update
      await onSave({...formData });
    } catch (err) {
      console.error("Error updating experience:", err);
    } finally {
      setIsSubmitting(false);
    }
};

  // const handleSubmit = async () => {
  //   setIsSubmitting(true);
  //   try {
  //     const token = localStorage.getItem('token');
  //     const res = await axios.put(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/experts/${expert.slug}`,
  //       {
  //         data: formData,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     onSave(res.data);
  //     onClose();
  //   } catch (err) {
  //     console.error(err);
  //     alert('Failed to update expert details.');
  //   }
  //   finally {
  //     setIsSubmitting(false);
  //   }
  // };

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
            <label>LinkedIn</label>
            <input
              className="input-field"
              value={formData.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
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
            <label>Original Quote</label>
            <input
              type="number"
              className="input-field"
              value={formData.original_quote}
              onChange={(e) =>
              handleChange(
                'original_quote',
                e.target.value === '' ? null : Number(e.target.value)
              )
            }
            />
          </div>

          <div>
          <label>Expert Status</label>
          <select
            name="expert_status"
            value={formData.expert_status || ''}
            onChange={(e) => handleChange('expert_status', e.target.value || null)}
            className="input-field"
          >
            <option value="">Select status</option>
            {ENGAGEMENT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          </div>

          <div>
            <label>Source of Response</label>
            <select
              name="source_of_response"
              className="input-field"
              value={formData.source_of_response || ''} // keeps controlled
              onChange={(e) => handleChange('source_of_response', e.target.value)}
            >
              <option value="">Select source</option> {/* Add a default blank option */}
              {SOURCE_OF_RESPONSE.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

          </div>

          {/* <div>
            <label>RA Comments</label>
            <textarea
              className="input-field"
              rows={3}
              value={formData.ra_comments}
              onChange={(e) => handleChange('ra_comments', e.target.value)}
            ></textarea>
          </div> */}

          {/* <div>
            <label>Notes</label>
            <textarea
              className="input-field"
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            ></textarea>
          </div> */}

          {/* <div>
            <label>Screening</label>
            <textarea
              className="input-field"
              rows={3}
              value={formData.screening}
              onChange={(e) => handleChange('screening', e.target.value)}
            ></textarea>
          </div> */}
{/* 
          <div>
            <label>Bank Details</label>
            <textarea
              className="input-field"
              rows={3}
              value={formData.bank_details}
              onChange={(e) => handleChange('bank_details', e.target.value)}
            ></textarea>
          </div> */}

          <div>
            <label>Credits</label>
            <input
              type="number"
              className="input-field"
              value={formData.credits}
              onChange={(e) => handleChange('credits', e.target.value)}
            />
          </div>

          <div>
            <label>Compliance</label>
            <input
              className="input-field"
              rows={3}
              value={formData.compliance}
              onChange={(e) => handleChange('compliance', e.target.value)}
            ></input>
          </div>

          {/* <div>
            <label>Tags</label>
            <input
              className="input-field"
              value={tagsInput}
              onChange={(e) => {
                const value = e.target.value;
                setTagsInput(value);
                handleChange(
                  'tags',
                  value.split(',').map((t) => t.trim()).filter(Boolean)
                );
              }}
              placeholder="Enter tags separated by commas"
            />
          </div> */}

        </div>

       <div className="modal-actions py-3 px-4 border-t bg-white sticky bottom-0 z-10 flex justify-end gap-3">
        <button
            className="save-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>

          <button
            className="cancel-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
        </div>
      </div>
    </div>
  );
}
