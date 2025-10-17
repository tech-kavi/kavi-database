'use client'

import { useState } from 'react'
import axios from 'axios'
import { useEffect, useRef } from 'react'
import { useAuth } from "../components/AuthProvider"
import dynamic from 'next/dynamic'

const CreatableSelect = dynamic(() => import('react-select/creatable'), { ssr: false })



export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [finaltracker,setFinalTracker]=useState(null)
  const [status, setStatus] = useState('');
  const [finalTrackerStatus, setFinalTrackerStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const [companyName, setCompanyName] = useState('')
  const [companyTags, setCompanyTags] = useState('')
  const [companyStatus, setCompanyStatus] = useState('')
  const [subindStatus, setsubindStatus] = useState('')
  const [topic, setTopic] = useState('')
  const [allCompanies, setAllCompanies] = useState([])
  const [allIndustries, setAllIndstries] = useState([])
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [selectedIndustry, setSelectedIndustry] = useState(null)

  const fileInputRef = useRef(null);
  const finalTrackerRef = useRef(null);

  const { user, loading } = useAuth();

  

  useEffect(() => {
  fetchCompanies()
  fetchIndustries()
  }, [])


  // useEffect(() => {
  //         document.title = `KAVI | Upload`;
  //   }, []);

const fetchCompanies = async () => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/companies`,{
      headers:{
          Authorization: `Bearer ${localStorage.getItem('token')}`,
      }
       
    })
    console.log(res);
    const options = res.data.data.map((company) => ({
      label: company.name,
      value: company.comp_slug,
    }))
    setAllCompanies(options)
  } catch (err) {
    console.error('Error fetching companies:', err)
  }
}

const fetchIndustries = async () => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sub-industries`,{
      headers:{
          Authorization: `Bearer ${localStorage.getItem('token')}`,
      }
       
    })
    console.log(res);
    const options = res.data.data.map((industry) => ({
      label: industry.name,
      value: industry.ind_slug,
    }))
    setAllIndstries(options)
  } catch (err) {
    console.error('Error fetching industries:', err)
  }
}


  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null)
  }

  const handleFinalTracker = (e) => {
    setFinalTracker(e.target.files?.[0] || null)
  }

  const handleFinalTrackerUpload = async () => {
    if (!finaltracker) {
      setFinalTrackerStatus('Please select a file.');
      return
    }


    const formData = new FormData()
    formData.append('files', finaltracker)

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload-projects`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization:`Bearer ${localStorage.getItem("token")}`,
        },
      })
      setFinalTrackerStatus(res.data.message || 'Upload successful');
      setFinalTracker(null);

      if (finalTrackerRef.current) finalTrackerRef.current.value = ""; // clear input
    } catch (error) {
      console.error(error);
      setFinalTracker(null);
      setFinalTrackerStatus('Upload failed');
      if (finalTrackerRef.current) finalTrackerRef.current.value = ""; // clear input
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setStatus('Please select a file.');
      setStatusType('error');
      return
    }

    if (!topic.trim()) {
    setStatus('Please enter a topic.')
    setStatusType('error');
    return
  }

    const formData = new FormData()
    formData.append('files', file)
    formData.append('topic',topic)

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload-experts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization:`Bearer ${localStorage.getItem("token")}`,
        },
      })
      setStatus(res.data.message || 'Upload successful');
      setStatusType('success');
      setTopic('');
      setFile(null);

      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (error) {
        console.log(error.response?.data || error.message);
        setFile(null);

      // Only pick the message string
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'Upload failed';

      setStatus(errorMessage);
      setStatusType('error');

        if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const handleCompanySubmit = async (e) => {
    e.preventDefault()

    if (!selectedCompany || !selectedCompany.label) {
      setCompanyStatus('Please select or create a company')
      return
    }

    const companyExists = allCompanies.some(
      (comp) => comp.label.toLowerCase() === selectedCompany.label.toLowerCase()
    )

    if (companyExists) {
      setCompanyStatus('✅ Company already exists and selected')
      return
    }

  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/companies`,
      {
        data: {
          name: selectedCompany.label,
          tags: companyTags,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    setCompanyStatus('✅ Company created successfully')
    setCompanyName('')
    setCompanyTags('')
    setTopic('')
    setSelectedCompany(null)
    console.log(res);
    const createdCompany = {
      value: res.data.comp_slug,        
      label: res.data.name,
    };
    setAllCompanies((prev) => [...prev, createdCompany]);

    fetchCompanies() // refresh the list
  } catch (error) {
    console.error(error)
    setCompanyStatus('❌ Failed to create company')
  }
}


 const handleIndustrySubmit = async (e) => {
    e.preventDefault()

    if (!selectedIndustry || !selectedIndustry.label) {
      setsubindStatus('Please select or create a industry')
      return
    }

    const industryExists = allIndustries.some(
      (comp) => comp.label.toLowerCase() === selectedIndustry.label.toLowerCase()
    )

    if (industryExists) {
      setsubindStatus('✅ Industry already exists and selected')
      return
    }

  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sub-industries`,
      {
        data: {
          name: selectedIndustry.label,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    setsubindStatus('✅ Industry created successfully')
    setSelectedIndustry(null)
    console.log(res);
    const createdIndustry = {
      value: res.data.ind_slug,        
      label: res.data.name,
    };
    setAllIndstries((prev) => [...prev, createdIndustry]);

    fetchIndustries() // refresh the list
  } catch (error) {
    console.error(error)
    setsubindStatus('❌ Failed to create industry')
  }
}



  return (
    <div className="mx-auto p-2 lg:p-6 sm:px-6 lg:px-8 w-full max-w-[95vw] space-y-8">
      {/* <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text text-center mb-6">
        Upload
      </h1> */}

      {/* Upload Section */}
      <section className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition">
        <h2 className="text-2xl font-semibold mb-4 ">Upload Excel File</h2>

        <div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Topic"
              required
            />
          </div>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={handleUpload}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition"
        >
          Upload
        </button>
         {status && (
          <p
            className={`mt-3 text-sm ${
              statusType === 'error' ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {status}
          </p>
        )}
        
      </section>

      {/* Upload Final Tracker Section */}
      <section className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition">
        <h2 className="text-2xl font-semibold mb-4 ">Upload Final Tracker File</h2>


        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFinalTracker}
          ref={finalTrackerRef}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={handleFinalTrackerUpload}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition"
        >
          Upload
        </button>
       {finalTrackerStatus && (
          <p
            className={`mt-3 text-sm text-gray-500`}
          >
            {finalTrackerStatus}
          </p>
        )}
      </section>

      {/* Create Company Section */}

      {user?.role?.type == "admin" && (
      <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition">
        <h2 className="text-2xl font-semibold mb-4 ">Create New Company</h2>
        <form onSubmit={handleCompanySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Company (select or create)
            </label>
            <CreatableSelect
                isClearable
                onChange={(option) => setSelectedCompany(option)}
                options={allCompanies}
                value={selectedCompany}
                placeholder="Type to search or add new..."
                />
            </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={companyTags}
              onChange={(e) => setCompanyTags(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="e.g. fintech, ai, startup"
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            Create Company
          </button>

          {companyStatus && <p className="mt-3 text-sm text-gray-700">{companyStatus}</p>}
        </form>

        

        </section>

        {/* Create SubIndustry Section */}
      <section className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition">
        <h2 className="text-2xl font-semibold mb-4 ">Create New Industry</h2>
        <form onSubmit={handleIndustrySubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry (select or create)
            </label>
            <CreatableSelect
                isClearable
                onChange={(option) => setSelectedIndustry(option)}
                options={allIndustries}
                value={selectedIndustry}
                placeholder="Type to search or add new..."
                />
            </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            Create Industry
          </button>

          {subindStatus && <p className="mt-3 text-sm text-gray-700">{subindStatus}</p>}
        </form>

        
      </section>

      </div>


      
      </>
      )}

      
    </div>
  )
}
