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

interface InstructionSet {
  id: string;
  clientId: string;
  name: string;
  description: string;
  category: 'lead-qualification' | 'objection-handling' | 'closing' | 'follow-up' | 'product-knowledge' | 'competitive-intelligence';
  instructions: string[];
  trainingRules: TrainingRule[];
  performanceMetrics: {
    accuracy: number;
    responseTime: number;
    conversionRate: number;
    customerSatisfaction: number;
    lastUpdated: string;
  };
  trainingStatus: 'idle' | 'training' | 'completed' | 'failed';
  lastTrainingSession: string;
  trainingData: {
    totalExamples: number;
    positiveExamples: number;
    negativeExamples: number;
    customRules: number;
  };
}

interface TrainingRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'communication' | 'qualification' | 'objection-handling' | 'closing' | 'follow-up';
  conditions: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_list';
    value: any;
  }[];
  actions: {
    type: 'respond' | 'qualify' | 'disqualify' | 'escalate' | 'schedule';
    value: any;
    confidence: number;
  }[];
  priority: number;
  trainingExamples: TrainingExample[];
}

interface TrainingExample {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  isPositive: boolean;
  confidence: number;
  feedback?: string;
  timestamp: string;
}

interface TrainingSession {
  id: string;
  clientId: string;
  instructionSetId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  progress: number;
  metrics: {
    examplesProcessed: number;
    accuracy: number;
    improvements: number;
    newRules: number;
  };
  errors: string[];
}

interface InstructionSetTrainingFilters {
  clientId: string;
  status: 'all' | 'idle' | 'training' | 'completed' | 'failed';
  category: 'all' | 'lead-qualification' | 'objection-handling' | 'closing' | 'follow-up' | 'product-knowledge' | 'competitive-intelligence';
  dateRange: 'all' | 'today' | 'week' | 'month';
}

