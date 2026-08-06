
'use client';

import { useSearchParams } from 'next/navigation';
import { use, useState, useRef, useEffect } from 'react';

import {
  SearchBox,
  SortBy,
  RefinementList,
  useRange,
  Configure,
  useHits,
  useStats,
  useInstantSearch,
  useClearRefinements,
  ToggleRefinement,
} from 'react-instantsearch-hooks-web';

import Card from '../../components/Card';
import ExpertSidePanel from '../../components/ExpertSidePanel';


const ATTRIBUTE_OPTIONS = [
  { label: "All", value: null },
  { label: "Name", value: ["name"] },
  { label: "Designation", value: ["designation"] },
  { label: "Company", value: ["company"] },
  { label: "Topic", value: ["target_company.name"] },
  { label: "Notes", value: ["notes"] },
  { label: "Screening", value: ["screening"] },
  { label: "Email", value: ["email"] },
  { label: "Phone", value: ["phone"] },
];


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

    return isNaN(date.getTime())
      ? undefined
      : Math.floor(date.getTime() / 1000);
  };

  const handleChange = (type, value) => {
    if (type === 'min') {
      setSd(value);
    } else {
      setEd(value);
    }

    const newStart =
      type === 'min'
        ? dateToUnix(value)
        : start[0] ?? range.min;

    const newEnd =
      type === 'max'
        ? dateToUnix(value)
        : start[1] ?? range.max;

    refine([
      Number.isFinite(newStart) ? newStart : undefined,
      Number.isFinite(newEnd) ? newEnd : undefined,
    ]);
  };

  return (
    <div className="space-y-1">
      <div className="text-sm font-semibold text-gray-700">
        Start Date Range
      </div>

      <div className="flex gap-2">
        <input
          type="date"
          value={sd}
          onChange={(e) => handleChange('min', e.target.value)}
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm shadow-sm"
        />

        <input
          type="date"
          value={ed}
          onChange={(e) => handleChange('max', e.target.value)}
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm shadow-sm"
        />
      </div>
    </div>
  );
}


function EndDateFilter({ attribute }) {
  const { start, range, refine } = useRange({ attribute });

  const [sd, setSd] = useState('');
  const [ed, setEd] = useState('');

  const dateToUnix = (dateStr) => {
    if (!dateStr) return undefined;

    const date = new Date(dateStr);

    return isNaN(date.getTime())
      ? undefined
      : Math.floor(date.getTime() / 1000);
  };

  const handleChange = (type, value) => {
    if (type === 'min') {
      setSd(value);
    } else {
      setEd(value);
    }

    const newStart =
      type === 'min'
        ? dateToUnix(value)
        : start[0] ?? range.min;

    const newEnd =
      type === 'max'
        ? dateToUnix(value)
        : start[1] ?? range.max;

    refine([
      Number.isFinite(newStart) ? newStart : undefined,
      Number.isFinite(newEnd) ? newEnd : undefined,
    ]);
  };

  return (
    <div className="space-y-1">
      <div className="text-sm font-semibold text-gray-700">
        End Date Range
      </div>

      <div className="flex gap-2">
        <input
          type="date"
          value={sd}
          onChange={(e) => handleChange('min', e.target.value)}
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm shadow-sm"
        />

        <input
          type="date"
          value={ed}
          onChange={(e) => handleChange('max', e.target.value)}
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm shadow-sm"
        />
      </div>
    </div>
  );
}


function OriginalQuoteFilter({ attribute }) {
  const { start, range, refine } = useRange({ attribute });

  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  const handleChange = (type, value) => {
    if (type === 'min') {
      setMin(value);
    } else {
      setMax(value);
    }

    const newMin =
      type === 'min'
        ? Number(value)
        : start[0] ?? 0;

    const newMax =
      type === 'max'
        ? Number(value)
        : start[1] ?? undefined;

    refine([
      Number.isFinite(newMin) ? newMin : 0,
      Number.isFinite(newMax) ? newMax : undefined,
    ]);
  };

  const handleReset = () => {
    setMin('');
    setMax('');
    refine([0, undefined]);
  };

  return (
    <div className="space-y-1 w-full">

      <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
        <span>Original Quote Range</span>

        <button
          onClick={handleReset}
          className="text-xs text-blue-600 hover:underline"
        >
          Reset
        </button>
      </div>

      <div className="flex gap-2 w-full">

        <input
          type="number"
          value={min}
          onChange={(e) => handleChange('min', e.target.value)}
          placeholder={range.min}
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm shadow-sm"
        />

        <input
          type="number"
          value={max}
          onChange={(e) => handleChange('max', e.target.value)}
          placeholder={range.max}
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm shadow-sm"
        />

      </div>
    </div>
  );
}


