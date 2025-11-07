'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from './Badge';
import { TYPE_COLORS, ENGAGEMENT_COLORS } from '../constants/options';

const getTenure = (startDate, endDate) => {
  if (!startDate) return 'N/A';
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(); // Use current date if no end date

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const yearStr = years > 0 ? `${years} yr${years > 1 ? 's' : ''}` : '';
  const monthStr = months > 0 ? `${months} mo${months > 1 ? 's' : ''}` : '';

  return [yearStr, monthStr].filter(Boolean).join(' '); // join non-empty parts
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;

  // Parse safely
  const date = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(date)) return null;

  // Get short month and 2-digit year
  const month = date.toLocaleString('en-US', { month: 'short' }); // e.g., "Dec"
  const year = date.toLocaleString('en-US', { year: '2-digit' }); // e.g., "21"

  return `${month}-${year}`; // e.g., "Dec-21"
};


export default function ExperiencesTable({ expert, handleEdit }) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    const newSet = new Set(expandedRows);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpandedRows(newSet);
  };

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Experiences</h2>

      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                'Designation',
                'Company',
                'Type',
                'Topic',
                'Start Date',
                'End Date',
                'Tenure',
                'Status',
                'Quote',
                ''
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left font-semibold text-gray-700 uppercase tracking-wider text-xs"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {expert.expert_experiences?.length ? (
              expert.expert_experiences.map((exp) => {
                const isExpanded = expandedRows.has(exp.id);
                return (
                  <Fragment key={exp.id}>
                    <tr
                      onClick={() => toggleRow(exp.id)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-[200px]" title={exp.designation}>{exp.designation}</td>
                      <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]" title={exp?.company || '-'}>{exp?.company || '-'}</td>
                      <td className="px-6 py-4">
                        <Badge label={exp.type} options={TYPE_COLORS} truncate />
                      </td>

                      <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]" title={exp?.target_company?.name || '-'}>{exp?.target_company?.name || '-'}</td>
                      <td className="px-6 py-4 text-gray-600 truncate">{formatDate(exp.start_date) || '-'}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(exp.end_date) || '-'}</td>
                      <td className="px-6 py-4 text-gray-600 truncate">{getTenure(exp.start_date, exp.end_date)}</td>

                      <td className="px-6 py-4">
                        <Badge label={exp.engagement_status} options={ENGAGEMENT_COLORS} truncate />
                      </td>
                      <td className="px-6 py-4 text-gray-600 truncate max-w-[80px]">
                        {exp.quote? "₹" + exp.quote : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(exp);
                          }}
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-gray-50"
                        >
                          <td colSpan={9} className="px-6 py-4 text-gray-700">
                            <div className="grid sm:grid-cols-2 gap-2">
                              <p>
                                <strong className="text-gray-800">Industry:</strong>{' '}
                                {exp.sub_industry?.name || '-'}
                              </p>
                             
                              
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                  No experiences added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

import { Fragment } from 'react';
