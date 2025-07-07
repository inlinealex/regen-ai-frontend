import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// You can swap this for a real chart library later
const DummyChart = () => (
  <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
    [Chart Placeholder]
  </div>
);

const HomeDashboard: React.FC = () => {
  const [live, setLive] = useState({
    personas: 4,
    leads: 128,
    qualified: 72,
    campaigns: 3,
    vectorDB: 'Healthy',
    aiAlerts: 1,
    revenue: 12500,
    meetings: 18
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLive((prev) => ({
        ...prev,
        leads: prev.leads + Math.floor(Math.random() * 2),
        qualified: prev.qualified + Math.floor(Math.random() * 2),
        revenue: prev.revenue + Math.floor(Math.random() * 100),
        meetings: prev.meetings + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Overview</h1>
      {/* Live Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">👤</span>
            <span className="text-xs text-green-600 dark:text-green-300 font-medium">LIVE</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Personas</span>
          <span className="text-3xl font-bold text-blue-600 dark:text-green-400 block mt-2">{live.personas}</span>
          <Link to="/persona-training" className="mt-3 text-sm text-blue-600 dark:text-green-400 hover:underline inline-block">Manage →</Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">👥</span>
            <span className="text-xs text-green-600 dark:text-green-300 font-medium">LIVE</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Leads</span>
          <span className="text-3xl font-bold text-blue-600 dark:text-green-400 block mt-2">{live.leads}</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Qualified: {live.qualified}</span>
          <Link to="/lead-management" className="mt-2 text-sm text-blue-600 dark:text-green-400 hover:underline inline-block">View →</Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">📈</span>
            <span className="text-xs text-green-600 dark:text-green-300 font-medium">LIVE</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Campaigns</span>
          <span className="text-3xl font-bold text-blue-600 dark:text-green-400 block mt-2">{live.campaigns}</span>
          <Link to="/campaign-management" className="mt-3 text-sm text-blue-600 dark:text-green-400 hover:underline inline-block">Manage →</Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">🧠</span>
            <span className="text-xs text-green-600 dark:text-green-300 font-medium">LIVE</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Vector DB</span>
          <span className="text-3xl font-bold text-blue-600 dark:text-green-400 block mt-2">{live.vectorDB}</span>
          <Link to="/vector-database" className="mt-3 text-sm text-blue-600 dark:text-green-400 hover:underline inline-block">Status →</Link>
        </div>
      </div>
      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Revenue</span>
            <span className="text-xs text-green-600 dark:text-green-300 font-medium">LIVE</span>
          </div>
          <span className="text-3xl font-bold text-blue-600 dark:text-green-400 mb-4 block">£{live.revenue.toLocaleString()}</span>
          <DummyChart />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Meetings</span>
            <span className="text-xs text-green-600 dark:text-green-300 font-medium">LIVE</span>
          </div>
          <span className="text-3xl font-bold text-blue-600 dark:text-green-400 mb-4 block">{live.meetings}</span>
          <DummyChart />
        </div>
      </div>
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link 
          to="/persona-training" 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all font-medium"
        >
          Train Persona
        </Link>
        <Link 
          to="/lead-management" 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all font-medium"
        >
          Add Lead
        </Link>
        <Link 
          to="/campaign-management" 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all font-medium"
        >
          New Campaign
        </Link>
        <Link 
          to="/vector-database" 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all font-medium"
        >
          Vector DB
        </Link>
      </div>
    </div>
  );
};

export default HomeDashboard; 