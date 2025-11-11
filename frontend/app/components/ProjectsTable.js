'use client';
import { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProjectsTable({ projects, onEdit }) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    const newSet = new Set(expandedRows);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpandedRows(newSet);
  };

  if (!projects || projects.length === 0)
    return (
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Projects</h2>
        <p className="text-gray-500">No project data available.</p>
      </section>
    );

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Projects</h2>

      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                'Code',
                'Investor',
                'CA',
                'Call Rating',
                'Expert Rating',
                'Date',
                'Final Amount',
                'Quote',
                '',
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
            {projects.map((project, index) => {
              const id = project.id || index;
              const isExpanded = expandedRows.has(id);

              return (
                <Fragment key={id}>
                  <tr
                    onClick={() => toggleRow(id)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{project.code}</td>
                    <td className="px-6 py-4 text-gray-600">{project.investor || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{project.ca || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{project.call_rating || '-'}/5</td>
                    <td className="px-6 py-4 text-gray-600">{project.expert_rating || '-'}/5</td>
                    <td className="px-6 py-4 text-gray-600">{project.date || '-'}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {project.final_amount ? `₹${project.final_amount}` : '-'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {project.quote ? `₹${project.quote}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(project);
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
                              <strong className="text-gray-800">FC Call Rating:</strong>{' '}
                              {project.fc_call_rating || '-'}
                            </p>
                            <p>
                              <strong className="text-gray-800">FC Expert Rating:</strong>{' '}
                              {project.fc_expert_rating || '-'}
                            </p>
                            <p>
                              <strong className="text-gray-800">Duration:</strong>{' '}
                              {project.duration || '-'}
                            </p>
                            <p>
                              <strong className="text-gray-800">Quote:</strong>{' '}
                              {project.quote || '-'}
                            </p>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
