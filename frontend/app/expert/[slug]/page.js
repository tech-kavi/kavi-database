'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

import EditExperienceModal from '../../components/EditExperienceModal';
import AddProjectModal from '../../components/AddProjectModal';
import EditExpertDetailsModal from '../../components/EditExpertDetailsModal';
import EditProjectModal from '../../components/EditProjectModal';
import Badge from '../../components/Badge';
import { ENGAGEMENT_COLORS } from '../../constants/options';
import { TYPE_COLORS } from '../../constants/options';
import ExperiencesTable from '../../components/ExperiencesTable';
import ProjectsTable from '../../components/ProjectsTable';
import Head from 'next/head';
import toast from 'react-hot-toast';


const getTypeClass = (type) => {
  switch (type?.toLowerCase()) {
    case 'current': return 'bg-green-100 text-green-800';
    case 'former': return 'bg-gray-100 text-gray-800';
    case 'advisor': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-blue-100 text-blue-800';
  }
};

export default function ExpertPage() {

  

  const { slug } = useParams();

  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingExp, setEditingExp] = useState(null);
 
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
 
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);


  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingScreening, setIsEditingScreening] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [screeningValue, setScreeningValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);




  useEffect(() => {
    if (!slug) return;
    fetchExpert();
  }, [slug]);

  

  const fetchExpert = async () => {

    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/experts?filters[slug][$eq]=${slug}&populate[expert_experiences][populate]=target_company&populate[expert_experiences][populate]=sub_industry&populate[projects][populate]&populate[last_update]=*`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const data = res.data.data[0];
      setExpert(data);
      setLoading(false);

    } catch (err) {
      console.error('Failed to fetch expert:', err);
      setLoading(false);
    }
  };

    const [editingTags, setEditingTags] = useState(false);
  const [tagsInput, setTagsInput] = useState(expert?.tags?.join(', ') || '');

  

  const handleSave = async (updatedExp) => {
    console.log("inside exp save");
    console.log(updatedExp);
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/experiences/${updatedExp.exp_slug}`,
        { data: updatedExp },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const updatedExpert = res.data;
      setExpert(updatedExpert);
      console.log(updatedExpert);
      setEditingExp(null);
      //alert('Experience updated successfully!');
      toast.success('Experience updated successfully!');
    } catch (err) {
      console.error(err);
      //alert('Failed to update experience');
      toast.error('Failed to update experience');
    }
  };

   useEffect(() => {
    if (expert) {
      document.title = `KAVI | ${expert.name}`;
    } else {
      document.title = 'KAVI | Expert Page';
    }
  }, [expert]);

  const handleProSave = async (updatedProject) => {
  //console.log(updatedProject);
  try {
    const res = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${updatedProject.pro_slug}`,
      { data: updatedProject },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );

    const updatedExpert = res.data;
      setExpert(updatedExpert);
      console.log(updatedExpert);

    setShowProjectModal(false);
    toast.success('Project updated successfully!');
    //alert('Project updated successfully!');
  } catch (err) {
    console.error(err);
    //alert('Failed to update project');
    toast.error('Failed to update project');
  }
};

 
 const handleEdit = (experience) => {
  console.log("handleEdit");
    setEditingExp(experience)
  }

  // const handleExpUpdate = async (updatedExp) => {

  //   console.log(updatedExp);


  //   try {
  //     const res = await axios.put(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/experiences/${updatedExp.exp_slug}`,
  //       {
  //         data: {
  //           experienceId: updatedExp.id,
  //           designation: updatedExp.designation,
  //           type: updatedExp.type,
  //           start_date: updatedExp.start_date,
  //           end_date: updatedExp.end_date,
  //           engagement_status: updatedExp.engagement_status,
  //           source_of_response: updatedExp.source_of_response,
  //           quote: updatedExp.quote,
  //         },
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem('token')}`, // or remove if public
  //         }
  //       }
  //     );

  //     const updatedExpert = res.data;


  //     setExpert(updatedExpert)

  //     alert('Update Successful.');
  //     setEditingExp(null);
  //     refetchHits();


  //   } catch (err) {
  //     console.error('Failed to update experience:', err)
  //     alert('Update failed.')
  //   }
  //   setEditingExp(null)
  // }


  const handleExpertSave = async (updatedData) => {
      console.log('inside expert save');
      console.log(updatedData);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/experts/${expert.slug}`,
        {
          data: updatedData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedExpert = res.data;
      setExpert(updatedExpert);
      console.log(updatedExpert);
      setShowEditDetailsModal(false);

    } catch (err) {
      console.error(err);
      //alert('Failed to update expert details.');
      toast.error('Failed to update expert details');
    }
    
  };

  // const addProject = async ()=>{
  //   try{

  //   }
  //   catch(err)
  //   {
  //     console.error(err);
  //     alert('Failed to add project');
  //   }
  // }

    if (loading) return <div className="flex items-start justify-center py-4 bg-gray-200">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>;
 
  if (!expert) return <p className="text-center mt-10 text-red-500">No expert found.</p>;

  return (

  <>
  
    <div className="mx-auto p-2 lg:p-6 sm:px-6 lg:px-8 w-full max-w-[95vw] space-y-8">

  {/* Header: Expert Name + Edit + LinkedIn */}
  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
    <div className="flex items-center gap-2">
      <h1 className="text-3xl font-bold text-gray-900">{expert.name}</h1>
      <button 
        className="text-sm text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
        onClick={() => setShowEditDetailsModal(true)}
      >
        ✏️ Edit
      </button>
    </div>
    {expert.linkedin && (
      <a
        href={expert.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition font-medium text-sm"
      >
        View LinkedIn Profile →
      </a>
    )}
  </div>

  {/* Latest Data + Contact & Status */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    
    <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-2">Latest Data</h2>
      <div className="space-y-2">
        <p className="text-gray-400">Designation</p>
        <p className="font-semibold">{expert.expert_experiences[0]?.designation || '-'}</p>

        <p className="text-gray-400">Company</p>
        <p className="font-semibold">{expert.expert_experiences[0]?.company || '-'}</p>

        <p className="text-gray-400">Topic</p>
        <p className="font-semibold">{expert.expert_experiences[0]?.target_company?.name || '-'}</p>

        <p className="text-gray-400">Type</p>
        <Badge label={expert.expert_experiences[0]?.type} options={TYPE_COLORS} />

         <p className="text-gray-400">Status</p>
        <Badge label={expert.expert_experiences[0]?.engagement_status} options={ENGAGEMENT_COLORS} />
      </div>
    </div>

    <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-2">Contact & Status</h2>
      <div className="space-y-2">
        <p className="text-gray-400">Email</p>
        <p className="font-semibold">{expert.email || '-'}</p>

        <p className="text-gray-400">Phone</p>
        <p className="font-semibold">{expert.phone || '-'}</p>

        <p className="text-gray-400">Original Quote</p>
        <p className="font-semibold">{expert.original_quote || '-'}</p>

        <p className="text-gray-400">Source Of Response</p>
        <p className="font-semibold">{expert?.source_of_response || '-'}</p>

        
        <p className="text-gray-400">Status</p>
        <Badge label={expert.expert_status} options={ENGAGEMENT_COLORS} />
      </div>
    </div>

  </div>



  {/* Experiences Table */}
  <ExperiencesTable expert={expert} handleEdit={handleEdit} />

  {/* Summary */}
  <div className="bg-white p-6 rounded-xl shadow-md">
    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Summary</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      <div>
        <p className="text-gray-400">Calls Completed</p>
        <p className="font-semibold text-lg">{expert.projects?.length || '-'}</p>
      </div>
      <div>
        <p className="text-gray-400">Total Amount Paid</p>
        <p className="font-semibold text-lg">
          {expert.projects?.length
            ? expert.projects.reduce((sum, p) => sum + (p.final_amount || 0), 0)
            : '-'}
        </p>
      </div>
      <div>
        <p className="text-gray-400">Overall Rating</p>
        <p className="font-semibold text-lg">
          {expert.projects?.length
            ? (
                expert.projects.reduce((sum, p) => sum + (p.expert_rating || 0), 0) /
                expert.projects.length
              ).toFixed(1)
            : '-'} / 5
        </p>
      </div>
      <div>
        <p className="text-gray-400">Call Codes</p>
        <p className="font-semibold text-lg">
          {expert.projects?.length
            ? expert.projects.map(p => p.code).filter(Boolean).join(', ')
            : '-'}
        </p>
      </div>
    </div>
  </div>

  {/* Projects Table */}
  <ProjectsTable projects={expert.projects} onEdit={(project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  }} />


  {/* Expert Notes */}
<div className="bg-white p-6 rounded-xl shadow-md">
  <div className="flex justify-between items-center border-b pb-2 mb-3">
    <h2 className="text-xl font-semibold text-gray-800">Expert Notes</h2>
    {!isEditingNotes ? (
      <button
        className="text-sm text-indigo-600 hover:text-indigo-800"
        onClick={() => {
          setNotesValue(expert.notes || '');
          setIsEditingNotes(true);
        }}
      >
        ✏️ Edit
      </button>
    ) : null}
  </div>

  {!isEditingNotes ? (
    <p className="text-gray-600 whitespace-pre-line">{expert.notes || '-'}</p>
  ) : (
    <div className="space-y-3">
      <textarea
        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
        rows={4}
        value={notesValue}
        onChange={(e) => setNotesValue(e.target.value)}
      />
      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setIsEditingNotes(false)}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
          onClick={async () => {
            setIsSaving(true);
            await handleExpertSave({ notes: notesValue });
            setIsSaving(false);
            setIsEditingNotes(false);
          }}
          disabled={isSaving}
        >
          {isSaving && (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          )}
          Save
        </button>
      </div>
    </div>
  )}
</div>

{/* Expert Screening */}
<div className="bg-white p-6 rounded-xl shadow-md">
  <div className="flex justify-between items-center border-b pb-2 mb-3">
    <h2 className="text-xl font-semibold text-gray-800">Expert Screening</h2>
    {!isEditingScreening ? (
      <button
        className="text-sm text-indigo-600 hover:text-indigo-800"
        onClick={() => {
          setScreeningValue(expert.screening || '');
          setIsEditingScreening(true);
        }}
      >
        ✏️ Edit
      </button>
    ) : null}
  </div>

  {!isEditingScreening ? (
    <p className="text-gray-600 whitespace-pre-line">{expert.screening || '-'}</p>
  ) : (
    <div className="space-y-3">
      <textarea
        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
        rows={4}
        value={screeningValue}
        onChange={(e) => setScreeningValue(e.target.value)}
      />
      <div className="flex justify-end gap-3">
        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setIsEditingScreening(false)}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
          onClick={async () => {
            setIsSaving(true);
            await handleExpertSave({ screening: screeningValue });
            setIsSaving(false);
            setIsEditingScreening(false);
          }}
          disabled={isSaving}
        >
          {isSaving && (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          )}
          Save
        </button>
      </div>
    </div>
  )}
</div>



  {/* Tags */}
<div className="bg-white p-6 rounded-xl shadow-md">
  <h2 className="text-lg font-semibold mb-2 flex items-center justify-between">
    Tags
    {!editingTags && (
      <button
        className="text-sm text-indigo-600 hover:text-indigo-800"
        onClick={() => {
          setEditingTags(true);
          setTagsInput(expert.tags?.join(', ') || ''); // retain previous tags
        }}
      >
        ✏️ Edit
      </button>
    )}
  </h2>

  {editingTags ? (
    <div className="flex flex-col gap-2">
      <input
        className="input-field"
        value={tagsInput}
        onChange={(e) => 
          setTagsInput(e.target.value) }
        placeholder="Enter tags separated by commas"
      />
      <p className="text-sm text-red-500">⚠️ Please enter tags separated by commas</p>
      <div className="flex gap-2">
        <button
          className="save-btn"
           onClick={async () => {
          const newTags = tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);

          await handleExpertSave({ tags: newTags });
          setEditingTags(false);
        }}
        >
          Save
        </button>
        <button
          className="cancel-btn"
          onClick={() => {
          setTagsInput(expert.tags?.join(', ') || '');
          setEditingTags(false);
        }}
        >
          Cancel
        </button>
      </div>
    </div>
  ) : expert.tags?.length > 0 ? (
    <div className="flex flex-wrap gap-2">
      {expert.tags.map((tag, i) => (
        <span
          key={i}
          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
        >
          {tag}
        </span>
      ))}
    </div>
  ) : (
    <p className="text-gray-500">No tags</p>
  )}
