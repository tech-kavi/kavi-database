'use client'

import React, { useState, useEffect } from 'react'
import './styles/EditExperienceModal.css'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import AsyncSelect from 'react-select/async';

import { TYPE_OPTIONS, ENGAGEMENT_OPTIONS, TYPE_COLORS, ENGAGEMENT_COLORS } from '../constants/options'

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

// const TYPE_OPTIONS = [
//   'Former',
//   'Customer',
//   'Competitor',
//   'Industry Expert',
//   'Partner',
// ];


export default function EditExperienceModal({ experience, expertId, onClose, onSave }) {

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [allCompanies, setAllCompanies] = useState(false);



 useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
    return;
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
    target_company_name: '',
    quote: '',
    sub_industry:'',
  })

  const [prefetchedCompanies, setPrefetchedCompanies] = useState([]);
const [prefetchedIndustries, setPrefetchedIndustries] = useState([]);

useEffect(() => {
  const fetchDefaults = async () => {
    const token = localStorage.getItem('token');

    try {
      const [companiesRes, industriesRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/companies?pagination[limit]=50`, { headers: { Authorization: `Bearer ${token}` }}),
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sub-industries?pagination[limit]=50`, { headers: { Authorization: `Bearer ${token}` }}),
      ]);

      setPrefetchedCompanies(companiesRes.data.data.map(c => ({ value: c.documentId, label: c.name })));
      setPrefetchedIndustries(industriesRes.data.data.map(i => ({ value: i.documentId, label: i.name })));
    } catch (err) {
      console.error("Prefetch error:", err);
    }
  };

  fetchDefaults();
}, []);

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
        target_company_name: experience.target_company?.name || '',
        target_company: experience.target_company?.documentId || '',
        quote: experience.quote || '',
        sub_industry_name: experience?.sub_industry?.name||'',
        sub_industry: experience?.sub_industry?.documentId||'',
      })
    }

    console.log(experience);
  }, [experience])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Call your onSave which does the API update
      await onSave({ ...experience, ...formData });
    } catch (err) {
      console.error("Error updating experience:", err);
    } finally {
      setIsSubmitting(false);
    }
};

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
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="input-field"
        >
          <option value="">Select type</option>
          {TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

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
          value={formData.company}
          onChange={handleChange}
          className="input-field"
          placeholder="Company name"
        />


        <label>Target Company</label>
        {/* <AsyncSelect
          cacheOptions
          defaultOptions
          value={
            formData.target_company
              ? { value: formData.target_company, label: formData.target_company_name }
              : null
          }
          loadOptions={async (inputValue) => {
            if (!inputValue || inputValue.length < 2) return [];

            try {
              const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/companies?filters[name][$containsi]=${inputValue}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
              );

              return res.data.data.map((company) => ({
                value: company.documentId,
                label: company.name,
                name: company.name,
              }));
            } catch (err) {
              console.error('Error fetching companies:', err);
              return [];
            }
          }}
          onChange={(selected) => {
            setFormData({
              ...formData,
              target_company: selected?.value || '',
              target_company_name: selected?.label || '',
            });
          }}
          placeholder="Search and select target company..."
        /> */}

        <AsyncSelect
          cacheOptions
          defaultOptions={prefetchedCompanies} // use preloaded companies
          value={
            formData.target_company
              ? { value: formData.target_company, label: formData.target_company_name }
              : null
          }
          loadOptions={async (inputValue) => {
            if (!inputValue || inputValue.length < 2) return prefetchedCompanies; // return prefetched if no input

            try {
              const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/companies?filters[name][$containsi]=${inputValue}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
              );

              return res.data.data.map((company) => ({
                value: company.documentId,
                label: company.name,
              }));
            } catch (err) {
              console.error('Error fetching companies:', err);
              return [];
            }
          }}
          onChange={(selected) => {
            setFormData({
              ...formData,
              target_company: selected?.value || '',
              target_company_name: selected?.label || '',
            });
          }}
          placeholder="Search and select target company..."
        />





        <label>Industry</label>
        <AsyncSelect
          cacheOptions
          defaultOptions={prefetchedIndustries}
          value={
            formData.sub_industry
              ? { value: formData.sub_industry, label: formData?.sub_industry_name }
              : null
          }
          loadOptions={async (inputValue) => {
            if (!inputValue || inputValue.length < 2) return prefetchedIndustries;;

            try {
              const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sub-industries?filters[name][$containsi]=${inputValue}`,
                {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
              );

              return res.data.data.map((industry) => ({
                value: industry.documentId,
                label: industry.name,
                name: industry.name
              }));
            } catch (err) {
              console.error('Error fetching sub-industries:', err);
              return [];
            }
          }}
          onChange={(selected) => {
            setFormData({
              ...formData,
              sub_industry: selected?.value || '',
              sub_industry_name: selected?.label || '',
            });
          }}
          placeholder="Search and select sub-industry..."
        />


        <label>Quote</label>
        <input
        type='number'
          name="quote"
          value={formData.quote}
          onChange={handleChange}
          className="input-field"
          placeholder="Enter quote"
        />

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
  )
}
