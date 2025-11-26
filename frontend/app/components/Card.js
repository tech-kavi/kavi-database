'use client'

import { useHits, Highlight, useInstantSearch } from 'react-instantsearch-hooks-web';
import Badge from '../components/Badge';
import { TYPE_COLORS, ENGAGEMENT_COLORS } from '../constants/options';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthProvider';

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


export default function Card({ hits, onSelectSlug }) {
  const { status } = useInstantSearch();
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0, slug: null });
  const menuRef = useRef();
  const {loading} = useAuth();




 // console.log(hits);

  // Hide menu on click elsewhere
  useEffect(() => {
    const handleClick = () => setMenu({ visible: false, x: 0, y: 0, slug: null });
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Handle right click
    const handleContextMenu = (e, slug) => {
      e.preventDefault();
      setMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        slug,
      });
    };

  const handleOpenInNewTab = () => {
    if (menu.slug) window.open(`/expert/${menu.slug}`, '_blank');
    setMenu({ visible: false, x: 0, y: 0, slug: null });
  };

const [hasSearched, setHasSearched] = useState(false);

useEffect(() => {
  if (status === 'idle' && hits.length >= 0) {
    setHasSearched(true);
  }
}, [status, hits]);
 


  return (
    <div className="overflow-x-auto rounded-xl shadow-md bg-white border border-gray-200 relative">
      <table className="w-full table-fixed text-left border-collapse text-sm">
        <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wide">
          <tr className="border-b">
            <th className="px-2 py-3 h-14 w-[150px]">Name</th>
            <th className="px-2 py-3 w-[150px]">Company</th>
            <th className="px-2 py-3 text-center w-[100px]">Type</th>
            <th className="px-2 py-3 w-[180px]">Designation</th>
            <th className="px-2 py-3 w-[150px]">Topic</th>
            <th className="px-2 py-3 w-[80px] text-center">Start</th>
            <th className="px-2 py-3 w-[80px] text-center">End</th>
            <th className="px-2 py-3 text-center w-[80px]">Quote ₹</th>
            <th className="px-2 py-3 text-center w-[150px]">Project Status</th>
            <th className="px-2 py-3 text-center w-[150px]">Key Status</th>
            {/* <th className="px-4 py-3 w-[180px]">Last Update</th> */}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-gray-200">
          {
          (status === 'loading') ? (
        // 🌀 Loader row
        <tr>
          <td colSpan={10} className="py-10 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-500 mt-2">Loading experts...</p>
          </td>
        </tr>
      )  : (status === 'idle' && hits.length === 0) ? (
        <tr>
          <td colSpan={10} className="py-10 text-center text-gray-500">
            No experts found.
          </td>
        </tr>
      ) :  (
            hits.map((hit) => (
              <tr
                key={hit.objectID}
                className="hover:bg-gray-50 transition cursor-pointer h-16"
                onClick={() => onSelectSlug(hit.slug)}
                onContextMenu={(e) => handleContextMenu(e, hit.slug)}
                title={hit?.last_update
                    ? `${hit.last_update.name.split('@')[0].charAt(0).toUpperCase()}${hit.last_update.name
                        .split('@')[0]
                        .slice(1)} - ${new Date(hit.last_update.time).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                        timeZone: 'Asia/Kolkata',
                      })}`
                    : '-'}
              >
                <td className="px-2 py-3 max-w-[180px] truncate">
                  {hit.linkedin ? (
                    <a
                      href={hit.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-blue-600 font-medium"
                    >
                      {hit.name}
                    </a>
                  ) : (
                    <span className="font-medium text-gray-800">{hit.name}</span>
                  )}
                </td>

                <td className="px-2 py-3 max-w-[160px] truncate" title={hit?.company}>
                  {hit?.company || '-'}
                </td>

                <td className="px-2 py-3 text-center">
                  <Badge label={hit.type} options={TYPE_COLORS} />
                </td>

                <td
                  title={hit?.designation}
                  className="px-2 py-3 truncate text-gray-700"
                >
                  {hit?.designation || '-'}
                </td>

                <td className="px-2 py-3 max-w-[150px] truncate" title={hit?.target_company?.name}>
                  {hit?.target_company?.name || '-'}
                </td>

                <td className="px-2 py-3 max-w-[80px] truncate text-center" title={hit?.start_date}>
                    {formatDate(hit?.start_date) || '-'}
                  </td>

                  <td className="px-2 py-3 max-w-[80px] truncate text-center" title={hit?.end_date}>
                    {formatDate(hit?.end_date) || '-'}
                  </td>

                <td className="px-2 py-3 text-center font-semibold text-gray-700 max-w-[80px] ">
                  {hit?.original_quote
                    ? `₹${Number(hit.original_quote).toLocaleString('en-IN')}`
                    : '-'}
                </td>

                <td className="px-2 py-3 text-center">
                  <Badge label={hit.engagement_status} options={ENGAGEMENT_COLORS} truncate={true} />
                </td>

                <td className="px-2 py-3 text-center">
                  <Badge label={hit.expert_status} options={ENGAGEMENT_COLORS} truncate={true} />
                </td>

                {/* <td className="px-4 py-3 text-xs text-gray-500 break-words max-w-[200px] text-center">
                  {hit?.last_update
                    ? `${hit.last_update.name.split('@')[0].charAt(0).toUpperCase()}${hit.last_update.name
                        .split('@')[0]
                        .slice(1)} - ${new Date(hit.last_update.time).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                        timeZone: 'Asia/Kolkata',
                      })}`
                    : '-'}
                </td> */}
              </tr>
              
            ))
          )
        }
        </tbody>
      </table>

      {/* Custom Context Menu */}

      {menu.visible && (
      <div
        ref={menuRef}
        style={{ top: menu.y, left: menu.x }}
        className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg w-40"
      >
        <button
          onClick={handleOpenInNewTab}
          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
        >
          Open in new tab
        </button>
      </div>
    )}

    </div>
  );
}
