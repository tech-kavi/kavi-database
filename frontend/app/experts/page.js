

'use client';

import { useState, useEffect, useRef } from 'react';
import { SearchBox, SortBy, RefinementList, useRange, useNumericMenu, Configure, useHits, useStats, Index , Pagination, useInstantSearch} from 'react-instantsearch-hooks-web';
import Card from '../components/Card';
import ExpertSidePanel from '../components/ExpertSidePanel';
import Head from 'next/head';


function StatsHeader() {
  const { nbHits } = useStats();
  return (
    <div className="text-sm text-gray-600">
      Found <span className="font-semibold">{nbHits}</span> experts
    </div>
  );
}

function CustomRangeInput({ attribute }) {
  const { start, range, refine } = useRange({ attribute });
  const [sd, setSd] = useState('');
  const [ed, setEd] = useState('');

  const dateToUnix = (dateStr) => {
    if (!dateStr) return undefined;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? undefined : Math.floor(date.getTime() / 1000);
  };

  const handleChange = (type, value) => {
    if (type === 'min') setSd(value);
    else setEd(value);

    const newStart = type === 'min' ? dateToUnix(value) : start[0] ?? range.min;
    const newEnd = type === 'max' ? dateToUnix(value) : start[1] ?? range.max;

    refine([Number.isFinite(newStart) ? newStart : undefined, Number.isFinite(newEnd) ? newEnd : undefined]);
  };

  return (
    <div className="space-y-1">
      <div className="text-sm font-semibold text-gray-700">Start Date</div>
      <div className="flex gap-2">
        <input type="date" value={sd} onChange={(e) => handleChange('min', e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm" />
        <input type="date" value={ed} onChange={(e) => handleChange('max', e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm" />
      </div>
    </div>
  );
}



function EndDateNumericMenu({ attribute }) {
  const CURRENT_TS = Math.floor(Date.now() / 1000);
  const { items, refine } = useNumericMenu({
    attribute,
    items: [
      { label: 'Any', start: undefined, end: undefined },
      { label: 'Currently Working', start: 0, end: 0 },
      { label: '6+ Months', start: CURRENT_TS - 6 * 30 * 24 * 3600 },
      { label: '1+ Year', start: CURRENT_TS - 365 * 24 * 3600 },
      { label: '2+ Years', start: CURRENT_TS - 2 * 365 * 24 * 3600 },
    ],
  });

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <label key={item.label} className="flex items-center gap-2 text-sm">
          <input type="radio" name={attribute} checked={item.isRefined} onChange={() => refine(item.value)} className="form-radio h-4 w-4 text-blue-600" />
          <span>{item.label} ({item.count})</span>
        </label>
      ))}
    </div>
  );
}

