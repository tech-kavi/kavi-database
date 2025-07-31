'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function CompanyPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.push('/login')
      return
    }

    const fetchCompanies = async () => {
      try {
        const res = await axios.get('http://localhost:1337/api/companies-data', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setCompanies(res.data)
      } catch (err) {
        console.error('Error fetching companies:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [router])

  if (loading) return <p className="p-8 text-center">Loading companies...</p>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold mb-2">Company Page</h1>
      <p className="text-gray-600 mb-6">Here you can list company-related information and connected experts.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.length > 0 ? (
          companies.map((company) => (
            <div
              key={company.id}
              className="border border-gray-200 p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition"
            >
              <h2 className="text-xl font-medium mb-2">{company.name}</h2>
              <p className="text-gray-700"><span className="font-semibold">Expert Count:</span> {company.expertCount || 0}</p>
              <p className="text-gray-700 mt-1">
                <span className="font-semibold">Tags:</span>{' '}
                {company.tags && company.tags.length > 0
                  ? company.tags
                  : 'No tags'}
              </p>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">No companies found.</p>
        )}
      </div>
    </div>
  )
}
