'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '../../components/AuthProvider';

export default function CompanyPage() {
  const { slug } = useParams(); // comp_slug
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', tags: '' });
  const [saving, setSaving] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (!slug) return;
    fetchCompany();
  }, [slug]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/companies?filters[comp_slug][$eq]=${slug}&populate=experts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = res.data.data[0];
      setCompany(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch company:', err);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/companies/${company.documentId}`,
        {
          data: {
            name: formData.name.trim(),
            tags: formData.tags.trim(),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      await fetchCompany();
      setIsEditing(false);
      alert('✅ Company updated successfully');
    } catch (err) {
      console.error('Failed to update company:', err);
      alert('❌ Failed to update company');
    } finally {
      setSaving(false);
    }
  };

   useEffect(() => {
    if (company) {
      document.title = `KAVI | ${company.name}`;
    } else {
      document.title = 'KAVI | Company Page';
    }
  }, [company]);

  // if (loading) return (
  //   <div className="flex items-center justify-center min-h-screen bg-gray-100">
  //     <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
  //   </div>
  // );

  if (loading) {
  return <p className="text-center mt-10 text-gray-500 text-lg">Loading company data...</p>;
  }

  if (!company) return <p className="text-center mt-10 text-red-500 text-lg">Company not found</p>;

  return (
    <div className="mx-auto p-2 lg:p-6 sm:px-6 lg:px-8 w-full max-w-[95vw] space-y-8">
      <div className="bg-white shadow-lg rounded-xl p-6 space-y-6">
        {/* Header with gradient */}
        <div className="flex items-center justify-between border-b pb-4">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-2 text-lg w-full"
              />
            ) : (
              company.name
            )}
          </h1>

          {user?.role?.type === 'admin' && !isEditing && (
            <button
              onClick={() => {
                setFormData({ name: company.name || '', tags: company.tags || '' });
                setIsEditing(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full shadow-md transition duration-200"
            >
              Edit
            </button>
          )}
        </div>

        {/* Tags Section */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-600">Tags</h2>
          {isEditing ? (
            <textarea
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:ring-2 focus:ring-indigo-400"
              placeholder="Enter tags"
            />
          ) : company.tags ? (
            <div className="flex flex-wrap gap-2">
              {company.tags.split(',').map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No tags available</p>
          )}
        </section>

        {/* Expert Count */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-600">Experts</h2>
          <p className="text-gray-700 text-lg">
            {company.experts?.length || 0} expert(s) associated with this company
          </p>
        </section>

        {/* Save / Cancel Buttons */}
        {isEditing && (
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full shadow-md disabled:opacity-50 transition duration-200"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-full shadow-md transition duration-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
