'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useAuth } from './components/AuthProvider';
import toast from 'react-hot-toast';


ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState(null);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  const {user}=useAuth();

  useEffect(() => { document.title = `KAVI | Home`; }, []);
  useEffect(() => { const token = localStorage.getItem('token'); if (!token) router.push('/login'); }, []);
  useEffect(() => { fetchDashboard(); }, [period]);

  const handleReindex = async () => {
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
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const resStats = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/expert-details`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const resRecent = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recent-experts-count?period=${period}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setDashboard({
        ...resStats.data,
        recentExpertsCount: resRecent?.data?.count,
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch dashboard data');
    } finally { setLoading(false); }
  };

  // if (loading) return (
  //   <div className="flex items-center justify-center h-screen bg-gray-100">
  //     <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
  //   </div>
  // );

  const typeLabels = dashboard ? Object.keys(dashboard?.typeCounts):[];
  const typeData = dashboard ? Object.values(dashboard?.typeCounts):[];
  const pieData = dashboard? { labels: typeLabels, datasets: [{ label: 'Expert Distribution', data: typeData, backgroundColor: ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa'] }] } : {
  labels: typeLabels,
  datasets: [
    {
      label: 'Expert Distribution',
      data: typeData,
      backgroundColor: ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa'],
    },
  ],
};

  return (
    <div className="mx-auto p-2 lg:p-6 sm:px-6 lg:px-8 w-full max-w-[95vw] space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">Expert Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of all experts empanelled with KAVI</p>
        </div>

         {user?.role?.type == "admin" && (
        <button
          onClick={handleReindex}
          disabled={loading}
          className={`mt-4 md:mt-0 px-6 py-3 rounded-lg text-white font-semibold shadow-md transition 
            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`
          }
        >
          {loading ? "Reindexing..." : "Reindex Experts"}
        </button>
         )}
      </div>

      {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Experts', value: dashboard?.totalExperts, subtitle: 'Active in database', color: 'from-gray-800 to-gray-700' },
            { label: 'Average Quote', value: `$${dashboard?.avgQuote}`, subtitle: 'Per screened expert', color: 'from-gray-600 to-gray-500' },
            { label: 'Calls Completed', value: dashboard?.callsCompleted, subtitle: 'Total', color: 'from-gray-500 to-gray-400' },
            { label: 'Avg Call Price', value: `$${dashboard?.avgCallPrice}`, subtitle: 'Per call', color: 'from-gray-700 to-gray-600' },
            { label: 'Recent Uploads', value: dashboard?.recentExpertsCount, subtitle: period, color: 'from-gray-600 to-gray-500' },
          ].map((stat, idx) => (
            <div key={idx} className={`bg-gradient-to-r ${stat.color} text-white p-6 rounded-2xl shadow-md hover:shadow-lg transition`}>
              <p className="text-sm opacity-80">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
              <p className="text-sm opacity-70 mt-1">{stat.subtitle}</p>
            </div>
          ))}
        </div>


      {/* Expert Distribution */}
      <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Expert Distribution by Type</h2>
        <div className="w-full md:w-1/2 lg:w-1/3">
          <Pie data={pieData} />
        </div>
      </div>
    </div>
  );
}