function DropdownFilters({ open, setOpen }) {

  const containerRef = useRef(null);

  useEffect(() => {

    const handleClickOutside = (e) => {

      if (
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }

    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };

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
        className={`absolute right-0 mt-2 lg:w-90 sm:w-60 md:w-80
          bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4
          transition-transform duration-200 origin-top
          ${
            open
              ? 'scale-100 opacity-100'
              : 'scale-95 opacity-0 pointer-events-none'
          }`}
      >

        <div className="flex flex-col gap-6 text-sm max-h-[400px] overflow-y-auto">


          {/* Has Phone */}

          <ToggleRefinement
            attribute="has_phone"
            label="Has Phone"
            on={true}
            classNames={{
              checkbox: 'form-checkbox h-4 w-4 text-blue-600',
              item: 'flex items-center justify-between text-sm text-gray-800',
              label: 'flex items-center gap-2 cursor-pointer',
              count: 'text-gray-500 text-xs',
            }}
          />


          {/* Type */}

          <h3 className="text-gray-700 font-semibold text-base border-b pb-1">
            Type
          </h3>

          <RefinementList
            attribute="type"
            classNames={{
              list: 'space-y-1 max-h-32 overflow-y-auto',
              item: 'flex items-center justify-between text-sm text-gray-800 hover:bg-gray-50 p-1 rounded',
              checkbox: 'form-checkbox h-4 w-4 text-blue-600',
              label: 'flex items-center gap-2 cursor-pointer',
              count: 'text-gray-500 text-xs',
            }}
          />


          {/* Expert Status */}

          <h3 className="text-gray-700 font-semibold text-base border-b pb-1">
            Expert Status
          </h3>

          <RefinementList
            attribute="expert_status"
            searchable
            searchablePlaceholder="Search status..."
            limit={10}
            classNames={{
              root: 'w-full',
              searchBox: 'mb-2',
              searchBoxForm: 'flex rounded-md overflow-hidden border border-gray-300 shadow-sm',
              searchBoxInput: 'flex-grow px-2 py-1 focus:outline-none text-sm',
              searchBoxSubmit: 'hidden',
              searchBoxReset: 'px-2 text-gray-400',
              list: 'space-y-1 max-h-48 overflow-y-auto',
              item: 'flex items-center justify-between text-sm text-gray-800 hover:bg-gray-50 p-1 rounded',
              checkbox: 'form-checkbox h-4 w-4 text-blue-600',
              label: 'flex items-center gap-2 cursor-pointer',
              count: 'text-gray-500 text-xs ml-2',
            }}
          />


          {/* Industry */}

          <h3 className="text-gray-700 font-semibold text-base border-b pb-1">
            Industry
          </h3>

          <RefinementList
            attribute="sub_industry.name"
            searchable
            searchablePlaceholder="Search industry..."
            limit={10}
            classNames={{
              root: 'w-full',
              searchBox: 'mb-2',
              searchBoxForm: 'flex rounded-md overflow-hidden border border-gray-300 shadow-sm',
              searchBoxInput: 'flex-grow px-2 py-1 focus:outline-none text-sm',
              searchBoxSubmit: 'hidden',
              searchBoxReset: 'px-2 text-gray-400',
              list: 'space-y-1 max-h-48 overflow-y-auto',
              item: 'flex items-center justify-between text-sm text-gray-800 hover:bg-gray-50 p-1 rounded',
              checkbox: 'form-checkbox h-4 w-4 text-blue-600',
              label: 'flex items-center gap-2 cursor-pointer',
              count: 'text-gray-500 text-xs ml-2',
            }}
          />


          {/* Company */}

          <h3 className="text-gray-700 font-semibold text-base border-b pb-1">
            Company
          </h3>

          <RefinementList
            attribute="company"
            searchable
            searchablePlaceholder="Search companies..."
            limit={10}
            classNames={{
              root: 'w-full',
              searchBox: 'mb-2',
              searchBoxForm: 'flex rounded-md overflow-hidden border border-gray-300 shadow-sm',
              searchBoxInput: 'flex-grow px-2 py-1 focus:outline-none text-sm',
              searchBoxSubmit: 'hidden',
              searchBoxReset: 'px-2 text-gray-400',
              list: 'space-y-1 max-h-48 overflow-y-auto',
              item: 'flex items-center justify-between text-sm text-gray-800 hover:bg-gray-50 p-1 rounded',
              checkbox: 'form-checkbox h-4 w-4 text-blue-600',
              label: 'flex items-center gap-2 cursor-pointer',
              count: 'text-gray-500 text-xs',
            }}
          />


          {/* Topic */}

          <h3 className="text-gray-700 font-semibold text-base border-b pb-1">
            Topic
          </h3>

          <RefinementList
            attribute="target_company.name"
            searchable
            searchablePlaceholder="Search topic..."
            limit={10}
            classNames={{
              root: 'w-full',
              searchBox: 'mb-2',
              searchBoxForm: 'flex rounded-md overflow-hidden border border-gray-300 shadow-sm',
              searchBoxInput: 'flex-grow px-2 py-1 focus:outline-none text-sm',
              searchBoxSubmit: 'hidden',
              searchBoxReset: 'px-2 text-gray-400',
              list: 'space-y-1 max-h-48 overflow-y-auto',
              item: 'flex items-center justify-between text-sm text-gray-800 hover:bg-gray-50 p-1 rounded',
              checkbox: 'form-checkbox h-4 w-4 text-blue-600',
              label: 'flex items-center gap-2 cursor-pointer',
              count: 'text-gray-500 text-xs',
            }}
          />


          {/* Tags */}

          <h3 className="text-gray-700 font-semibold text-base border-b pb-1">
            Tags
          </h3>

          <RefinementList
            attribute="tags"
            searchable
            searchablePlaceholder="Search tags..."
            limit={10}
            classNames={{
              root: 'w-full',
              searchBox: 'mb-2',
              searchBoxForm: 'flex rounded-md overflow-hidden border border-gray-300 shadow-sm',
              searchBoxInput: 'flex-grow px-2 py-1 focus:outline-none text-sm',
              searchBoxSubmit: 'hidden',
              searchBoxReset: 'px-2 text-gray-400',
              list: 'space-y-1 max-h-48 overflow-y-auto',
              item: 'flex items-center justify-between text-sm text-gray-800 hover:bg-gray-50 p-1 rounded',
              checkbox: 'form-checkbox h-4 w-4 text-blue-600',
              label: 'flex items-center gap-2 cursor-pointer',
              count: 'text-gray-500 text-xs',
            }}
          />


          {/* Date */}

          <CustomRangeInput attribute="start_date_ts" />

          <EndDateFilter attribute="end_date_ts" />

          <OriginalQuoteFilter attribute="original_quote" />

        </div>

      </div>

    </div>
  );
}


export default function UploadFileDetailsPage({params}) {

  const searchParams = useSearchParams();

 
  const { slug } = use(params);

  const selectedFile = slug;
    

  const [showFilters, setShowFilters] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [searchAttributes, setSearchAttributes] = useState(null);

  const { hits } = useHits();

  const { refine: clearAllRefinements } =
    useClearRefinements();

  const { refresh } = useInstantSearch();


  const refreshHits = () => {

    setTimeout(() => {
      refresh();
    }, 500);

  };


  const handleClearFilters = () => {

    clearAllRefinements();

  };


  return (

    <div className="mx-auto p-2 lg:p-6 sm:px-6 lg:px-8 w-full max-w-[95vw] space-y-8">


      {/* FILE HEADER */}

      <div className="bg-white border border-gray-200 rounded-lg p-4">

        <div className="text-sm text-gray-500">
          Selected Sheet
        </div>

        <div className="text-lg font-semibold text-gray-800 break-all">
          {selectedFile || 'No file selected'}
        </div>

      </div>


      {/* TOP BAR */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">


        {/* SEARCH */}

        <SearchBox
          placeholder="Search Experts"
          classNames={{
            root: 'w-full md:max-w-xl',
            form: 'flex rounded-md border border-gray-300 shadow-sm bg-white',
            input: 'flex-grow px-4 py-2 focus:outline-none text-sm',
            submit: 'hidden',
            reset: 'hidden',
            loadingIndicator: 'hidden',
          }}
        />


        {/* SEARCH ATTRIBUTE */}

        <select
          className="border px-2 py-1 rounded"
          onChange={(e) => {

            const selected =
              ATTRIBUTE_OPTIONS.find(
                opt => opt.label === e.target.value
              );

            setSearchAttributes(
              selected?.value ?? null
            );

          }}
        >

          {ATTRIBUTE_OPTIONS.map(opt => (

            <option
              key={opt.label}
              value={opt.label}
            >
              {opt.label}
            </option>

          ))}

        </select>


        {/* ACTIONS */}

        <div className="flex flex-row items-center gap-3 ml-auto">

          <SortBy
            items={[
              {
                label: 'Latest',
                value: 'development_api::expert.expert',
              },
              {
                label: 'Original Quote (1-*)',
                value: 'experts_by_original_quote',
              },
              {
                label: 'End Date (*-0)',
                value: 'expert_by_enddate',
              },
            ]}
            defaultValue="development_api::expert.expert"
            classNames={{
              select: 'border px-2 py-1 rounded text-sm',
            }}
          />


          <DropdownFilters
            open={showFilters}
            setOpen={setShowFilters}
          />


          <button
            onClick={handleClearFilters}
            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium"
          >
            Clear Filters
          </button>

        </div>

      </div>


      {/* IMPORTANT:
          This forces the page to always remain
          inside the selected upload file.
      */}

     <Configure
  hitsPerPage={1000}
  filters={
    selectedFile
      ? `upload_file_details:"${selectedFile}"`
      : undefined
  }
  {...(searchAttributes
    ? { restrictSearchableAttributes: searchAttributes }
    : {}
  )}
/>


      {/* RESULTS */}

      <div className="flex-1">

        <div className="flex justify-between items-center mb-4">

          <StatsHeader />

        </div>


        <Card
          hits={hits}
          onSelectSlug={setSelectedSlug}
          refreshHits={refreshHits}
        />


        {/* NO PAGINATION */}


        {selectedSlug && (

          <ExpertSidePanel
            slug={selectedSlug}
            hits={hits}
            onClose={() => setSelectedSlug(null)}
            onSelectSlug={setSelectedSlug}
            refreshHits={refreshHits}
          />

        )}

      </div>

    </div>
  );
}

