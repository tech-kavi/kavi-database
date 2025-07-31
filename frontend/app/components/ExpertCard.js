'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const getTypeAbbreviation = (type) => {
  switch (type) {
    case 'Former': return 'F';
    case 'Customer': return 'Cus';
    case 'Competitor': return 'Comp';
    case 'Industry Expert': return 'IE';
    default: return type;
  }
};

export default function ExpertCard({ expert, onClick }) {
  const router = useRouter()
  const [showExperiences, setShowExperiences] = useState(false)
  const [showProjects, setShowProjects] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
  }, []);

  return (
    <div
      className="cursor-pointer bg-white shadow-md rounded-2xl p-6 transition hover:shadow-lg border border-gray-200 w-full max-w-xl mx-auto space-y-4"
      onClick={onClick}
    >
      {/* Expert Name */}
      <h3 className="text-2xl font-bold text-gray-900">{expert.name}</h3>

      {/* LinkedIn */}
      {expert.linkedin && (
        <a
          href={expert.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          View LinkedIn
        </a>
      )}

      {/* Quote */}
      <p className="text-gray-700 text-base">
        <span className="font-semibold">Quote:</span> {expert?.expert_experiences?.[0]?.original_quote || "N/A"}
      </p>

      {/* Experiences */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center cursor-pointer" onClick={(e) => {
          e.stopPropagation();
          setShowExperiences(!showExperiences);
        }}>
          <h4 className="text-lg font-semibold text-gray-800">Experiences</h4>
          <span className="text-sm text-blue-600">{showExperiences ? 'Hide' : 'Show'}</span>
        </div>

        {showExperiences && expert.expert_experiences?.filter(exp => exp.company).length > 0 ? (
          <div className="mt-2 space-y-2">
            {expert.expert_experiences.filter(exp => exp.company).map((exp, index) => (
              <div key={exp.id || index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs mr-2">
                    {getTypeAbbreviation(exp.type)}
                  </span>
                  {exp.company.name}
                </p>
              </div>
            ))}
          </div>
        ) : showExperiences && (
          <p className="text-sm text-gray-500 mt-2">No experience data available.</p>
        )}
      </div>

      {/* Projects */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center cursor-pointer" onClick={(e) => {
          e.stopPropagation();
          setShowProjects(!showProjects);
        }}>
          <h4 className="text-lg font-semibold text-gray-800">Projects</h4>
          <span className="text-sm text-blue-600">{showProjects ? 'Hide' : 'Show'}</span>
        </div>

        {showProjects && expert.projects?.length > 0 ? (
          <div className="mt-2 space-y-2">
            {expert.projects.map((project, index) => (
              <div key={project.id || index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700">
                  <span className="font-semibold">{project.code}</span> — Rating: <span className="text-yellow-600 font-bold">{project.call_rating}/5</span>
                </p>
              </div>
            ))}
          </div>
        ) : showProjects && (
          <p className="text-sm text-gray-500 mt-2">No project data available.</p>
        )}
      </div>
    </div>
  )
}
