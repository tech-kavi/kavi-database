'use client'

import { useHits, Highlight, useInstantSearch } from 'react-instantsearch-hooks-web';
import Badge from '../components/Badge';
import { TYPE_COLORS, ENGAGEMENT_COLORS } from '../constants/options';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Card({ hits, onSelectSlug }) {
  const { status } = useInstantSearch();

  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0, slug: null });
  const menuRef = useRef();

    // Hide menu on click elsewhere
  useEffect(() => {
    const handleClick = () => setMenu({ visible: false, x: 0, y: 0, slug: null });
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

    // Handle right click
  const handleContextMenu = (e, slug) => {
    e.preventDefault();
    setMenu({ visible: true, x: e.pageX, y: e.pageY, slug });
  };

  const handleOpenInNewTab = () => {
    if (menu.slug) window.open(`/expert/${menu.slug}`, '_blank');
    setMenu({ visible: false, x: 0, y: 0, slug: null });
  };

  return (
    <div className="overflow-x-auto rounded-xl shadow-md bg-white border border-gray-200">
      <table className="w-full table-auto text-left border-collapse">
        <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wide">
          <tr className='border-b'>
            <th className="px-4 py-3 h-20">Name</th>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3 text-center">Type</th>
            <th className="px-4 py-3">Designation</th>
            <th className="px-4 py-3">Topic</th>
            <th className="px-4 py-3 text-center">Org Quote</th>
            <th className="px-4 py-3 text-center">Project Status</th>
            <th className="px-4 py-3 text-center">Key Status</th>
            <th className="px-4 py-3">Last Update</th>
          </tr>
        </thead>
          {/* Table Body */}
        <tbody className="divide-y divide-gray-200">
          {status === 'loading' ? (
            <tr>
              <td colSpan={9} className="py-10 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-gray-500 mt-2">Loading experts...</p>
              </td>
            </tr>
          ) : (
            hits.map((hit) => (
              <tr
                key={hit.objectID}
                className="hover:bg-gray-50 transition cursor-pointer h-20"
                onClick={() => onSelectSlug(hit.slug)}
                onContextMenu={(e)=> handleContextMenu(e,hit.slug)}
              >
                <td className="px-4 py-3 max-w-[180px] truncate">
                  <a href={hit.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 font-medium">
                    <Highlight attribute="name" hit={hit} />
                  </a>
                </td>
                <td className="px-4 py-3 max-w-[150px] truncate">{hit?.company?.name || '-'}</td>
                <td className="px-4 py-3 text-center"><Badge label={hit.type} options={TYPE_COLORS} /></td>
                <td title={hit?.designation} className="px-4 py-3 max-w-[150px] truncate">{hit?.designation || '-'}</td>
                <td className="px-4 py-3 max-w-[150px] truncate">{hit?.target_company?.name || '-'}</td>
                <td className="px-4 py-3 text-center">{hit?.original_quote || '-'}</td>
                <td className="px-4 py-3 text-center"><Badge label={hit.engagement_status} options={ENGAGEMENT_COLORS} truncate={true}/></td>
                <td className="px-4 py-3 text-center"><Badge label={hit.expert_status} options={ENGAGEMENT_COLORS} truncate={true}/></td>
                <td className="px-4 py-3 text-xs text-gray-500 break-words max-w-[200px]">
                  {hit?.last_update
                    ? `${hit.last_update.name.split('@')[0].charAt(0).toUpperCase()}${hit.last_update.name.split('@')[0].slice(1)} - ${new Date(hit.last_update.time).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone:"Asia/Kolkata"
                      })}`
                    : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>


       {/* Custom Context Menu */}
      {menu.visible && (
        <div
          ref={menuRef}
          style={{ top: menu.y, left: menu.x }}
          className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg w-40"
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
