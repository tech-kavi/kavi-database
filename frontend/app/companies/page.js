'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link';
import Head from 'next/head';


export default function Companies() {
  const router = useRouter()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [meta, setMeta] = useState({ total: 0, pageCount: 1 })

 
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

   

    const fetchCompanies = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/companies-data?search=${search}&page=${page}&pageSize=${pageSize}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setCompanies(res.data.data)
        setMeta(res.data.meta);
      } catch (err) {
        console.error('Error fetching companies:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [router,search,page])

   useEffect(() => {
    document.title = 'KAVI | Companies';
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
    </div>
  );

  return (
    <>
      
    <div className="mx-auto p-2 lg:p-6 sm:px-6 lg:px-8 w-full max-w-[95vw] space-y-8">
      {/* Header */}
      {/* <div className="text-center">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text mb-2">
          Company Page
        </h1>
        <p className="text-gray-600 text-lg">Here you can list company-related information and connected experts.</p>
      </div> */}

      {/* Search Bar */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search companies by name or tags..."
          className="w-full sm:w-1/2 border border-gray-300 p-3 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.length > 0 ? (
          companies.map((company) => (
            <a
              href={`company/${company.comp_slug}`}
              target='_blank'
              rel="noopener noreferrer"
              key={company.documentId}
              className="transform hover:-translate-y-1 hover:shadow-xl transition duration-300"
            >
              <div className="border border-gray-200 p-5 rounded-3xl bg-white shadow-md hover:shadow-lg transition duration-200">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">{company.name}</h2>
                <p className="text-gray-700 mt-2">
                  <span className="font-semibold">Tags:</span>{' '}
                  {company.tags && company.tags.length > 0
                    ? company.tags
                    : 'No tags'}
                </p>
              </div>
            </a>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 text-lg">No companies found.</p>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-5 py-2 bg-gray-200 rounded-lg shadow hover:bg-gray-300 disabled:opacity-50 transition"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-gray-700 font-medium">
          Page {page} of {meta.pageCount}
        </span>
        <button
          disabled={page*pageSize >= meta.total}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-5 py-2 bg-gray-200 rounded-lg shadow hover:bg-gray-300 disabled:opacity-50 transition"
        >
          Next
        </button>
      </div>
    </div>
    </>
  )
}
