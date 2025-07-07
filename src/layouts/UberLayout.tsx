import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const sidebarItems = [
  { icon: '🏠', label: 'Home', path: '/' },
  { icon: '🚀', label: 'Enhanced Campaigns', path: '/enhanced-campaign-management' },
  { icon: '💰', label: 'Billing Management', path: '/billing-management' },
  { icon: '🕷️', label: 'Web Scraping', path: '/web-scraping-management' },
  { icon: '👤', label: 'Enhanced Personas', path: '/enhanced-persona-training' },
  { icon: '📊', label: 'Analytics', path: '/staff-analytics' },
  { icon: '🧠', label: 'Vector DB', path: '/vector-database' },
  { icon: '🛡️', label: 'AI Safety', path: '/ai-safety' },
  { icon: '📋', label: 'Lead Management', path: '/lead-management' },
  { icon: '🎯', label: 'Lead Qualification', path: '/lead-qualification' },
  { icon: '📞', label: 'Phone Numbers', path: '/phone-numbers' },
  { icon: '💬', label: 'Testing Chat', path: '/testing-chat' },
  { icon: '📥', label: 'Data Ingestion', path: '/data-ingestion' },
  { icon: '🔍', label: 'Customer Enrichment', path: '/customer-enrichment' },
  { icon: '📈', label: 'Customer Analytics', path: '/customer-analytics' },
  { icon: '👥', label: 'Client Management', path: '/client-management' },
  { icon: '🎓', label: 'Advanced Training', path: '/advanced-training' },
  { icon: '🔄', label: 'Sales Training', path: '/sales-training' },
  { icon: '⚙️', label: 'Settings', path: '/database-config' },
  { icon: '📊', label: 'Live Data', path: '/live-data' },
  { icon: '🛡️', label: 'Advanced AI Safety', path: '/advanced-ai-safety' },
  { icon: '🎯', label: 'Manual Training', path: '/manual-training' },
  { icon: '👥', label: 'Staff Dashboard', path: '/staff-dashboard' },
  { icon: '🧮', label: 'ROI Calculator', path: '/roi-calculator' }
];

const UberLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`flex h-screen bg-green-50 dark:bg-gray-900 transition-colors duration-300`}>
      {/* Sidebar */}
      <div className={`flex flex-col py-4 px-3 bg-white dark:bg-gray-900 border-r border-green-200 dark:border-green-700 text-gray-700 dark:text-gray-200 w-64 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} shadow-sm`}>
        <button
          className="mb-6 focus:outline-none self-end"
          onClick={() => setSidebarOpen((v) => !v)}
          title={sidebarOpen ? 'Collapse' : 'Expand'}
        >
          <span className="text-xl">☰</span>
        </button>
        {sidebarItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center w-full mb-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
              location.pathname === item.path 
                ? 'bg-green-50 dark:bg-green-800/30 text-green-600 dark:text-white' 
                : 'hover:bg-green-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-200'
            }`}
            title={item.label}
          >
            <span className="text-xl mr-3">{item.icon}</span>
            {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        ))}
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 shadow-sm border-b border-green-200 dark:border-green-700">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-green-700 dark:text-white">ReGenAI</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode((v) => !v)}
              className="p-2 rounded-lg bg-green-100 dark:bg-gray-800 hover:bg-green-200 dark:hover:bg-gray-700 transition-colors"
              title="Toggle dark mode"
            >
              {darkMode ? <span className="text-yellow-400">🌙</span> : <span className="text-green-700">☀️</span>}
            </button>
            <button className="p-2 rounded-lg bg-green-100 dark:bg-gray-800 hover:bg-green-200 dark:hover:bg-gray-700 transition-colors" title="Notifications">
              <span className="text-lg">🔔</span>
            </button>
            <button className="p-2 rounded-lg bg-green-100 dark:bg-gray-800 hover:bg-green-200 dark:hover:bg-gray-700 transition-colors" title="Profile">
              <span className="text-lg">👤</span>
            </button>
          </div>
        </div>
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-green-50 dark:bg-gray-900 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UberLayout; 