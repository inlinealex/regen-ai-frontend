import React, { useState, useEffect } from 'react';

interface EnrichmentData {
  id: string;
  leadId: string;
  leadName: string;
  company: string;
  enrichmentType: 'qualification' | 'sentiment' | 'risk' | 'interaction' | 'opportunity';
  enrichmentData: any;
  confidence: number;
  lastUpdated: string;
  source: string;
}

interface CRMIntegration {
  id: string;
  name: string;
  type: 'pipedrive' | 'hubspot' | 'salesforce' | 'custom';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  syncStatus: 'success' | 'failed' | 'pending';
  fields: CRMField[];
}

interface CRMField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  mappedTo: string;
  required: boolean;
  custom: boolean;
}

const CustomerDataEnrichment: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentData[]>([]);
  const [crmIntegrations, setCrmIntegrations] = useState<CRMIntegration[]>([]);
  const [selectedEnrichment, setSelectedEnrichment] = useState<EnrichmentData | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState(0);
  const [filters, setFilters] = useState({
    type: 'all',
    confidence: [0, 100],
    dateRange: 'last_30_days'
  });

  const API_BASE = 'http://localhost:3000/api';

  useEffect(() => {
    loadEnrichmentData();
    loadCRMIntegrations();
  }, []);

  const loadEnrichmentData = async () => {
    try {
      const response = await fetch(`${API_BASE}/customer-enrichment/data`);
      const data = await response.json();
      if (data.success) {
        setEnrichmentData(data.enrichmentData);
      }
    } catch (error) {
      console.error('Failed to load enrichment data:', error);
    }
  };

  const loadCRMIntegrations = async () => {
    try {
      const response = await fetch(`${API_BASE}/customer-enrichment/crm-integrations`);
      const data = await response.json();
      if (data.success) {
        setCrmIntegrations(data.integrations);
      }
    } catch (error) {
      console.error('Failed to load CRM integrations:', error);
    }
  };

  const enrichCustomerData = async (leadIds: string[]) => {
    setIsEnriching(true);
    setEnrichmentProgress(0);

    try {
      // Simulate enrichment process
      for (let i = 0; i <= 100; i += 10) {
        setEnrichmentProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const response = await fetch(`${API_BASE}/customer-enrichment/enrich`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds })
      });

      const result = await response.json();
      if (result.success) {
        setEnrichmentData(prev => [...prev, ...result.enrichmentData]);
      }
    } catch (error) {
      console.error('Enrichment failed:', error);
    } finally {
      setIsEnriching(false);
      setEnrichmentProgress(0);
    }
  };

  const syncToCRM = async (integrationId: string, enrichmentData: EnrichmentData[]) => {
    try {
      const response = await fetch(`${API_BASE}/customer-enrichment/sync-crm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId, enrichmentData })
      });

      const result = await response.json();
      if (result.success) {
        // Update integration status
        setCrmIntegrations(prev => prev.map(integration => 
          integration.id === integrationId ? { ...integration, lastSync: new Date().toISOString(), syncStatus: 'success' } : integration
        ));
      }
    } catch (error) {
      console.error('CRM sync failed:', error);
    }
  };

  const getEnrichmentTypeColor = (type: string) => {
    switch (type) {
      case 'qualification': return 'bg-blue-100 text-blue-800';
      case 'sentiment': return 'bg-green-100 text-green-800';
      case 'risk': return 'bg-red-100 text-red-800';
      case 'interaction': return 'bg-purple-100 text-purple-800';
      case 'opportunity': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCRMStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-gray-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer Data Enrichment</h1>
                <p className="text-gray-600 mt-1">
                  Enrich your CRM data with advanced qualification insights, sentiment analysis, and risk assessments
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Enriched Records: <span className="font-semibold">{enrichmentData.length}</span>
                </div>
                <div className="text-sm text-gray-500">
                  CRM Integrations: <span className="font-semibold text-green-600">
                    {crmIntegrations.filter(i => i.status === 'connected').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Enrichment Overview', icon: '📊' },
                { id: 'data', name: 'Enrichment Data', icon: '🔍' },
                { id: 'crm', name: 'CRM Integration', icon: '🔗' },
                { id: 'exports', name: 'Data Exports', icon: '📤' },
                { id: 'analytics', name: 'Enrichment Analytics', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Enrichment Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <span className="text-2xl">🔍</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Qualification Insights</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {enrichmentData.filter(d => d.enrichmentType === 'qualification').length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <span className="text-2xl">😊</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Sentiment Analysis</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {enrichmentData.filter(d => d.enrichmentType === 'sentiment').length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <span className="text-2xl">⚠️</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Risk Assessments</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {enrichmentData.filter(d => d.enrichmentType === 'risk').length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <span className="text-2xl">📈</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Opportunity Scores</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {enrichmentData.filter(d => d.enrichmentType === 'opportunity').length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => enrichCustomerData(['lead_1', 'lead_2', 'lead_3'])}
                      disabled={isEnriching}
                      className="bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isEnriching ? 'Enriching...' : 'Enrich Selected Leads'}
                    </button>
                    <button
                      onClick={() => syncToCRM('crm_1', enrichmentData.slice(0, 5))}
                      className="bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Sync to CRM
                    </button>
                    <button className="bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 transition-colors">
                      Export Enrichment Data
                    </button>
                  </div>
                </div>

                {/* Recent Enrichments */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Enrichments</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lead
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Confidence
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Updated
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {enrichmentData.slice(0, 5).map((enrichment) => (
                          <tr key={enrichment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{enrichment.leadName}</div>
                                <div className="text-sm text-gray-500">{enrichment.company}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEnrichmentTypeColor(enrichment.enrichmentType)}`}>
                                {enrichment.enrichmentType}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${getConfidenceColor(enrichment.confidence)}`}>
                                {enrichment.confidence}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(enrichment.lastUpdated).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => setSelectedEnrichment(enrichment)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                View
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                Export
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrichment Data Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Enrichment Type</label>
                      <select
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="all">All Types</option>
                        <option value="qualification">Qualification</option>
                        <option value="sentiment">Sentiment</option>
                        <option value="risk">Risk</option>
                        <option value="interaction">Interaction</option>
                        <option value="opportunity">Opportunity</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confidence Range</label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={filters.confidence[0]}
                          onChange={(e) => setFilters(prev => ({ 
                            ...prev, 
                            confidence: [parseInt(e.target.value), prev.confidence[1]] 
                          }))}
                          className="w-20 border border-gray-300 rounded-md px-2 py-2 text-sm"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={filters.confidence[1]}
                          onChange={(e) => setFilters(prev => ({ 
                            ...prev, 
                            confidence: [prev.confidence[0], parseInt(e.target.value)] 
                          }))}
                          className="w-20 border border-gray-300 rounded-md px-2 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                      <select
                        value={filters.dateRange}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="last_7_days">Last 7 Days</option>
                        <option value="last_30_days">Last 30 Days</option>
                        <option value="last_90_days">Last 90 Days</option>
                        <option value="all">All Time</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Enrichment Data Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lead
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Enrichment Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Confidence
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Source
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Updated
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {enrichmentData.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                              No enrichment data found. Run enrichment to see data.
                            </td>
                          </tr>
                        ) : (
                          enrichmentData.map((enrichment) => (
                            <tr key={enrichment.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{enrichment.leadName}</div>
                                  <div className="text-sm text-gray-500">{enrichment.company}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEnrichmentTypeColor(enrichment.enrichmentType)}`}>
                                  {enrichment.enrichmentType}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className={`text-sm font-medium ${getConfidenceColor(enrichment.confidence)}`}>
                                    {enrichment.confidence}%
                                  </span>
                                  <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        enrichment.confidence >= 80 ? 'bg-green-500' :
                                        enrichment.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${enrichment.confidence}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {enrichment.source}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(enrichment.lastUpdated).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => setSelectedEnrichment(enrichment)}
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                  View Details
                                </button>
                                <button className="text-green-600 hover:text-green-900">
                                  Export
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'crm' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">CRM Integrations</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Add CRM Integration
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {crmIntegrations.map((integration) => (
                    <div key={integration.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">{integration.name}</h4>
                        <span className={`text-sm font-medium ${getCRMStatusColor(integration.status)}`}>
                          {integration.status}
                        </span>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="text-gray-900">{integration.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Sync:</span>
                          <span className="text-gray-900">
                            {new Date(integration.lastSync).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sync Status:</span>
                          <span className={`font-medium ${
                            integration.syncStatus === 'success' ? 'text-green-600' :
                            integration.syncStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {integration.syncStatus}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mapped Fields:</span>
                          <span className="text-gray-900">{integration.fields.length}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => syncToCRM(integration.id, enrichmentData.slice(0, 10))}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                        >
                          Sync Now
                        </button>
                        <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                          Configure
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'exports' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export Options</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900">Export Formats</h4>
                      <div className="space-y-2">
                        <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors">
                          Export to CSV
                        </button>
                        <button className="w-full bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors">
                          Export to JSON
                        </button>
                        <button className="w-full bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 transition-colors">
                          Export to Excel
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900">Export Types</h4>
                      <div className="space-y-2">
                        <button className="w-full bg-gray-600 text-white px-4 py-3 rounded-md hover:bg-gray-700 transition-colors">
                          Qualification Data
                        </button>
                        <button className="w-full bg-gray-600 text-white px-4 py-3 rounded-md hover:bg-gray-700 transition-colors">
                          Sentiment Analysis
                        </button>
                        <button className="w-full bg-gray-600 text-white px-4 py-3 rounded-md hover:bg-gray-700 transition-colors">
                          Risk Assessments
                        </button>
                        <button className="w-full bg-gray-600 text-white px-4 py-3 rounded-md hover:bg-gray-700 transition-colors">
                          All Enrichment Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Total Enrichments</h4>
                    <p className="text-2xl font-bold text-gray-900">{enrichmentData.length}</p>
                    <p className="text-xs text-green-600">+12% from last month</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Average Confidence</h4>
                    <p className="text-2xl font-bold text-gray-900">
                      {enrichmentData.length > 0 ? Math.round(enrichmentData.reduce((sum, d) => sum + d.confidence, 0) / enrichmentData.length) : 0}%
                    </p>
                    <p className="text-xs text-green-600">+5% from last month</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">CRM Sync Success</h4>
                    <p className="text-2xl font-bold text-gray-900">94.2%</p>
                    <p className="text-xs text-green-600">+2.1% from last month</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrichment Analytics</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Chart visualization would go here</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enrichment Detail Modal */}
      {selectedEnrichment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Enrichment Details</h3>
              <button
                onClick={() => setSelectedEnrichment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lead Name</label>
                  <p className="text-sm text-gray-900">{selectedEnrichment.leadName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <p className="text-sm text-gray-900">{selectedEnrichment.company}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enrichment Type</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEnrichmentTypeColor(selectedEnrichment.enrichmentType)}`}>
                    {selectedEnrichment.enrichmentType}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confidence</label>
                  <p className={`text-sm font-medium ${getConfidenceColor(selectedEnrichment.confidence)}`}>
                    {selectedEnrichment.confidence}%
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enrichment Data</label>
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="text-sm text-gray-900 overflow-auto">
                    {JSON.stringify(selectedEnrichment.enrichmentData, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedEnrichment(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDataEnrichment; 