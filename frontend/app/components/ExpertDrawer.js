'use client'

import './styles/ExpertDrawer.css'
import EditExperienceModal from './EditExperienceModal'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import AddProjectModal from './AddProjectModal'
import EditExpertDetailsModal from './EditExpertDetailsModal'


const getTypeClass = (type) => {
  switch (type?.toLowerCase()) {
    case 'current':
      return 'tag-current'
    case 'former':
      return 'tag-former'
    case 'advisor':
      return 'tag-advisor'
    default:
      return 'tag-default'
  }
}




export default function ExpertDrawer({ expert, onClose, onExperienceUpdate, onProjectAdd  }) {

  const router = useRouter()

  const token = localStorage.getItem('token');

  useEffect(() => {
  
  if (!token) {
    router.push('/login');
  }
}, []);

const [showProjectModal, setShowProjectModal] = useState(null);


  const experiences = expert.experiences ||[];

  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);

  const handleExpertDetailsSave = (updatedExpert) => {
    onExperienceUpdate(updatedExpert);
  };


  const [editingExp, setEditingExp] = useState(null)

const handleEdit = (experience) => {
  setEditingExp(experience)
}



const handleProjectAdd = async(updatedExp) => {}

const handleSave = async(updatedExp) => {
  

  try {
    const res = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/experiences/${updatedExp.experienceId}`,
      {
        data: {
          experienceId:updatedExp.id,
          designation: updatedExp.designation,
          type: updatedExp.type,
          start_date: updatedExp.start_date,
          end_date: updatedExp.end_date,
          engagement_status: updatedExp.engagement_status,
          source_of_response: updatedExp.source_of_response,
          quote:updatedExp.quote,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // or remove if public
      }
    }
  );

  const updatedExpert = res.data;
  
  
    // Call handler to lift updated experience to parent state
    onExperienceUpdate(updatedExpert);

    alert('Update Successful.');
    setEditingExp(null);
  

  } catch (err) {
    console.error('Failed to update experience:', err)
    alert('Update failed.')
  }
  setEditingExp(null)
}




  return (
    
        <div className="drawer-overlay">
      <div className="drawer">

        <div className='flex justify-between items-center w-full mb-4'>
           <button className="close-btn" onClick={onClose}>X</button>
        <button className="add-btn my-4" onClick={() => setShowEditDetailsModal(true)}>✏️ Edit</button>

        </div>
       

        <h2 className="drawer-title text-xl font-semibold mb-4">{expert.name}</h2>

        

        {expert.linkedin && (
          <a
            href={expert.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="drawer-subtext underline text-indigo-800"
          >
            View LinkedIn Profile →
          </a>
        )}
        <p>Email: {expert.email}</p>
        <p>Phone: {expert.phone}</p>
        <p>Source Of Response:{expert.source_of_response}</p>
        <p>Quote:{expert?.original_quote}</p>
        <p>RA Comments:{expert.ra_comments}</p>
        
        <h3 className="drawer-section-title">Experiences</h3>
        {expert.expert_experiences.length > 0 ? (
          <div className="experience-container">
            {expert.expert_experiences.map((exp, index) => (
              <div key={exp.id || index} className="experience-card">
                 <div className="experience-header">
                  <p className="designation">{exp.designation}</p>
                  <button className="edit-btn" onClick={() => handleEdit(exp)}>
                    ✏️ Edit
                  </button>
                </div>

                <div className="experience-meta">
                  <span className={`type-tag ${getTypeClass(exp.type)}`}>{exp.type}</span>
                  <span className="date-range">
                    {exp.start_date} – {exp.end_date || 'Present'}
                  </span>
                </div>

                {exp.engagement_status && (
                  <p className="engagement-status">
                    Status: {exp.engagement_status}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No experience data available.</p>
        )}

        <h3 className="drawer-section-title mt-6">Projects</h3>

        {expert.projects?.length > 0 ? (
          <div className="project-container">
            {expert.projects.map((project, index) => (
              <div key={project.id || index} className="project-card">
                <p><strong>Code:</strong> {project.code}</p>
                <p><strong>Investor:</strong> {project.investor}</p>
                <p><strong>CA:</strong> {project.ca}</p>
                <p><strong>Call Rating:</strong> {project.call_rating} / 5</p>
                <p><strong>Expert Rating:</strong> {project.expert_rating} / 5</p>
                <p><strong>FC Call Rating:</strong> {project.fc_call_rating} / 5</p>
                <p><strong>FC Expert Rating:</strong> {project.fc_expert_rating} / 5</p>
                <p><strong>Date:</strong> {project.date}</p>
                <p><strong>Final Amount:</strong> ₹{project.final_amount}</p>
                
              </div>
            ))}
          </div>
          
        ) : (
          <p>No project data available.</p>
          
        )}

        <button className="add-btn mt-2" onClick={() => setShowProjectModal(true)}>+ Add Project</button>

        <p>Notes:{expert.notes}</p>
        <p>Screening:{expert.notes}</p>
        <p>Bank Details:{expert.bank_details}</p>

         {editingExp && (
        <EditExperienceModal
          experience={editingExp}
          expertId={expert.documentId}
          onClose={() => setEditingExp(null)}
          onSave={handleSave}
        />
      )}

      {showProjectModal && (
        <AddProjectModal
          expertId={expert.documentId}
          onProjectAdd={onProjectAdd}
          onClose={() => setShowProjectModal(false)}
          onSave={handleProjectAdd}
        />
      )}

      {showEditDetailsModal && (
  <EditExpertDetailsModal
    expert={expert}
    onSave={handleExpertDetailsSave}
    onClose={() => setShowEditDetailsModal(false)}
  />
)}


      </div>
    </div>
  )
}
