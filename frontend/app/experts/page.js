'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import ExpertCard from '../components/ExpertCard'
import ExpertDrawer from '../components/ExpertDrawer'
import '../components/styles/Experts.css'
import { useRouter } from 'next/navigation'

export default function ExpertsPage() {

  const router = useRouter()
  const [experts, setExperts] = useState([])
  const [selectedExpert, setSelectedExpert] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  
    useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    } else {
      fetchExperts()
    }
    setIsLoading(false) // <-- Set loading false after auth check
  }, [])



  useEffect(() => {
    fetchExperts()
  }, [])

  const fetchExperts = async () => {
    try {
      const res = await axios.get('http://localhost:1337/api/experts?populate[expert_experiences][populate]=company&populate[expert_experiences][populate]=target_company&populate[projects][populate]',{
        headers:{
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      console.log(res);
      setExperts(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch experts:', err)
    }
  }

  const handleCardClick = (expert) => {
    setSelectedExpert(expert)
  }

  const closeDrawer = () => {
    setSelectedExpert(null)
  }

  const handleProjectAdd = (updatedExpert) =>{
      const expertDocId  = updatedExpert.documentId;

      setExperts((prevExperts) =>
        prevExperts.map((expert) =>
          expert.documentId === expertDocId ? updatedExpert : expert
        )
      );

      // Update selectedExpert if it's the same one
      setSelectedExpert((prevSelected) =>
        prevSelected?.documentId === expertDocId ? updatedExpert : prevSelected
      );
    
 

  }


  const handleExperienceUpdate = (updatedExpert) => {
  
    const expertDocId  = updatedExpert.documentId;

    
  setExperts((prevExperts) =>
    prevExperts.map((expert) =>
      expert.documentId === expertDocId ? updatedExpert : expert
    )
  );

  // Update selectedExpert if it's the same one
  setSelectedExpert((prevSelected) =>
    prevSelected?.documentId === expertDocId ? updatedExpert : prevSelected
  );
};


 if (isLoading) return null

  return (
    <div className="experts-container">
      <h1 className="experts-title">Our Experts</h1>

      <div className="experts-grid">
        {experts.map((expert) => (
          <ExpertCard key={expert.id} expert={expert} onClick={() => handleCardClick(expert)} />
        ))}
      </div>

      {selectedExpert && (
        <ExpertDrawer expert={selectedExpert} onClose={closeDrawer} onExperienceUpdate={handleExperienceUpdate} onProjectAdd={handleProjectAdd}/>
      )}
    </div>
  )
}
