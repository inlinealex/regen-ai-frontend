import React, { useState, useEffect } from 'react';

interface Client {
  id: string;
  name: string;
  apiKey: string;
  email: string;
  dataSiloId: string;
  isolationLevel: 'strict' | 'moderate' | 'minimal';
  createdAt: string;
  settings: {
    dataRetention: {
      leads: number;
      conversations: number;
      analytics: number;
    };
    accessControl: {
      roles: string[];
      permissions: string[];
    };
  };
}

interface Lead {
  id: string;
  clientId: string;
  sourceId: string;
  sourceType: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  jobTitle?: string;
  industry?: string;
  status: 'new' | 'qualified' | 'contacted' | 'converted' | 'lost';
  score?: number;
  data?: any;
  metadata?: any;
  aiAnalysis?: any;
  createdAt: string;
  updatedAt: string;
}

interface LeadFilters {
  clientId: string;
  status: 'all' | 'new' | 'qualified' | 'contacted' | 'converted' | 'lost';
  sourceType: 'all' | 'crm' | 'email' | 'csv' | 'manual';
  dateRange: 'all' | 'today' | 'week' | 'month';
  scoreRange: [number, number];
}

const LeadManagementDashboard: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [filters, setFilters] = useState<LeadFilters>({
    clientId: '',
    status: 'all',
    sourceType: 'all',
    dateRange: 'all',
    scoreRange: [0, 100]
  });
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('list');
  const [showDataSiloInfo, setShowDataSiloInfo] = useState(false);

  const API_BASE = 'http://localhost:3000/api';

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadLeadsForClient(selectedClient);
    }
  }, [selectedClient]);

  useEffect(() => {
    applyFilters();
  }, [leads, filters]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/customers`);
      const data = await response.json();
      if (data.success) {
        setClients(data.customers);
        if (data.customers.length > 0) {
          setSelectedClient(data.customers[0].id);
          setFilters(prev => ({ ...prev, clientId: data.customers[0].id }));
        }
      }
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeadsForClient = async (clientId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/customers/${clientId}/leads`);
      const data = await response.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...leads];

    if (filters.status !== 'all') {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }

    if (filters.sourceType !== 'all') {
      filtered = filtered.filter(lead => lead.sourceType === filters.sourceType);
    }

    if (filters.scoreRange[0] > 0 || filters.scoreRange[1] < 100) {
      filtered = filtered.filter(lead => 
        lead.score && lead.score >= filters.scoreRange[0] && lead.score <= filters.scoreRange[1]
      );
    }

    setFilteredLeads(filtered);
  };

  const getStatusColor = (status: Lead['status']) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      qualified: 'bg-green-100 text-green-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      converted: 'bg-purple-100 text-purple-800',
      lost: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIsolationLevelColor = (level: string) => {
    const colors = {
      strict: 'bg-red-100 text-red-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      minimal: 'bg-green-100 text-green-800'
    };
    return colors[level as keyof typeof colors];
  };

  const selectedClientData = clients.find(c => c.id === selectedClient);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Client Lead Management</h1>
              <p className="mt-2 text-gray-600">Manage leads for each client with data isolation</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDataSiloInfo(!showDataSiloInfo)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Data Silo Info
              </button>
              <button
                onClick={() => loadLeadsForClient(selectedClient)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Client Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Client</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clients.map(client => (
              <div
                key={client.id}
                onClick={() => {
                  setSelectedClient(client.id);
                  setFilters(prev => ({ ...prev, clientId: client.id }));
                }}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedClient === client.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-600">{client.email}</p>
                    <p className="text-xs text-gray-500">Created: {new Date(client.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getIsolationLevelColor(client.isolationLevel)}`}>
                    {client.isolationLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Silo Information */}
        {showDataSiloInfo && selectedClientData && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Silo Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Isolation Settings</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Isolation Level:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getIsolationLevelColor(selectedClientData.isolationLevel)}`}>
                      {selectedClientData.isolationLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Data Silo ID:</span>
                    <span className="text-sm font-mono text-gray-900">{selectedClientData.dataSiloId}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Data Retention</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Leads:</span>
                    <span className="text-sm text-gray-900">{selectedClientData.settings.dataRetention.leads} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Conversations:</span>
                    <span className="text-sm text-gray-900">{selectedClientData.settings.dataRetention.conversations} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Analytics:</span>
                    <span className="text-sm text-gray-900">{selectedClientData.settings.dataRetention.analytics} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
            <p className="text-3xl font-bold text-gray-900">{leads.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Qualified</h3>
            <p className="text-3xl font-bold text-green-600">
              {leads.filter(l => l.status === 'qualified').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Converted</h3>
            <p className="text-3xl font-bold text-purple-600">
              {leads.filter(l => l.status === 'converted').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Avg Score</h3>
            <p className="text-3xl font-bold text-blue-600">
              {leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length) : 0}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="qualified">Qualified</option>
                <option value="contacted">Contacted</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source Type</label>
              <select
                value={filters.sourceType}
                onChange={(e) => setFilters(prev => ({ ...prev, sourceType: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sources</option>
                <option value="crm">CRM</option>
                <option value="email">Email</option>
                <option value="csv">CSV</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Score Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.scoreRange[0]}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    scoreRange: [parseInt(e.target.value), prev.scoreRange[1]] 
                  }))}
                  className="w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Min"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.scoreRange[1]}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    scoreRange: [prev.scoreRange[0], parseInt(e.target.value)] 
                  }))}
                  className="w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedLeads.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-blue-800">
                {selectedLeads.length} lead(s) selected
              </span>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                  Mark Qualified
                </button>
                <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                  Mark Lost
                </button>
                <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                  Mark Converted
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                viewMode === 'kanban'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Kanban View
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredLeads.length} of {leads.length} leads
          </div>
        </div>

        {/* Leads Display */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeads(filteredLeads.map(l => l.id));
                        } else {
                          setSelectedLeads([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeads([...selectedLeads, lead.id]);
                          } else {
                            setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.company}</div>
                      {lead.jobTitle && (
                        <div className="text-sm text-gray-500">{lead.jobTitle}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.score ? (
                        <span className={`text-sm font-medium ${getScoreColor(lead.score)}`}>
                          {lead.score}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {lead.sourceType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{lead.name}</h3>
                    <p className="text-sm text-gray-600">{lead.email}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLeads([...selectedLeads, lead.id]);
                      } else {
                        setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Company:</span>
                    <p className="text-sm text-gray-900">{lead.company}</p>
                  </div>
                  {lead.jobTitle && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Title:</span>
                      <p className="text-sm text-gray-900">{lead.jobTitle}</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                    {lead.score && (
                      <span className={`text-sm font-medium ${getScoreColor(lead.score)}`}>
                        {lead.score}%
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {['new', 'qualified', 'contacted', 'converted', 'lost'].map((status) => (
              <div key={status} className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                  {status} ({filteredLeads.filter(l => l.status === status).length})
                </h3>
                <div className="space-y-3">
                  {filteredLeads
                    .filter(lead => lead.status === status)
                    .map((lead) => (
                      <div key={lead.id} className="bg-gray-50 rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{lead.name}</h4>
                            <p className="text-xs text-gray-600">{lead.company}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLeads([...selectedLeads, lead.id]);
                              } else {
                                setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>{lead.email}</p>
                          {lead.score && (
                            <p className={`font-medium ${getScoreColor(lead.score)}`}>
                              Score: {lead.score}%
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadManagementDashboard; 