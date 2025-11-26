

'use client';

import { useState, useEffect, useRef } from 'react';
import { SearchBox, SortBy, RefinementList, useRange, useNumericMenu, Configure, useHits, useStats, Index , Pagination, useInstantSearch, ClearRefinements, useClearRefinements} from 'react-instantsearch-hooks-web';
import Card from '../components/Card';
import ExpertSidePanel from '../components/ExpertSidePanel';
import Head from 'next/head';
import { useIndex } from '../components/Providers';
import { ChevronDown } from "lucide-react";

const ATTRIBUTE_OPTIONS = [
  { label: "All", value: null },
  { label: "Name", value: ["name"] },
  { label: "Designation", value: ["designation"] },
  { label: "Company", value: ["company"] },
  { label: "Target Company", value: ["target_company.name"] },
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
      <div className="text-sm font-semibold text-gray-700">Start Date Range</div>
      <div className="flex gap-2">
        <input type="date" value={sd} onChange={(e) => handleChange('min', e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm shadow-sm focus:ring-1 focus:ring-blue-400" />
        <input type="date" value={ed} onChange={(e) => handleChange('max', e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm shadow-sm focus:ring-1 focus:ring-blue-400" />
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
      <div className="text-sm font-semibold text-gray-700">End Date Range</div>
      <div className="flex gap-2">
        <input type="date" value={sd} onChange={(e) => handleChange('min', e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm shadow-sm focus:ring-1 focus:ring-blue-400" />
        <input type="date" value={ed} onChange={(e) => handleChange('max', e.target.value)} className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm shadow-sm focus:ring-1 focus:ring-blue-400" />
      </div>
    </div>
  );
}

function OriginalQuoteFilter({ attribute }) {
  const { start, range, refine } = useRange({ attribute });
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  const handleChange = (type, value) => {
    if (type === 'min') setMin(value);
    else setMax(value);

    // convert input to number, fallback to undefined
    const newMin = type === 'min' ? Number(value) : start[0] ?? 0;
    const newMax = type === 'max' ? Number(value) : start[1] ?? undefined;

    // refine range
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
    <div className="space-y-1 w-full"> {/* match max width like EndDateFilter */}
      <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
        <span>Original Quote Range</span>
        <button onClick={handleReset} className="text-xs text-blue-600 hover:underline">
          Reset
        </button>
      </div>
      <div className="flex gap-2 w-full">
        <input
          type="number"
          value={min}
          onChange={(e) => handleChange('min', e.target.value)}
          placeholder={range.min}
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm shadow-sm focus:ring-1 focus:ring-blue-400 max-w-[150px]"
        />
        <input
          type="number"
          value={max}
          onChange={(e) => handleChange('max', e.target.value)}
          placeholder={range.max}
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm shadow-sm focus:ring-1 focus:ring-blue-400 max-w-[150px]"
        />
      </div>
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
        className={`absolute right-0 mt-2 lg:w-90 sm:w-60 md:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4
          transition-transform duration-200 origin-top ${
            open ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
          }`}
          
      >
        <div className="flex flex-col gap-6 text-sm max-h-[400px] overflow-y-auto">
          
            <h3 className="text-gray-700 font-semibold text-base border-b border-gray-200 pb-1">Type</h3>
            <RefinementList
              attribute="type"
              classNames={{
                root: '',
                list: 'space-y-1 max-h-32 overflow-y-auto',
                item: 'flex items-center justify-between text-sm text-gray-800 hover:bg-gray-50 p-1 rounded',
                checkbox: 'form-checkbox h-4 w-4 text-blue-600',
                label: 'flex items-center gap-2 cursor-pointer',
                count: 'text-gray-500 text-xs',
              }}
            />

            <h3 className="text-gray-700 font-semibold text-base border-b border-gray-200 pb-1">Expert Status</h3>
            <RefinementList
              attribute="expert_status"
              searchable={true}
              searchablePlaceholder="Search status..."
              limit={10}
              classNames={{
                root: 'w-full',
                searchBox: 'mb-2',
                searchBoxForm: 'flex rounded-md overflow-hidden border border-gray-300 shadow-sm',
                searchBoxInput: 'flex-grow px-2 py-1 focus:outline-none text-sm',
                searchBoxSubmit: 'hidden',
                searchBoxReset: 'px-2 text-gray-400 hover:text-gray-600 cursor-pointer',
                searchBoxResetIcon: 'w-3 h-3',
                list: 'space-y-1 max-h-48 overflow-y-auto',
                item: 'flex items-center justify-between text-sm text-gray-800 hover:bg-gray-50 p-1 rounded',
                checkbox: 'form-checkbox h-4 w-4 text-blue-600',
                label: 'flex items-center gap-2 cursor-pointer',
                labelText: 'flex-1',
                count: 'text-gray-500 text-xs ml-2',
              }}
            />
          
          

          {/* Target Company Filter - With proper search configuration */}
         
            <h3 className="text-gray-700 font-semibold text-base border-b border-gray-200 pb-1">Industry</h3>
            <RefinementList
              attribute="sub_industry.name"
              searchable={true}
              searchablePlaceholder="Search industry..."
              limit={10}
              classNames={{
                root: 'w-full',
                searchBox: 'mb-2',
                searchBoxForm: 'flex rounded-md overflow-hidden border border-gray-300 shadow-sm',
                searchBoxInput: 'flex-grow px-2 py-1 focus:outline-none text-sm',
                searchBoxSubmit: 'hidden',
                searchBoxReset: 'px-2 text-gray-400 hover:text-gray-600 cursor-pointer',
                searchBoxResetIcon: 'w-3 h-3',
                list: 'space-y-1 max-h-48 overflow-y-auto',
                item: 'flex items-center justify-between text-sm text-gray-800 hover:bg-gray-50 p-1 rounded',
                checkbox: 'form-checkbox h-4 w-4 text-blue-600',
                label: 'flex items-center gap-2 cursor-pointer',
                labelText: 'flex-1',
                count: 'text-gray-500 text-xs ml-2',
              }}
            />
         

          {/* Company Filter - With proper search configuration */}
        
            <h3 className="text-gray-700 font-semibold text-base border-b border-gray-200 pb-1">Company</h3>
            <RefinementList
              attribute="company"
              searchable={true}
              searchablePlaceholder="Search companies..."
              limit={10}
              classNames={{
                root: 'w-full',
                searchBox: 'mb-2',
                searchBoxForm: 'flex rounded-md overflow-hidden border border-gray-300 shadow-sm',
                searchBoxInput: 'flex-grow px-2 py-1 focus:outline-none text-sm',
                searchBoxSubmit: 'hidden',
                searchBoxReset: 'px-2 text-gray-400 hover:text-gray-600 cursor-pointer',
                searchBoxResetIcon: 'w-3 h-3',
                list: 'space-y-1 max-h-48 overflow-y-auto',
                item: 'flex items-center justify-between text-sm text-gray-800 hover:bg-gray-50 p-1 rounded',
                checkbox: 'form-checkbox h-4 w-4 text-blue-600',
                label: 'flex items-center gap-2 cursor-pointer',
                labelText: 'flex-1',
                count: 'text-gray-500 text-xs ml-2',
              }}
            />
          

           {/* Target Company Filter - With proper search configuration */}
          
            <h3 className="text-gray-700 font-semibold text-base border-b border-gray-200 pb-1">Topic</h3>
            <RefinementList
              attribute="target_company.name"
              searchable={true}
              searchablePlaceholder="Search topic..."
              limit={10}
              classNames={{
                root: 'w-full',
                searchBox: 'mb-2',
                searchBoxForm: 'flex rounded-md overflow-hidden border border-gray-300 shadow-sm',
                searchBoxInput: 'flex-grow px-2 py-1 focus:outline-none text-sm',
                searchBoxSubmit: 'hidden',
                searchBoxReset: 'px-2 text-gray-400 hover:text-gray-600 cursor-pointer',
                searchBoxResetIcon: 'w-3 h-3',
                list: 'space-y-1 max-h-48 overflow-y-auto',
                item: 'flex items-center justify-between text-sm text-gray-800 hover:bg-gray-50 p-1 rounded',
                checkbox: 'form-checkbox h-4 w-4 text-blue-600',
                label: 'flex items-center gap-2 cursor-pointer',
                labelText: 'flex-1',
                count: 'text-gray-500 text-xs ml-2',
              }}
            />

            
          
            <h3 className="text-gray-700 font-semibold text-base border-b border-gray-200 pb-1">Tags</h3>
            <RefinementList
              attribute="tags"
              searchable={true}
              searchablePlaceholder="Search tags..."
              limit={10}
              classNames={{
                root: 'w-full',
                searchBox: 'mb-2',
                searchBoxForm: 'flex rounded-md overflow-hidden border border-gray-300 shadow-sm',
                searchBoxInput: 'flex-grow px-2 py-1 focus:outline-none text-sm',
                searchBoxSubmit: 'hidden',
                searchBoxReset: 'px-2 text-gray-400 hover:text-gray-600 cursor-pointer',
                searchBoxResetIcon: 'w-3 h-3',
                list: 'space-y-1 max-h-48 overflow-y-auto',
                item: 'flex items-center justify-between text-sm text-gray-800 hover:bg-gray-50 p-1 rounded',
                checkbox: 'form-checkbox h-4 w-4 text-blue-600',
                label: 'flex items-center gap-2 cursor-pointer',
                labelText: 'flex-1',
                count: 'text-gray-500 text-xs ml-2',
              }}
            />
          



          {/* File Filter - With proper search configuration */}
         
            <h3 className="text-gray-700 font-semibold text-base border-b border-gray-200 pb-1">File</h3>
            <RefinementList
              attribute="upload_file_details"
              searchable={true}
              searchablePlaceholder="Search files..."
              limit={10}
              classNames={{
                root: 'w-full',
                searchBox: 'mb-2',
                searchBoxForm: 'flex rounded-md overflow-hidden border border-gray-300 shadow-sm',
                searchBoxInput: 'flex-grow px-2 py-1 focus:outline-none text-sm',
                searchBoxSubmit: 'hidden',
                searchBoxReset: 'px-2 text-gray-400 hover:text-gray-600 cursor-pointer',
                searchBoxResetIcon: 'w-3 h-3',
                list: 'space-y-1 max-h-48 overflow-y-auto',
                item: 'flex items-center justify-between text-sm text-gray-800 hover:bg-gray-50 p-1 rounded',
                checkbox: 'form-checkbox h-4 w-4 text-blue-600',
                label: 'flex items-center gap-2 cursor-pointer',
                labelText: 'flex-1',
                count: 'text-gray-500 text-xs ml-2',
              }}
            />
         

          {/* Date Filters */}
          <CustomRangeInput attribute="start_date_ts" />

          <EndDateFilter attribute="end_date_ts" />

          <OriginalQuoteFilter attribute="original_quote" />

          


          
          {/* <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">End Date</h3>
            <EndDateNumericMenu attribute="end_date_ts" />
          </div> */}
        </div>
    </div>
    </div>
    
  );
}



// function IndexSwitcher({ switchIndex }) {
//   const [open, setOpen] = useState(false);
//   const { indexName } = useIndex(); // get current index from context
  
//   const dropdownRef = useRef();
//   const { instantSearchInstance } = useInstantSearch();

//   const options = [
//     { label: "Full", value: "development_api::expert.expert" },
//     { label: "Screening", value: "expert_screening" },
//   ];

//     // derive label from current index
//   const selectedLabel = options.find(opt => opt.value === indexName)?.label || "Full Search";

//   const handleSelect = (option) => {
//     switchIndex(option.value);
//     setOpen(false);
//   };

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <button
//         onClick={() => setOpen(!open)}
//         className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
//       >
//         {selectedLabel}
//         <ChevronDown
//           className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
//         />
//       </button>

//       {open && (
//         <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-20">
//           {options.map((opt) => (
//             <button
//               key={opt.value}
//               onClick={() => handleSelect(opt)}
//               className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
//                 selectedLabel === opt.label ? "bg-gray-50 font-semibold" : ""
//               }`}
//             >
//               {opt.label}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }






export default function Search() {
  const [showFilters, setShowFilters] = useState(false);
  const { hits } = useHits();
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [searchAttributes, setSearchAttributes] = useState(null); 

  const { refine: clearAllRefinements } = useClearRefinements();


  //const { switchIndex } = useIndex();

  const tableRef = useRef(null); // ref for table/Card
  const panelRef = useRef(null); // optional, ref for panel itself

  //   useEffect(() => {
  //   document.title = 'KAVI | Search';
  // }, []);

    const { refresh, instantSearchInstance} = useInstantSearch();

    function refreshHits(){
      console.log('refresh');
      setTimeout(() => {
        refresh();
      }, 1000); // 200ms delay, adjust as needed

      console.log(hits);
    }



  return (
    <>

    <div className="mx-auto p-2 lg:p-6 sm:px-6 lg:px-8 w-full max-w-[95vw] space-y-8">

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

        <select
        className="border px-2 py-1 rounded"
        onChange={(e) => {
          const selected = ATTRIBUTE_OPTIONS.find(opt => opt.label === e.target.value);
          setSearchAttributes(selected?.value ?? null);
        }}
      >
        {ATTRIBUTE_OPTIONS.map(opt => (
          <option key={opt.label} value={opt.label}>
            {opt.label}
          </option>
        ))}
      </select>

        

        <div className="flex flex-row items-center gap-3 ml-auto">

          {/* <IndexSwitcher switchIndex={switchIndex} /> */}

          <SortBy
            items={[
              { label: 'Latest', value: 'development_api::expert.expert' },
              { label: 'Name (A-Z)', value: 'experts_by_name' },
              { label: 'Original Quote (1-*)', value: 'experts_by_original_quote' },
              { label: 'Normal Status (A-Z)', value: 'experts_by_normal_status' },
              { label: 'Type (A-Z)', value: 'experts_by_type' },
              { label: 'End Date(*-0)', value: 'expert_by_enddate' },
            ]}
            defaultValue="development_api::expert.expert"
            classNames={{ select: 'border px-2 py-1 rounded text-sm' }}
          />

          <DropdownFilters open={showFilters} setOpen={setShowFilters} setSelectedSlug={setSelectedSlug}/>

          <div className="flex gap-2">

            <button
            onClick={() => clearAllRefinements()}
            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium cursor-pointer"
          >
            Clear All Filters
          </button>
          </div>
        </div>
      </div>

      <Configure 
         hitsPerPage={20}
         {...(searchAttributes ? { restrictSearchableAttributes: searchAttributes } : {})}
      />

      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <StatsHeader />
        </div>

        <Card hits={hits} onSelectSlug={setSelectedSlug}   refreshHits={refreshHits}/>

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
            refreshHits={refreshHits}
            
          />
        )}
      </div>
    </div>
    </>
  );
}