const InstructionSetTraining: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [instructionSets, setInstructionSets] = useState<InstructionSet[]>([]);
  const [filteredInstructionSets, setFilteredInstructionSets] = useState<InstructionSet[]>([]);
  const [filters, setFilters] = useState<InstructionSetTrainingFilters>({
    clientId: '',
    status: 'all',
    category: 'all',
    dateRange: 'all'
  });
  const [selectedInstructionSet, setSelectedInstructionSet] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'automated-training' | 'training-rules' | 'training-sessions' | 'performance'>('overview');
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [showDataSiloInfo, setShowDataSiloInfo] = useState(false);
  const [selectedRule, setSelectedRule] = useState<TrainingRule | null>(null);

  const API_BASE = 'http://localhost:3000/api';

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadInstructionSetsForClient(selectedClient);
      loadTrainingSessionsForClient(selectedClient);
    }
  }, [selectedClient]);

  useEffect(() => {
    applyFilters();
  }, [instructionSets, filters]);

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

  const loadInstructionSetsForClient = async (clientId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/customers/${clientId}/instruction-sets`);
      const data = await response.json();
      if (data.success) {
        setInstructionSets(data.instructionSets);
      }
    } catch (error) {
      console.error('Failed to load instruction sets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrainingSessionsForClient = async (clientId: string) => {
    try {
      const response = await fetch(`${API_BASE}/customers/${clientId}/instruction-training-sessions`);
      const data = await response.json();
      if (data.success) {
        setTrainingSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to load training sessions:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...instructionSets];

    if (filters.status !== 'all') {
      filtered = filtered.filter(instructionSet => instructionSet.trainingStatus === filters.status);
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(instructionSet => instructionSet.category === filters.category);
    }

    setFilteredInstructionSets(filtered);
  };

  const startAutomatedTraining = async (instructionSetId: string) => {
    try {
      const response = await fetch(`${API_BASE}/customers/${selectedClient}/instruction-sets/${instructionSetId}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        loadInstructionSetsForClient(selectedClient);
        loadTrainingSessionsForClient(selectedClient);
      }
    } catch (error) {
      console.error('Failed to start training:', error);
    }
  };

  const getStatusColor = (status: InstructionSet['trainingStatus']) => {
    const colors = {
      idle: 'bg-gray-100 text-gray-800',
      training: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getCategoryColor = (category: InstructionSet['category']) => {
    const colors = {
      'lead-qualification': 'bg-blue-100 text-blue-800',
      'objection-handling': 'bg-orange-100 text-orange-800',
      'closing': 'bg-purple-100 text-purple-800',
      'follow-up': 'bg-green-100 text-green-800',
      'product-knowledge': 'bg-yellow-100 text-yellow-800',
      'competitive-intelligence': 'bg-red-100 text-red-800'
    };
    return colors[category];
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
              <h1 className="text-3xl font-bold text-gray-900">Automated Instruction Set Training</h1>
              <p className="mt-2 text-gray-600">Train AI instruction sets with configurable rules and automated learning</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDataSiloInfo(!showDataSiloInfo)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Data Silo Info
              </button>
              <button
                onClick={() => setShowCreateRule(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Training Rule
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

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'automated-training', name: 'Automated Training' },
              { id: 'training-rules', name: 'Training Rules' },
              { id: 'training-sessions', name: 'Training Sessions' },
              { id: 'performance', name: 'Performance' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Instruction Sets</h3>
                <p className="text-3xl font-bold text-gray-900">{instructionSets.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Training</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {instructionSets.filter(i => i.trainingStatus === 'training').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Avg Accuracy</h3>
                <p className="text-3xl font-bold text-green-600">
                  {instructionSets.length > 0 ? Math.round(instructionSets.reduce((sum, i) => sum + i.performanceMetrics.accuracy, 0) / instructionSets.length) : 0}%
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Active Rules</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {instructionSets.reduce((sum, i) => sum + i.trainingRules.filter(r => r.enabled).length, 0)}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
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
                    <option value="idle">Idle</option>
                    <option value="training">Training</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="lead-qualification">Lead Qualification</option>
                    <option value="objection-handling">Objection Handling</option>
                    <option value="closing">Closing</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="product-knowledge">Product Knowledge</option>
                    <option value="competitive-intelligence">Competitive Intelligence</option>
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

            {/* Instruction Sets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstructionSets.map((instructionSet) => (
                <div key={instructionSet.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{instructionSet.name}</h3>
                      <p className="text-sm text-gray-600">{instructionSet.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(instructionSet.trainingStatus)}`}>
                        {instructionSet.trainingStatus}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(instructionSet.category)}`}>
                        {instructionSet.category}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Instructions:</span>
                      <p className="text-sm text-gray-900">{instructionSet.instructions.length} rules</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Accuracy:</span>
                        <p className="text-sm text-gray-900">{instructionSet.performanceMetrics.accuracy}%</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Conversion:</span>
                        <p className="text-sm text-gray-900">{instructionSet.performanceMetrics.conversionRate}%</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Rules:</span>
                        <p className="text-sm text-gray-900">{instructionSet.trainingRules.filter(r => r.enabled).length} active</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Examples:</span>
                        <p className="text-sm text-gray-900">{instructionSet.trainingData.totalExamples}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Updated: {new Date(instructionSet.performanceMetrics.lastUpdated).toLocaleDateString()}
                        </span>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => startAutomatedTraining(instructionSet.id)}
                            disabled={instructionSet.trainingStatus === 'training'}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                          >
                            {instructionSet.trainingStatus === 'training' ? 'Training...' : 'Train'}
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
          </div>
        )}

        {/* Automated Training Tab */}
        {activeTab === 'automated-training' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Automated Training Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Training Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Auto-training Frequency</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="manual">Manual Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Training Data Threshold</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Minimum examples needed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Accuracy Improvement Target</label>
                      <input
                        type="number"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Minimum % improvement"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Training Rules</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Learn from successful conversations</p>
                        <p className="text-sm text-gray-600">Extract patterns from high-conversion interactions</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Adapt to objection patterns</p>
                        <p className="text-sm text-gray-600">Learn from common objections and responses</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Optimize response timing</p>
                        <p className="text-sm text-gray-600">Learn optimal response delays and frequency</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Personalize based on lead data</p>
                        <p className="text-sm text-gray-600">Adapt responses to company size, industry, etc.</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Training Rules Tab */}
        {activeTab === 'training-rules' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Training Rules</h2>
              <button
                onClick={() => setShowCreateRule(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Rule
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {instructionSets.flatMap(instructionSet => instructionSet.trainingRules).map((rule) => (
                <div key={rule.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{rule.name}</h3>
                      <p className="text-sm text-gray-600">{rule.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {rule.category}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Conditions:</span>
                      <div className="mt-1 space-y-1">
                        {rule.conditions.map((condition, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {condition.field} {condition.operator} {JSON.stringify(condition.value)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Actions:</span>
                      <div className="mt-1 space-y-1">
                        {rule.actions.map((action, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {action.type}: {JSON.stringify(action.value)} (Confidence: {action.confidence}%)
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Priority: {rule.priority} | Examples: {rule.trainingExamples.length}
                        </span>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setSelectedRule(rule)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700">
                            Test
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Training Sessions Tab */}
        {activeTab === 'training-sessions' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Sessions</h2>
              <div className="space-y-4">
                {trainingSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">Training Session #{session.id}</h3>
                        <p className="text-sm text-gray-600">Started: {new Date(session.startTime).toLocaleString()}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        session.status === 'completed' ? 'bg-green-100 text-green-800' :
                        session.status === 'running' ? 'bg-blue-100 text-blue-800' :
                        session.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Examples Processed:</span>
                        <p className="text-sm text-gray-900">{session.metrics.examplesProcessed}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Accuracy:</span>
                        <p className="text-sm text-gray-900">{session.metrics.accuracy}%</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Improvements:</span>
                        <p className="text-sm text-green-600">{session.metrics.improvements}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">New Rules:</span>
                        <p className="text-sm text-gray-900">{session.metrics.newRules}</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${session.progress}%` }}
                      ></div>
                    </div>
                    {session.errors.length > 0 && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                        <h4 className="text-sm font-medium text-red-800 mb-2">Errors:</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          {session.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Accuracy:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {instructionSets.length > 0 ? Math.round(instructionSets.reduce((sum, i) => sum + i.performanceMetrics.accuracy, 0) / instructionSets.length) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Response Time:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {instructionSets.length > 0 ? Math.round(instructionSets.reduce((sum, i) => sum + i.performanceMetrics.responseTime, 0) / instructionSets.length) : 0}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Conversion Rate:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {instructionSets.length > 0 ? Math.round(instructionSets.reduce((sum, i) => sum + i.performanceMetrics.conversionRate, 0) / instructionSets.length) : 0}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Data</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Examples:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {instructionSets.reduce((sum, i) => sum + i.trainingData.totalExamples, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Positive Examples:</span>
                    <span className="text-sm font-medium text-green-600">
                      {instructionSets.reduce((sum, i) => sum + i.trainingData.positiveExamples, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Negative Examples:</span>
                    <span className="text-sm font-medium text-red-600">
                      {instructionSets.reduce((sum, i) => sum + i.trainingData.negativeExamples, 0)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Rules</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Rules:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {instructionSets.reduce((sum, i) => sum + i.trainingRules.length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Enabled Rules:</span>
                    <span className="text-sm font-medium text-green-600">
                      {instructionSets.reduce((sum, i) => sum + i.trainingRules.filter(r => r.enabled).length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Custom Rules:</span>
                    <span className="text-sm font-medium text-blue-600">
                      {instructionSets.reduce((sum, i) => sum + i.trainingData.customRules, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Rule Modal */}
        {showCreateRule && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create Training Rule</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter rule name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter rule description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="communication">Communication</option>
                      <option value="qualification">Qualification</option>
                      <option value="objection-handling">Objection Handling</option>
                      <option value="closing">Closing</option>
                      <option value="follow-up">Follow-up</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="1">1 - Highest</option>
                      <option value="2">2 - High</option>
                      <option value="3">3 - Medium</option>
                      <option value="4">4 - Low</option>
                      <option value="5">5 - Lowest</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowCreateRule(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Create Rule
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

export default InstructionSetTraining; 