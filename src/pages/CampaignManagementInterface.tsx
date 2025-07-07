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

interface Campaign {
  id: string;
  clientId: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft' | 'completed';
  type: 'lead-qualification' | 'follow-up' | 'retention' | 'reactivation' | 'whatsapp' | 'voice';
  targetAudience: {
    industries: string[];
    companySizes: string[];
    regions: string[];
    leadStages: string[];
    customFilters: any[];
  };
  personas: {
    primary: string;
    fallback: string;
    dynamic: boolean;
    switchTriggers: string[];
  };
  communication: {
    channels: ('email' | 'sms' | 'whatsapp' | 'voice')[];
    frequency: {
      maxMessagesPerDay: number;
      maxMessagesPerWeek: number;
      businessHoursOnly: boolean;
    };
    templates: {
      email: string[];
      sms: string[];
      whatsapp: string[];
      voice: string[];
    };
  };
  dataSilo: {
    id: string;
    name: string;
    description: string;
    isolationLevel: 'strict' | 'moderate' | 'minimal';
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
  performance: {
    metrics: {
      totalLeads: number;
      qualifiedLeads: number;
      conversionRate: number;
      responseRate: number;
      averageResponseTime: number;
    };
    goals: {
      targetLeads: number;
      targetConversionRate: number;
      targetResponseRate: number;
    };
  };
  schedule: {
    startDate: Date;
    endDate?: Date;
    timezone: string;
    businessHours: {
      start: string;
      end: string;
      daysOfWeek: number[];
    };
  };
  budget: {
    total: number;
    spent: number;
    dailyLimit: number;
    costPerLead: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface CampaignFilters {
  clientId: string;
  status: 'all' | 'active' | 'paused' | 'draft' | 'completed';
  type: 'all' | 'lead-qualification' | 'follow-up' | 'retention' | 'reactivation' | 'whatsapp' | 'voice';
  dateRange: 'all' | 'today' | 'week' | 'month';
}

const CampaignManagementInterface: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [filters, setFilters] = useState<CampaignFilters>({
    clientId: '',
    status: 'all',
    type: 'all',
    dateRange: 'all'
  });
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showDataSiloInfo, setShowDataSiloInfo] = useState(false);

  const API_BASE = 'http://localhost:3000/api';

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadCampaignsForClient(selectedClient);
    }
  }, [selectedClient]);

  useEffect(() => {
    applyFilters();
  }, [campaigns, filters]);

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

  const loadCampaignsForClient = async (clientId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/customers/${clientId}/campaigns`);
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...campaigns];

    if (filters.status !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === filters.status);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(campaign => campaign.type === filters.type);
    }

    setFilteredCampaigns(filtered);
  };

  const getStatusColor = (status: Campaign['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status];
  };

  const getTypeColor = (type: Campaign['type']) => {
    const colors = {
      'lead-qualification': 'bg-purple-100 text-purple-800',
      'follow-up': 'bg-blue-100 text-blue-800',
      'retention': 'bg-green-100 text-green-800',
      'reactivation': 'bg-orange-100 text-orange-800',
      'whatsapp': 'bg-green-100 text-green-800',
      'voice': 'bg-red-100 text-red-800'
    };
    return colors[type];
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
              <h1 className="text-3xl font-bold text-gray-900">Client Campaign Management</h1>
              <p className="mt-2 text-gray-600">Manage campaigns for each client with data isolation</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDataSiloInfo(!showDataSiloInfo)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Data Silo Info
              </button>
              <button
                onClick={() => setShowCreateCampaign(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Campaign
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
            <h3 className="text-sm font-medium text-gray-500">Total Campaigns</h3>
            <p className="text-3xl font-bold text-gray-900">{campaigns.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Active</h3>
            <p className="text-3xl font-bold text-green-600">
              {campaigns.filter(c => c.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
            <p className="text-3xl font-bold text-blue-600">
              {campaigns.reduce((sum, c) => sum + c.performance.metrics.totalLeads, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Avg Conversion</h3>
            <p className="text-3xl font-bold text-purple-600">
              {campaigns.length > 0 
                ? Math.round(campaigns.reduce((sum, c) => sum + c.performance.metrics.conversionRate, 0) / campaigns.length)
                : 0}%
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="lead-qualification">Lead Qualification</option>
                <option value="follow-up">Follow-up</option>
                <option value="retention">Retention</option>
                <option value="reactivation">Reactivation</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="voice">Voice</option>
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
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
                  <p className="text-sm text-gray-600">{campaign.description}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(campaign.type)}`}>
                    {campaign.type}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Target Audience:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {campaign.targetAudience.industries.slice(0, 2).map((industry, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {industry}
                      </span>
                    ))}
                    {campaign.targetAudience.industries.length > 2 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        +{campaign.targetAudience.industries.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700">Channels:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {campaign.communication.channels.map((channel, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Total Leads:</span>
                    <p className="text-sm text-gray-900">{campaign.performance.metrics.totalLeads}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Conversion:</span>
                    <p className="text-sm text-gray-900">{campaign.performance.metrics.conversionRate}%</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Response Rate:</span>
                    <p className="text-sm text-gray-900">{campaign.performance.metrics.responseRate}%</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Budget Spent:</span>
                    <p className="text-sm text-gray-900">${campaign.budget.spent.toLocaleString()}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Created: {new Date(campaign.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                        Edit
                      </button>
                      <button className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Campaign Modal */}
        {showCreateCampaign && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Campaign</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter campaign name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="lead-qualification">Lead Qualification</option>
                      <option value="follow-up">Follow-up</option>
                      <option value="retention">Retention</option>
                      <option value="reactivation">Reactivation</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="voice">Voice</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter campaign description"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowCreateCampaign(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Create Campaign
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignManagementInterface; 