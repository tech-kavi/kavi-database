'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Pie } from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useAuth } from './components/AuthProvider';
import toast from 'react-hot-toast';
import { TYPE_COLORS } from './constants/options';


ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState(null);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [reIndex,setreIndex] = useState(false);
  const [projectType, setProjectType] = useState("all");

  const {user}=useAuth();

  useEffect(() => { document.title = `KAVI | Home`; }, []);
  useEffect(() => { const token = localStorage.getItem('token'); if (!token) router.push('/login'); }, []);
  useEffect(() => { fetchDashboard(); }, [period,projectType]);

  const handleReindex = async () => {
    setreIndex(true);
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reindex-experts`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      //alert('Reindexing started successfully!');
      toast.success('Reindexing started successfully!');
    } catch (error) {
      console.error('Reindexing failed:', error);
      //alert('Failed to start reindexing.');
      toast.error('Failed to start reindexing');
    } 
    finally{
      setreIndex(false);
    }
  };

  const fetchDashboard = async () => {
   // setLoading(true);
    try {
          const [resStats, resRecent] = await Promise.all([
      axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/expert-details`,
        {
          params: projectType === "all" ? {} : {type: projectType},
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      ),
      axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recent-experts-count?period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      ),
    ]);
      setDashboard({
        ...resStats.data,
        recentExpertsCount: resRecent?.data?.count,
      });
      
    } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('token');
          router.push('/login');
        } else {
          toast.error('Failed to fetch dashboard data');
        }
      }finally { 
       // setLoading(false);
       }
  };


  const typeLabels = dashboard ? Object.keys(dashboard?.typeCounts):[];
  const typeData = dashboard ? Object.values(dashboard?.typeCounts):[];
  const pieData = dashboard? { labels: typeLabels, datasets: [{ label: 'Expert Distribution', data: typeData, backgroundColor: [
  '#ef4444', // Competitor - red
  '#3b82f6', // Consultant - blue
  '#10b981', // Customer - green
  '#f59e0b', // Dealer - amber
  '#8b5cf6', // Distributor - violet
  '#ec4899', // Franchisee - pink
  '#14b8a6', // Former - teal
  '#6366f1', // Industry Expert - indigo
  '#f472b6', // Partner - rose
  '#0ea5e9', // Reference - sky
  '#84cc16', // Supplier - lime
  '#a3a3a3'  // Others - neutral gray
] }] } : {
  labels: typeLabels,
  datasets: [
    {
      label: 'Expert Distribution',
      data: typeData,
      backgroundColor: [
  '#ef4444', // Competitor - red
  '#3b82f6', // Consultant - blue
  '#10b981', // Customer - green
  '#f59e0b', // Dealer - amber
  '#8b5cf6', // Distributor - violet
  '#ec4899', // Franchisee - pink
  '#14b8a6', // Former - teal
  '#6366f1', // Industry Expert - indigo
  '#f472b6', // Partner - rose
  '#0ea5e9', // Reference - sky
  '#84cc16', // Supplier - lime
  '#a3a3a3'  // Others - neutral gray
],
    },
  ],
};

const doughnutOptions = {
  responsive: true,
  cutout: '65%', // this is what makes it a doughnut vs a pie — bigger = thinner ring
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 12,
        boxHeight: 12,
        padding: 16,
        font: { size: 13 },
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      backgroundColor: '#111827',
      titleFont: { size: 13 },
      bodyFont: { size: 13 },
      padding: 10,
      cornerRadius: 8,
    },
  },
};

const filterLabel = {
  all: "Total",
  internal: "Internal",
  external: "External",
}[projectType];

  
  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }


  return (
    <div className="mx-auto p-2 lg:p-6 sm:px-6 lg:px-8 w-full max-w-[95vw] space-y-8">
      {/* Header */}
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
  <div>
    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
      Expert Dashboard
    </h1>
    <p className="text-gray-500 mt-1">
      Overview of all experts empanelled with KAVI
    </p>
  </div>

  {user?.role?.type === "admin" && (
    <button
      onClick={handleReindex}
      disabled={reIndex}
      className={`px-6 py-3 rounded-xl text-white font-semibold shadow-md transition
      ${
        reIndex
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {reIndex ? "Reindexing..." : "Reindex"}
    </button>
  )}
</div>

{/* Global Stats */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
  {[
    {
      label: "Total Experts",
      value: dashboard?.totalExperts,
      subtitle: "Active in database",
      color: "bg-slate-800",
    },
    {
      label: "Average Quote",
      value: `₹${dashboard?.avgQuote}`,
      subtitle: "Per screened expert",
      color: "bg-slate-700",
    },
    {
      label: "Recent Uploads",
      value: dashboard?.recentExpertsCount,
      subtitle: period,
      color: "bg-slate-600",
    },
  ].map((stat, idx) => (
    <div
      key={idx}
      className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition`}
    >
      <p className="text-sm opacity-80">{stat.label}</p>
      <p className="text-3xl font-bold mt-2">{stat.value}</p>
      <p className="text-sm opacity-70 mt-2">{stat.subtitle}</p>
    </div>
  ))}
</div>

{/* Call Metrics */}
<div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
    <div>
      <h2 className="text-xl font-semibold text-gray-800">
        Call Metrics
      </h2>
      <p className="text-sm text-gray-500">
        Filter applies only to the metrics below
      </p>
    </div>

    <select
      value={projectType}
      onChange={(e) => setProjectType(e.target.value)}
      className="border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    >
      <option value="all">All Calls</option>
      <option value="internal">Internal Calls</option>
      <option value="external">External Calls</option>
    </select>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="rounded-2xl bg-gradient-to-r bg-indigo-600 text-white p-6 shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm opacity-80">Calls Completed</p>
          <p className="text-3xl font-bold mt-2">
            {dashboard?.callsCompleted}
          </p>
        </div>

        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
          {filterLabel}
        </span>
      </div>

      <p className="text-sm opacity-80 mt-4">
        {filterLabel} calls
      </p>
    </div>

    <div className="rounded-2xl bg-gradient-to-r bg-indigo-500 text-white p-6 shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm opacity-80">Average Call Price</p>
          <p className="text-3xl font-bold mt-2">
            ₹{dashboard?.avgCallPrice}
          </p>
        </div>

        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
          {filterLabel}
        </span>
      </div>

      <p className="text-sm opacity-80 mt-4">
        {filterLabel} calls
      </p>
    </div>
  </div>
</div>


      {/* Expert Distribution */}
      <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition flex flex-col items-center">
  <h2 className="text-2xl font-semibold mb-6 text-gray-700">Expert Distribution by Type</h2>
  <div className="w-full md:w-1/2 lg:w-1/3 relative">
    <Doughnut data={pieData} options={doughnutOptions} />
    
  </div>
</div>
    </div>
  );
}
