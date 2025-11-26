
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

import './styles/ExpertDrawer.css'
import EditExperienceModal from './EditExperienceModal'
import { useRouter } from 'next/navigation'
import AddProjectModal from './AddProjectModal'
import EditExpertDetailsModal from './EditExpertDetailsModal'
import { FiX, FiChevronLeft, FiChevronRight, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';



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

const formatDate = (dateStr) => {
  if (!dateStr) return null;

  // Parse safely
  const date = new Date(dateStr + 'T00:00:00Z');
  if (isNaN(date)) return null;

  // Get short month and 2-digit year
  const month = date.toLocaleString('en-US', { month: 'short' }); // e.g., "Dec"
  const year = date.toLocaleString('en-US', { year: '2-digit' }); // e.g., "21"

  return `${month}-${year}`; // e.g., "Dec-21"
};

export default function ExpertSidePanel({ slug, hits, onClose, onSelectSlug, refreshHits }) {
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expertCache, setExpertCache] = useState({});
  const [isOpen, setIsOpen] = useState(!!slug);

  // Track current index in hits array
  const currentIndex = hits.findIndex(hit => hit.slug === slug);


  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setIsOpen(!!slug);
    fetchExperts();
  }, [slug]);

  const fetchExperts = async () => {
    if (expertCache[slug]) {
      // console.log('inside cache')
      // console.log(expertCache);
      setLoading(false);
      setExpert(expertCache[slug]); // show cached immediately
    }
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/experts?filters[slug][$eq]=${slug}&populate[expert_experiences][populate]=target_company&populate[projects][populate]&populate[expert_experiences][populate]=sub_industry`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      const data = res.data.data[0];
      setExpert(data);
      // console.log(expert);
      setLoading(false);

      setExpertCache(prev => {
        return { ...prev, [slug]: data };
      });

    } catch (err) {
      console.error('Failed to fetch experts:', err)
    }

  }

  const router = useRouter()


  const [showProjectModal, setShowProjectModal] = useState(null);


  const experiences = expert?.experiences || [];

  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);

  const handleExpertDetailsSave = (updatedExpert) => {
    onExperienceUpdate(updatedExpert);
  };


  const [editingExp, setEditingExp] = useState(null)

  const handleEdit = (experience) => {
    setEditingExp(experience)
  }



  const handleProjectAdd = async (updatedExp) => { }

  const handleSave = async (updatedExp) => {

    //console.log(updatedExp);


    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/experiences/${updatedExp.exp_slug}`,
        {
          data: {
            experienceId: updatedExp.id,
            designation: updatedExp.designation,
            type: updatedExp.type,
            start_date: updatedExp.start_date,
            end_date: updatedExp.end_date,
            engagement_status: updatedExp.engagement_status,
            source_of_response: updatedExp.source_of_response,
            quote: updatedExp.quote,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // or remove if public
          }
        }
      );

      const updatedExpert = res.data;


      setExpert(updatedExpert)


      //alert('Update Successful.');
      toast.success('Update Successful!');
      setEditingExp(null);
      //console.log('refetch');
      refreshHits();


    } catch (err) {
      console.error('Failed to update experience:', err)
      //alert('Update failed.')
      toast.error('Update failed');

    }
    setEditingExp(null)
  }


  const showPrev = () => {
    if (currentIndex > 0) {
      const prevSlug = hits[currentIndex - 1].slug;
      onSelectSlug(prevSlug);
    }
  };

  const showNext = () => {
    if (currentIndex < hits.length - 1) {
      const nextSlug = hits[currentIndex + 1].slug;
      onSelectSlug(nextSlug);
    }
  };




  if (!slug) return null;

  return (
    <>
      <div
      className='fixed top-0 right-0 h-full w-96 bg-gray-200 shadow-2xl z-[9999] flex flex-col border-l border-gray-200'>

      <div className={`flex justify-end items-center px-3 pt-4  pb-3 border-b sticky top-0 bg-white z-10 transform transition-transform duration-1000 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <a
          href={`/expert/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 p-2 rounded border hover:shadow mx-1"
          title="Open Expert Page"
        >

          <FiExternalLink size={18}/>
        </a>

        <button onClick={showPrev} disabled={currentIndex <= 0} className="text-gray-600 hover:text-gray-800 disabled:text-gray-300 text-lg p-2 mx-1 border rounded cursor-pointer">
          <FiChevronLeft />
        </button>

        <button onClick={showNext} disabled={currentIndex >= hits.length - 1} className="text-gray-600 hover:text-gray-800 disabled:text-gray-300 text-lg p-2 mx-1 border rounded cursor-pointer">
          <FiChevronRight size={18} />
        </button>

        <button onClick={onClose} className="text-red-500 hover:text-red-700 text-lg p-2 mx-1 border rounded cursor-pointer items-center justify-center hover:shadow"><FiX /></button>


      </div>

      <div className='flex-1 overflow-y-auto p-6 space-y-6 text-gray-800'>
        {loading && <div className="flex items-start justify-center py-4 bg-gray-200">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>}

        {!loading && expert && (
         <>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">{expert.name}</h2>

          {expert.linkedin && (
            <a
              href={expert.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-700 underline hover:text-indigo-900 text-sm"
            >
              View LinkedIn Profile
            </a>
          )}

          <div className="text-sm space-y-1">
            <p><span className='font-semibold'>Email:</span> {expert.email}</p>
            <p><span className='font-semibold'>Phone:</span> {expert.phone}</p>
            <p><span className='font-semibold'>Source Of Response:</span> {expert.source_of_response}</p>
            <p><span className='font-semibold'>Quote:</span> {expert?.original_quote != null ? "₹" + expert.original_quote : '-'}</p>
           
          </div>
        </div>

        {/* Experiences */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold border-b pb-1 text-gray-800">Experiences</h3>
          {expert?.expert_experiences?.length > 0 ? (
            <div className="space-y-3">
              {expert.expert_experiences.map((exp, index) => (
                <div key={exp.id || index} className="p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-gray-50">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium text-gray-900">{exp.designation}</p>
                    <button className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer" onClick={() => handleEdit(exp)}>
                      ✏️ Edit
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <span className={`px-2 py-0.5 rounded text-white ${getTypeClass(exp.type)}`}>{exp.type}</span>
                    <span>{formatDate(exp.start_date)} – {formatDate(exp.end_date) || 'Present'}</span>
                  </div>
                  {exp.engagement_status && <p className="text-gray-700 text-sm">Status: {exp.engagement_status}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No experience data available.</p>
          )}
        </div>

        {/* Projects */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold border-b pb-1 text-gray-800">Projects</h3>
          {expert?.projects?.length > 0 ? (
            <div className="space-y-3">
              {expert.projects.map((project, index) => (
                <div key={project.id || index} className="p-3 border rounded-lg shadow-sm bg-gray-50 hover:shadow-md transition-shadow duration-200">
                  <p><strong>Code:</strong> {project.code}</p>
                  <p><strong>Investor:</strong> {project.investor}</p>
                  <p><strong>CA:</strong> {project.ca}</p>
                  <p><strong>Call Rating:</strong> {project.call_rating} / 5</p>
                  <p><strong>Expert Rating:</strong> {project.expert_rating} / 5</p>
                  <p><strong>FC Call Rating:</strong> {project.fc_call_rating} / 5</p>
                  <p><strong>FC Expert Rating:</strong> {project.fc_expert_rating} / 5</p>
                  <p><strong>Date:</strong> {project.date}</p>
                  <p><strong>Final Amount:</strong> ${project.final_amount}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No project data available.</p>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold border-b pb-1 text-gray-800">Tags</h3>
          {expert?.tags?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {expert.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{tag}</span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No tags</p>
          )}
        </div>
      </>
        )}


      </div>
    </div>

          {editingExp && (
              <EditExperienceModal
                experience={editingExp}
                expertId={expert.id}
                onClose={() => setEditingExp(null)}
                onSave={handleSave}
              />
            )}
  </>
  );
}