'use client'

import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast';


export default function ExpertForm({ onClose, onExpertAdded }) {
  const [formData, setFormData] = useState({
    // Expert fields
    name: "",
    linkedin: "",
    email: "",
    phone: "",
    quote: "",
    ra_comments: "",
    bank_details: "",
    source_of_response: "",
    notes: "",
    screening: "",
    // Experience fields (single example)
    experience_designation: "",
    experience_type: "",
    experience_start_date: "",
    experience_end_date: "",
    // Project fields (single example)
    project_code: "",
    project_final_amount: "",
    project_ca: "",
    project_investor: "",
    project_call_rating: "",
    project_expert_rating: "",
    project_fc_call_rating: "",
    project_fc_expert_rating: "",
    project_date: ""
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Prepare payload for custom Strapi API
    const payload = {
      expertData: {
        name: formData.name,
        linkedin: formData.linkedin,
        email: formData.email,
        phone: formData.phone ? parseInt(formData.phone) : null,
        quote: formData.quote ? parseInt(formData.quote) : null,
        ra_comments: formData.ra_comments,
        bank_details: formData.bank_details,
        source_of_response: formData.source_of_response,
        notes: formData.notes,
        screening: formData.screening,
      },
      experiences: [
        {
          designation: formData.experience_designation,
          type: formData.experience_type,
          start_date: formData.experience_start_date || null,
          end_date: formData.experience_end_date || null,
        }
      ],
      projects: [
        {
          code: formData.project_code,
          final_amount: formData.project_final_amount ? parseInt(formData.project_final_amount) : null,
          ca: formData.project_ca,
          investor: formData.project_investor,
          call_rating: formData.project_call_rating ? parseInt(formData.project_call_rating) : null,
          expert_rating: formData.project_expert_rating ? parseInt(formData.project_expert_rating) : null,
          fc_call_rating: formData.project_fc_call_rating ? parseInt(formData.project_fc_call_rating) : null,
          fc_expert_rating: formData.project_fc_expert_rating ? parseInt(formData.project_fc_expert_rating) : null,
          date: formData.project_date || null
        }
      ]
    };

    // Call your custom Strapi endpoint
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/experts`,
      payload,
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    onExpertAdded(res.data);
  } catch (err) {
    console.error("Error creating expert", err);
    //alert("Failed to create expert");
    toast.error('Failed to create expert')
  }
};

  return (
    <div className="modal-overlay">
      <div className="modal-content overflow-y-auto max-h-[90vh]">
        {/* Sticky Header */}
        <div className="py-3 px-4 border-b text-lg font-semibold bg-white sticky top-0 z-10">
          Add New Expert
        </div>

        {/* Expert fields */}
        <label>Name</label>
        <input
          className="input-field"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter expert's name"
        />

        <label>LinkedIn URL</label>
        <input
          className="input-field"
          name="linkedin"
          value={formData.linkedin}
          onChange={handleChange}
          placeholder="Enter LinkedIn URL"
        />

        <label>Email</label>
        <input
          className="input-field"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email"
        />

        <label>Phone</label>
        <input
          className="input-field"
          name="phone"
          type="number"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
        />

        <label>Quote</label>
        <input
          className="input-field"
          name="quote"
          type="number"
          value={formData.quote}
          onChange={handleChange}
          placeholder="Enter quote"
        />

        <label>RA Comments</label>
        <textarea
          className="input-field"
          name="ra_comments"
          value={formData.ra_comments}
          onChange={handleChange}
          placeholder="Enter RA comments"
        />

        <label>Bank Details</label>
        <textarea
          className="input-field"
          name="bank_details"
          value={formData.bank_details}
          onChange={handleChange}
          placeholder="Enter bank details"
        />

        <label>Source of Response</label>
        <select
          className="input-field"
          name="source_of_response"
          value={formData.source_of_response}
          onChange={handleChange}
        >
          <option value="">Select Source</option>
          <option value="Cold calling">Cold calling</option>
          <option value="Linkedin">Linkedin</option>
          <option value="Email">Email</option>
          <option value="Others">Others</option>
        </select>

        <label>Notes</label>
        <textarea
          className="input-field"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Enter notes"
        />

        <label>Screening</label>
        <textarea
          className="input-field"
          name="screening"
          value={formData.screening}
          onChange={handleChange}
          placeholder="Enter screening notes"
        />

        {/* Separator and Experience section */}
        <hr className="my-6 border-gray-300" />
        <h3 className="text-lg font-semibold mb-4">Experience Details</h3>

        <label>Designation</label>
        <input
          name="experience_designation"
          placeholder="Designation"
          onChange={handleChange}
          className="input-field"
        />

        <label>Expert Type</label>
        <select
          name="experience_type"
          onChange={handleChange}
          className="input-field"
        >
          <option value="">Select Type</option>
          <option value="Former">Former</option>
          <option value="Competitor">Competitor</option>
          <option value="Customer">Customer</option>
          <option value="Partner">Partner</option>
          <option value="Industry Expert">Industry Expert</option>
        </select>

        <label>Start Date</label>
        <input
          name="experience_start_date"
          type="date"
          onChange={handleChange}
          className="input-field"
        />

        <label>End Date</label>

        <input
          name="experience_end_date"
          type="date"
          onChange={handleChange}
          className="input-field"
        />

        {/* Separator and Project section */}
        <hr className="my-6 border-gray-300" />
        <h3 className="text-lg font-semibold mb-4">Project Details</h3>

        <label>Code</label>
        <input
          name="project_code"
          placeholder="Project Code"
          onChange={handleChange}
          className="input-field"
        />

        <label>Final Amount</label>
        <input
          name="project_final_amount"
          type="number"
          onChange={handleChange}
          placeholder="Final Amount"
          className="input-field"
        />

        <label>CA</label>
        <input
          name="project_ca"
          placeholder="CA"
          onChange={handleChange}
          className="input-field"
        />

        <label>Investor</label>
        <input
          name="project_investor"
          placeholder="Investor"
          onChange={handleChange}
          className="input-field"
        />

        <label>Call Rating</label>
        <input
          name="project_call_rating"
          type="number"
          max="5"
          onChange={handleChange}
          placeholder="Call Rating (max 5)"
          className="input-field"
        />

        <label>Expert Rating</label>
        <input
          name="project_expert_rating"
          type="number"
          max="5"
          onChange={handleChange}
          placeholder="Expert Rating (max 5)"
          className="input-field"
        />

        <label>FC Call Rating</label>
        <input
          name="project_fc_call_rating"
          type="number"
          max="5"
          onChange={handleChange}
          placeholder="FC Call Rating (max 5)"
          className="input-field"
        />

        <label>FC Expert Rating</label>
        <input
          name="project_fc_expert_rating"
          type="number"
          max="5"
          onChange={handleChange}
          placeholder="FC Expert Rating (max 5)"
          className="input-field"
        />

        <label>Call Date</label>
        <input
          name="project_date"
          type="date"
          onChange={handleChange}
          className="input-field"
        />

        {/* Sticky Footer Buttons */}
        <div className="modal-actions py-3 px-4 border-t bg-white sticky bottom-0 z-10 flex justify-end gap-3">
          <button className="save-btn" onClick={handleSubmit}>
            Save Expert
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
