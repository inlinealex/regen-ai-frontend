import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';

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
  name: string;
  company: string;
  email: string;
  phone: string;
  industry: string;
  companySize: string;
  budget: string;
  timeline: string;
  source: string;
  status: 'pending' | 'qualified' | 'disqualified' | 'manual_review';
  score: number;
  confidence: number;
  qualificationReason: string;
  assignedPersona: string;
  createdAt: Date;
  processedAt?: Date;
}

interface QualificationRule {
  id: string;
  clientId: string;
  name: string;
  description: string;
  isActive: boolean;
  priority: number;
  conditions: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_list';
    value: string | number | string[];
  }[];
  actions: {
    type: 'qualify' | 'disqualify' | 'manual_review' | 'assign_persona';
    value: string;
  }[];
  successRate: number;
  totalProcessed: number;
}

interface BatchProcessingJob {
  id: string;
  clientId: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalLeads: number;
  processedLeads: number;
  qualifiedLeads: number;
  disqualifiedLeads: number;
  manualReviewLeads: number;
  startTime: Date;
  endTime?: Date;
  errorMessage?: string;
}

const LeadQualificationManagement: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([
    {
      id: 'client-001',
      name: 'TechCorp Solutions',
      apiKey: 'tc_sk_123456789',
      email: 'admin@techcorp.com',
      dataSiloId: 'silo_tc_001',
      isolationLevel: 'strict',
      createdAt: '2024-01-15',
      settings: {
        dataRetention: {
          leads: 90,
          conversations: 180,
          analytics: 365
        },
        accessControl: {
          roles: ['admin', 'manager', 'analyst'],
          permissions: ['read', 'write', 'delete']
        }
      }
    },
    {
      id: 'client-002',
      name: 'DataFlow Systems',
      apiKey: 'df_sk_987654321',
      email: 'admin@dataflow.com',
      dataSiloId: 'silo_df_002',
      isolationLevel: 'moderate',
      createdAt: '2024-01-20',
      settings: {
        dataRetention: {
          leads: 60,
          conversations: 120,
          analytics: 180
        },
        accessControl: {
          roles: ['admin', 'user'],
          permissions: ['read', 'write']
        }
      }
    },
    {
      id: 'client-003',
      name: 'InnovateTech Inc',
      apiKey: 'it_sk_456789123',
      email: 'admin@innovatetech.com',
      dataSiloId: 'silo_it_003',
      isolationLevel: 'strict',
      createdAt: '2024-01-25',
      settings: {
        dataRetention: {
          leads: 120,
          conversations: 240,
          analytics: 730
        },
        accessControl: {
          roles: ['admin', 'manager', 'analyst', 'viewer'],
          permissions: ['read', 'write', 'delete', 'export']
        }
      }
    }
  ]);

  const [selectedClient, setSelectedClient] = useState<string>('client-001');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [qualificationRules, setQualificationRules] = useState<QualificationRule[]>([
    {
      id: '1',
      clientId: 'client-001',
      name: 'High Budget Enterprise',
      description: 'Automatically qualify enterprise leads with high budget',
      isActive: true,
      priority: 1,
      conditions: [
        { field: 'companySize', operator: 'equals', value: 'Enterprise' },
        { field: 'budget', operator: 'greater_than', value: 50000 }
      ],
      actions: [
        { type: 'qualify', value: 'qualified' },
        { type: 'assign_persona', value: 'enterprise-specialist' }
      ],
      successRate: 94.2,
      totalProcessed: 1250
    },
    {
      id: '2',
      clientId: 'client-001',
      name: 'SMB Quick Disqualify',
      description: 'Disqualify small businesses with low budget',
      isActive: true,
      priority: 2,
      conditions: [
        { field: 'companySize', operator: 'in_list', value: ['Small', 'Startup'] },
        { field: 'budget', operator: 'less_than', value: 10000 }
      ],
      actions: [
        { type: 'disqualify', value: 'Low budget for SMB' }
      ],
      successRate: 98.7,
      totalProcessed: 890
    },
    {
      id: '3',
      clientId: 'client-002',
      name: 'Technical Industry Focus',
      description: 'Qualify technical industries with appropriate personas',
      isActive: true,
      priority: 1,
      conditions: [
        { field: 'industry', operator: 'in_list', value: ['Technology', 'Software', 'AI/ML'] }
      ],
      actions: [
        { type: 'qualify', value: 'qualified' },
        { type: 'assign_persona', value: 'technical-specialist' }
      ],
      successRate: 91.5,
      totalProcessed: 2100
    }
  ]);

  const [batchJobs, setBatchJobs] = useState<BatchProcessingJob[]>([
    {
      id: '1',
      clientId: 'client-001',
      name: 'Weekly Lead Processing - Week 4',
      status: 'completed',
      totalLeads: 5120,
      processedLeads: 5120,
      qualifiedLeads: 2847,
      disqualifiedLeads: 1892,
      manualReviewLeads: 381,
      startTime: new Date('2024-01-22T09:00:00'),
      endTime: new Date('2024-01-22T14:30:00')
    },
    {
      id: '2',
      clientId: 'client-001',
      name: 'Weekly Lead Processing - Week 5',
      status: 'running',
      totalLeads: 4875,
      processedLeads: 3240,
      qualifiedLeads: 1820,
      disqualifiedLeads: 1150,
      manualReviewLeads: 270,
      startTime: new Date('2024-01-29T09:00:00')
    },
    {
      id: '3',
      clientId: 'client-002',
      name: 'DataFlow Lead Processing',
      status: 'completed',
      totalLeads: 3200,
      processedLeads: 3200,
      qualifiedLeads: 1850,
      disqualifiedLeads: 1100,
      manualReviewLeads: 250,
      startTime: new Date('2024-01-28T10:00:00'),
      endTime: new Date('2024-01-28T15:45:00')
    }
  ]);

  const [systemMetrics, setSystemMetrics] = useState({
    weeklyGoal: 5000,
    currentWeekProcessed: 3240,
    averageProcessingTime: 2.3, // seconds per lead
    successRate: 96.8,
    automationRate: 92.3, // percentage automated vs manual review
    totalRules: 3,
    activeRules: 3,
    lastUpdated: new Date()
  });

  const [selectedRule, setSelectedRule] = useState<QualificationRule | null>(null);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [newRule, setNewRule] = useState<Partial<QualificationRule>>({
    name: '',
    description: '',
    isActive: true,
    priority: 1,
    conditions: [],
    actions: []
  });

  const [filters, setFilters] = useState({
    status: 'all',
    industry: 'all',
    companySize: 'all',
    dateRange: '7d'
  });

  // Filter data based on selected client
  const clientLeads = leads.filter(lead => lead.clientId === selectedClient);
  const clientRules = qualificationRules.filter(rule => rule.clientId === selectedClient);
  const clientBatchJobs = batchJobs.filter(job => job.clientId === selectedClient);
  const selectedClientData = clients.find(c => c.id === selectedClient);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        currentWeekProcessed: prev.currentWeekProcessed + Math.floor(Math.random() * 5),
        lastUpdated: new Date()
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const createQualificationRule = () => {
    if (newRule.name && newRule.description && newRule.conditions && newRule.actions) {
      const rule: QualificationRule = {
        id: Date.now().toString(),
        clientId: selectedClient,
        name: newRule.name,
        description: newRule.description,
        isActive: newRule.isActive || true,
        priority: newRule.priority || 1,
        conditions: newRule.conditions,
        actions: newRule.actions,
        successRate: 0,
        totalProcessed: 0
      };
      setQualificationRules(prev => [...prev, rule]);
      setNewRule({
        name: '',
        description: '',
        isActive: true,
        priority: 1,
        conditions: [],
        actions: []
      });
      setShowCreateRule(false);
    }
  };

  const toggleRuleStatus = (ruleId: string) => {
    setQualificationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  const startBatchProcessing = () => {
    const newJob: BatchProcessingJob = {
      id: Date.now().toString(),
      clientId: selectedClient,
      name: `Batch Processing - ${selectedClientData?.name} - ${new Date().toLocaleDateString()}`,
      status: 'running',
      totalLeads: Math.floor(Math.random() * 2000) + 3000, // 3000-5000 leads
      processedLeads: 0,
      qualifiedLeads: 0,
      disqualifiedLeads: 0,
      manualReviewLeads: 0,
      startTime: new Date()
    };
    setBatchJobs(prev => [newJob, ...prev]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'qualified': return 'text-green-600 bg-green-100';
      case 'disqualified': return 'text-red-600 bg-red-100';
      case 'manual_review': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getIsolationLevelColor = (level: string) => {
    switch (level) {
      case 'strict': return 'text-red-600 bg-red-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'minimal': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lead Qualification Management
          </h1>
          <p className="text-gray-600">
            Client-siloed automated lead qualification system handling variable volume with configurable rules
          </p>
        </div>

        {/* Client Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Client</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clients.map(client => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client.id)}
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
                <div className="mt-2 text-xs text-gray-500">
                  Data Silo: {client.dataSiloId}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Information */}
        {selectedClientData && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Data Isolation</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Isolation Level:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getIsolationLevelColor(selectedClientData.isolationLevel)}`}>
                      {selectedClientData.isolationLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data Silo ID:</span>
                    <span className="text-sm font-mono text-gray-900">{selectedClientData.dataSiloId}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Data Retention</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Leads:</span>
                    <span className="text-sm text-gray-900">{selectedClientData.settings.dataRetention.leads} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conversations:</span>
                    <span className="text-sm text-gray-900">{selectedClientData.settings.dataRetention.conversations} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Analytics:</span>
                    <span className="text-sm text-gray-900">{selectedClientData.settings.dataRetention.analytics} days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Weekly Goal</p>
            <p className="text-2xl font-bold text-gray-900">{systemMetrics.weeklyGoal.toLocaleString()}</p>
            <p className="text-sm text-gray-500">leads per week</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Current Week</p>
            <p className="text-2xl font-bold text-gray-900">{systemMetrics.currentWeekProcessed.toLocaleString()}</p>
            <p className="text-sm text-gray-500">
              {((systemMetrics.currentWeekProcessed / systemMetrics.weeklyGoal) * 100).toFixed(1)}% of goal
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Success Rate</p>
            <p className="text-2xl font-bold text-green-600">{systemMetrics.successRate}%</p>
            <p className="text-sm text-gray-500">automated accuracy</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Processing Speed</p>
            <p className="text-2xl font-bold text-blue-600">{systemMetrics.averageProcessingTime}s</p>
            <p className="text-sm text-gray-500">per lead</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Qualification Rules */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Qualification Rules</h2>
                <Button 
                  onClick={() => setShowCreateRule(true)}
                  variant="primary"
                >
                  Add Rule
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {clientRules.map(rule => (
                  <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <Button
                          onClick={() => toggleRuleStatus(rule.id)}
                          variant="outline"
                          size="sm"
                        >
                          {rule.isActive ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Priority:</span>
                        <span className="ml-2 font-medium">{rule.priority}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Success Rate:</span>
                        <span className="ml-2 font-medium">{rule.successRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Processed:</span>
                        <span className="ml-2 font-medium">{rule.totalProcessed.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Conditions:</span>
                        <span className="ml-2 font-medium">{rule.conditions.length}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Conditions: {rule.conditions.map(c => `${c.field} ${c.operator} ${c.value}`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Batch Processing Jobs */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Batch Processing</h2>
                <Button 
                  onClick={startBatchProcessing}
                  variant="primary"
                >
                  Start Batch
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {clientBatchJobs.map(job => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{job.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Progress:</span>
                        <span className="ml-2 font-medium">{job.processedLeads}/{job.totalLeads}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Qualified:</span>
                        <span className="ml-2 font-medium text-green-600">{job.qualifiedLeads}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Disqualified:</span>
                        <span className="ml-2 font-medium text-red-600">{job.disqualifiedLeads}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Manual Review:</span>
                        <span className="ml-2 font-medium text-yellow-600">{job.manualReviewLeads}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(job.processedLeads / job.totalLeads) * 100}%` }}
                      ></div>
                    </div>
                    {job.status === 'running' && (
                      <p className="text-xs text-gray-500 mt-2">
                        Processing... {Math.floor((job.processedLeads / job.totalLeads) * 100)}% complete
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Leads Table */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Leads - {selectedClientData?.name}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Persona
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientLeads.slice(0, 10).map(lead => (
                  <tr key={lead.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.company}</div>
                      <div className="text-sm text-gray-500">{lead.industry}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lead.score}/100</div>
                      <div className="text-sm text-gray-500">{lead.confidence}% confidence</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.assignedPersona}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.processedAt ? new Date(lead.processedAt).toLocaleTimeString() : 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Rule Modal */}
        {showCreateRule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create Qualification Rule</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                  <input
                    type="text"
                    value={newRule.name}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newRule.description}
                    onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <input
                      type="number"
                      value={newRule.priority}
                      onChange={(e) => setNewRule(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newRule.isActive}
                      onChange={(e) => setNewRule(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700">Active</label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  onClick={() => setShowCreateRule(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createQualificationRule}
                  variant="primary"
                >
                  Create Rule
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadQualificationManagement; 