</div>


  {/* Edit History */}
  <div className="bg-white p-6 rounded-xl shadow-md">
    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-2">Edit History</h2>
    <p className="text-gray-500">
      {expert.last_update
        ? `Last edited by ${expert.last_update.name} on ${new Date(expert.last_update.time).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}`
        : '-'}
    </p>
  </div>

                {/* Modals */}
      {editingExp && (
        <EditExperienceModal
          experience={editingExp}
          expertId={expert.id}
          onClose={() => setEditingExp(null)}
          onSave={handleSave}
        />
      )}

      {showProjectModal && (
        <AddProjectModal
          expertId={slug}
          onClose={() => setShowProjectModal(false)}
          onProjectAdd={(expertData) =>{
            setExpert(expertData);
          } }
        />
      )}

      {showProjectModal && (
      <EditProjectModal
        project={selectedProject}
        expertId={expert.id}
        onClose={() => setShowProjectModal(false)}
        onSave={handleProSave}
      />
    )}

    {showEditDetailsModal && (
      <EditExpertDetailsModal
        expert={expert}
        onClose={() => setShowEditDetailsModal(false)}
        onSave={handleExpertSave}
      />
    )}



      {editingExp && (
                    <EditExperienceModal
                      experience={editingExp}
                      expertId={expert.id}
                      onClose={() => setEditingExp(null)}
                      onSave={handleSave}
                    />
                  )}


    </div>
  </>
  );
}
