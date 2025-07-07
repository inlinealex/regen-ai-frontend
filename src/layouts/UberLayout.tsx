import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const sidebarItems = [
  { icon: '🏠', label: 'Home', path: '/' },
  { icon: '👤', label: 'Personas', path: '/persona-training' },
  { icon: '📚', label: 'Instruction Sets', path: '/instruction-sets' },
  { icon: '📈', label: 'Campaigns', path: '/campaign-management' },
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
  { icon: '🎓', label: 'Advanced Training', path: '/advanced-training' },
  { icon: '🔄', label: 'Sales Training', path: '/sales-training' },
  { icon: '⚙️', label: 'Settings', path: '/database-config' },
  { icon: '🚀', label: 'Enhanced Training', path: '/enhanced-persona-training' },
  { icon: '📊', label: 'Live Data', path: '/live-data' },
  { icon: '🛡️', label: 'Advanced AI Safety', path: '/advanced-ai-safety' },
  { icon: '🎯', label: 'Manual Training', path: '/manual-training' },
  { icon: '👥', label: 'Staff Dashboard', path: '/staff-dashboard' }
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
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}>
      {/* Sidebar */}
      <div className={`flex flex-col py-4 px-3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 w-64 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} shadow-sm`}>
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
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
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
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-gray-900 dark:text-white">ReGenAI</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode((v) => !v)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Toggle dark mode"
            >
              {darkMode ? <span className="text-yellow-500">🌙</span> : <span className="text-gray-700">☀️</span>}
            </button>
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Notifications">
              <span className="text-lg">🔔</span>
            </button>
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Profile">
              <span className="text-lg">👤</span>
            </button>
          </div>
        </div>
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UberLayout; 