function DropdownFilters({ open, setOpen,setSelectedSlug }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium"
      >
        Filters
      </button>

      <div
        className={`absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4
          transition-transform duration-200 origin-top ${
            open ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
          }`}
      >
        <div className="flex flex-col gap-6 text-sm max-h-96 overflow-y-auto">
          {/* Type Filter - Non-searchable */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Type</h3>
            <RefinementList
              attribute="type"
              classNames={{
                root: '',
                list: 'space-y-1 max-h-32 overflow-y-auto',
                item: 'flex items-center justify-between text-sm text-gray-800',
                checkbox: 'form-checkbox h-4 w-4 text-blue-600',
                label: 'flex items-center gap-2',
                count: 'text-gray-500 text-xs',
              }}
            />
          </div>

          {/* Tags Filter - With proper search configuration */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Tags</h3>
            <RefinementList
              attribute="tags"
              searchable={true}
              searchablePlaceholder="Search tags..."
              limit={10}
              classNames={{
                root: 'w-full',
                searchBox: 'mb-2',
                searchBoxForm: 'flex rounded-md overflow-hidden border border-gray-300',
                searchBoxInput: 'flex-grow px-2 py-1 focus:outline-none text-sm',
                searchBoxSubmit: 'hidden',
                searchBoxReset: 'px-2 text-gray-400 hover:text-gray-600 cursor-pointer',
                searchBoxResetIcon: 'w-3 h-3',
                list: 'space-y-1 max-h-32 overflow-y-auto',
                item: 'flex items-center justify-between text-sm text-gray-800 hover:bg-gray-50 p-1 rounded',
                checkbox: 'form-checkbox h-4 w-4 text-blue-600',
                label: 'flex items-center gap-2 cursor-pointer',
                labelText: 'flex-1',
                count: 'text-gray-500 text-xs ml-2',
              }}
            />
          </div>

          {/* Target Company Filter - With proper search configuration */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Industry</h3>
            <RefinementList
              attribute="sub_industry.name"
              searchable={true}
              searchablePlaceholder="Search industry..."
              limit={10}
              classNames={{
                root: 'w-full',
                searchBox: 'mb-2',
                searchBoxForm: 'flex rounded-md overflow-hidden border border-gray-300',
                searchBoxInput: 'flex-grow px-2 py-1 focus:outline-none text-sm',
                searchBoxSubmit: 'hidden',
                searchBoxReset: 'px-2 text-gray-400 hover:text-gray-600 cursor-pointer',
                searchBoxResetIcon: 'w-3 h-3',
                list: 'space-y-1 max-h-32 overflow-y-auto',
                item: 'flex items-center justify-between text-sm text-gray-800 hover:bg-gray-50 p-1 rounded',
                checkbox: 'form-checkbox h-4 w-4 text-blue-600',
                label: 'flex items-center gap-2 cursor-pointer',
                labelText: 'flex-1',
                count: 'text-gray-500 text-xs ml-2',
              }}
            />
          </div>

          {/* Company Filter - With proper search configuration */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Company</h3>
            <RefinementList
              attribute="company"
              searchable={true}
              searchablePlaceholder="Search companies..."
              limit={10}
              classNames={{
                root: 'w-full',
                searchBox: 'mb-2',
                searchBoxForm: 'flex rounded-md overflow-hidden border border-gray-300',
                searchBoxInput: 'flex-grow px-2 py-1 focus:outline-none text-sm',
                searchBoxSubmit: 'hidden',
                searchBoxReset: 'px-2 text-gray-400 hover:text-gray-600 cursor-pointer',
                searchBoxResetIcon: 'w-3 h-3',
                list: 'space-y-1 max-h-32 overflow-y-auto',
                item: 'flex items-center justify-between text-sm text-gray-800 hover:bg-gray-50 p-1 rounded',
                checkbox: 'form-checkbox h-4 w-4 text-blue-600',
                label: 'flex items-center gap-2 cursor-pointer',
                labelText: 'flex-1',
                count: 'text-gray-500 text-xs ml-2',
              }}
            />
          </div>

           {/* Target Company Filter - With proper search configuration */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Topic</h3>
            <RefinementList
              attribute="target_company.name"
              searchable={true}
              searchablePlaceholder="Search topic..."
              limit={10}
              classNames={{
                root: 'w-full',
                searchBox: 'mb-2',
                searchBoxForm: 'flex rounded-md overflow-hidden border border-gray-300',
                searchBoxInput: 'flex-grow px-2 py-1 focus:outline-none text-sm',
                searchBoxSubmit: 'hidden',
                searchBoxReset: 'px-2 text-gray-400 hover:text-gray-600 cursor-pointer',
                searchBoxResetIcon: 'w-3 h-3',
                list: 'space-y-1 max-h-32 overflow-y-auto',
                item: 'flex items-center justify-between text-sm text-gray-800 hover:bg-gray-50 p-1 rounded',
                checkbox: 'form-checkbox h-4 w-4 text-blue-600',
                label: 'flex items-center gap-2 cursor-pointer',
                labelText: 'flex-1',
                count: 'text-gray-500 text-xs ml-2',
              }}
            />
          </div>



          {/* File Filter - With proper search configuration */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">File</h3>
            <RefinementList
              attribute="upload_file_details"
              searchable={true}
              searchablePlaceholder="Search files..."
              limit={10}
              classNames={{
                root: 'w-full',
                searchBox: 'mb-2',
                searchBoxForm: 'flex rounded-md overflow-hidden border border-gray-300',
                searchBoxInput: 'flex-grow px-2 py-1 focus:outline-none text-sm',
                searchBoxSubmit: 'hidden',
                searchBoxReset: 'px-2 text-gray-400 hover:text-gray-600 cursor-pointer',
                searchBoxResetIcon: 'w-3 h-3',
                list: 'space-y-1 max-h-32 overflow-y-auto',
                item: 'flex items-center justify-between text-sm text-gray-800 hover:bg-gray-50 p-1 rounded',
                checkbox: 'form-checkbox h-4 w-4 text-blue-600',
                label: 'flex items-center gap-2 cursor-pointer',
                labelText: 'flex-1',
                count: 'text-gray-500 text-xs ml-2',
              }}
            />
          </div>

          {/* Date Filters */}
          <CustomRangeInput attribute="start_date_ts" />
          
          {/* <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">End Date</h3>
            <EndDateNumericMenu attribute="end_date_ts" />
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default function Search() {
  const [showFilters, setShowFilters] = useState(false);
  const { hits } = useHits();
  const [selectedSlug, setSelectedSlug] = useState(null);

  const tableRef = useRef(null); // ref for table/Card
  const panelRef = useRef(null); // optional, ref for panel itself

  //   useEffect(() => {
  //   document.title = 'KAVI | Search';
  // }, []);


    const {refresh} = useInstantSearch();

  const refetchHits=()=>{
    refresh();
  }



  return (
    <>

    <div className="mx-auto p-2 lg:p-6 sm:px-6 lg:px-8 max-w-full sm:max-w-3xl md:max-w-5xl lg:max-w-7xl space-y-8 sm:space-y-8">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <SearchBox
          placeholder="Search Experts"
          classNames={{
            root: 'w-full md:max-w-xl',
            form: 'flex rounded-md border border-gray-300 shadow-sm bg-white',
            input: 'flex-grow px-4 py-2 focus:outline-none text-sm',
            submit: 'hidden',
            reset: 'hidden',
            loadingIndicator:'hidden',
          }}
        />

        <div className="flex items-center gap-3">
          <SortBy
            items={[
              { label: 'Latest', value: 'development_api::expert.expert' },
              { label: 'Name (A-Z)', value: 'experts_by_name' },
              { label: 'Original Quote (1-*)', value: 'experts_by_original_quote' },
              { label: 'Normal Status (A-Z)', value: 'experts_by_normal_status' },
              { label: 'Type (A-Z)', value: 'experts_by_type' },
            ]}
            defaultValue="development_api::expert.expert"
            classNames={{ select: 'border px-2 py-1 rounded text-sm' }}
          />

          <DropdownFilters open={showFilters} setOpen={setShowFilters} setSelectedSlug={setSelectedSlug}/>
        </div>
      </div>

      <Configure 
         hitsPerPage={20}
      />

      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <StatsHeader />
        </div>

        <Card hits={hits} onSelectSlug={setSelectedSlug} />

        <div className="mt-6 flex justify-center">
          <Pagination
            classNames={{
              root: 'flex items-center gap-2',
              list: 'flex gap-2',
              item: 'px-3 py-1 border border-gray-300 rounded hover:bg-gray-100',
              selectedItem: 'bg-blue-600 text-white',
              disabledItem: 'opacity-50 cursor-not-allowed',
            }}
          />
        </div>

        {selectedSlug && (
          <ExpertSidePanel
            slug={selectedSlug}
            hits={hits}
            onClose={() => setSelectedSlug(null)}
            onSelectSlug={setSelectedSlug}
            refetchHits={refetchHits}
          />
        )}
      </div>
    </div>
    </>
  );
}