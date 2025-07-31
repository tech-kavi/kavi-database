'use client'

import { useState } from 'react'
import axios from 'axios'
import { useEffect } from 'react'

import dynamic from 'next/dynamic'

const CreatableSelect = dynamic(() => import('react-select/creatable'), { ssr: false })



export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyTags, setCompanyTags] = useState('')
  const [companyStatus, setCompanyStatus] = useState('')
  const [allCompanies, setAllCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState(null)


  useEffect(() => {
  fetchCompanies()
  }, [])

const fetchCompanies = async () => {
  try {
    const res = await axios.get('http://localhost:1337/api/companies',{
      headers:{
          Authorization: `Bearer ${localStorage.getItem('token')}`,
      }
       
    })
    console.log(res);
    const options = res.data.data.map((company) => ({
      label: company.name,
      value: company.id,
    }))
    setAllCompanies(options)
  } catch (err) {
    console.error('Error fetching companies:', err)
  }
}


  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null)
  }

  const handleUpload = async () => {
    if (!file) {
      setStatus('Please select a file')
      return
    }

    const formData = new FormData()
    formData.append('files', file)

    try {
      const res = await axios.post('http://localhost:1337/api/upload-experts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setStatus(res.data.message || 'Upload successful')
    } catch (error) {
      console.error(error)
      setStatus('Upload failed')
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
    const res = await axios.post('http://localhost:1337/api/companies', {
      headers:{
          Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      
      data: {
        name: selectedCompany.label,
        tags: companyTags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      },
    })

    setCompanyStatus('✅ Company created successfully')
    setCompanyName('')
    setCompanyTags('')
    setSelectedCompany(null)
    fetchCompanies() // refresh the list
  } catch (error) {
    console.error(error)
    setCompanyStatus('❌ Failed to create company')
  }
}



  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">UPLOAD</h1>

      {/* Upload Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">📤 Upload Excel File</h2>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="mb-4 block w-full border border-gray-300 rounded px-3 py-2"
        />
        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload
        </button>
        {status && <p className="mt-3 text-sm text-gray-700">{status}</p>}
      </div>

      {/* Create Company Section */}
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-green-600">🏢 Create New Company</h2>
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
            <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
            <input
              type="text"
              value={companyTags}
              onChange={(e) => setCompanyTags(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g. fintech, ai, startup"
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create Company
          </button>
        </form>

        {companyStatus && <p className="mt-3 text-sm text-gray-700">{companyStatus}</p>}
      </div>
    </div>
  )
}
