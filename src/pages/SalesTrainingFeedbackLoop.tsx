import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';

interface ConversationPerformance {
  id: string;
  personaId: string;
  personaName: string;
  conversationId: string;
  leadId: string;
  leadName: string;
  successRate: number;
  conversionRate: number;
  responseTime: number;
  engagementScore: number;
  revenueGenerated: number;
  timestamp: Date;
  status: 'active' | 'testing' | 'live' | 'archived';
}

interface TrainingSession {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  status: 'running' | 'completed' | 'paused';
  performanceThreshold: number;
  minConversations: number;
  currentConversations: number;
  successRate: number;
  improvementRate: number;
}

interface AutoTrainingRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  minSuccessRate: number;
  minConversations: number;
  autoPromoteThreshold: number;
  testingDuration: number; // days
  maxTestingConversations: number;
}

const SalesTrainingFeedbackLoop: React.FC = () => {
  const [autoTrainingRules, setAutoTrainingRules] = useState<AutoTrainingRule[]>([
    {
      id: '1',
      name: 'High-Performance Auto-Promotion',
      description: 'Automatically promote personas with >85% success rate and >50 conversations',
      isActive: true,
      minSuccessRate: 85,
      minConversations: 50,
      autoPromoteThreshold: 90,
      testingDuration: 7,
      maxTestingConversations: 100
    },
    {
      id: '2',
      name: 'Revenue-Focused Promotion',
      description: 'Promote personas generating >$10K revenue with >70% conversion',
      isActive: true,
      minSuccessRate: 70,
      minConversations: 30,
      autoPromoteThreshold: 80,
      testingDuration: 14,
      maxTestingConversations: 200
    },
    {
      id: '3',
      name: 'Engagement-Based Promotion',
      description: 'Promote personas with >90% engagement score and >40 conversations',
      isActive: false,
      minSuccessRate: 75,
      minConversations: 40,
      autoPromoteThreshold: 85,
      testingDuration: 10,
      maxTestingConversations: 150
    }
  ]);

  const [activeTrainingSessions, setActiveTrainingSessions] = useState<TrainingSession[]>([
    {
      id: '1',
      name: 'Sales Executive Performance Boost',
      description: 'Testing improved sales executive persona with enhanced objection handling',
      startDate: new Date('2024-01-15'),
      status: 'running',
      performanceThreshold: 85,
      minConversations: 50,
      currentConversations: 67,
      successRate: 87.3,
      improvementRate: 12.5
    },
    {
      id: '2',
      name: 'Technical Specialist Enhancement',
      description: 'Testing technical specialist with improved technical qualification',
      startDate: new Date('2024-01-20'),
      status: 'running',
      performanceThreshold: 80,
      minConversations: 40,
      currentConversations: 42,
      successRate: 82.1,
      improvementRate: 8.7
    }
  ]);

  const [topPerformers, setTopPerformers] = useState<ConversationPerformance[]>([
    {
      id: '1',
      personaId: 'sales-exec-001',
      personaName: 'Sales Executive Pro',
      conversationId: 'conv-001',
      leadId: 'lead-001',
      leadName: 'TechCorp Inc',
      successRate: 94.2,
      conversionRate: 78.5,
      responseTime: 2.3,
      engagementScore: 92.1,
      revenueGenerated: 25000,
      timestamp: new Date('2024-01-25'),
      status: 'testing'
    },
    {
      id: '2',
      personaId: 'tech-spec-002',
      personaName: 'Technical Specialist Plus',
      conversationId: 'conv-002',
      leadId: 'lead-002',
      leadName: 'DataFlow Systems',
      successRate: 91.8,
      conversionRate: 82.3,
      responseTime: 1.8,
      engagementScore: 89.7,
      revenueGenerated: 18000,
      timestamp: new Date('2024-01-24'),
      status: 'live'
    }
  ]);

  const [systemStatus, setSystemStatus] = useState({
    isRunning: true,
    lastUpdate: new Date(),
    totalConversationsAnalyzed: 1247,
    personasPromoted: 8,
    averageImprovementRate: 15.3,
    nextScheduledAnalysis: new Date(Date.now() + 3600000) // 1 hour from now
  });

  const [selectedRule, setSelectedRule] = useState<AutoTrainingRule | null>(null);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AutoTrainingRule>>({
    name: '',
    description: '',
    isActive: true,
    minSuccessRate: 80,
    minConversations: 50,
    autoPromoteThreshold: 85,
    testingDuration: 7,
    maxTestingConversations: 100
  });

  // Simulate automatic system updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        lastUpdate: new Date(),
        totalConversationsAnalyzed: prev.totalConversationsAnalyzed + Math.floor(Math.random() * 10),
        nextScheduledAnalysis: new Date(Date.now() + 3600000)
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const createAutoTrainingRule = () => {
    if (newRule.name && newRule.description) {
      const rule: AutoTrainingRule = {
        id: Date.now().toString(),
        name: newRule.name,
        description: newRule.description,
        isActive: newRule.isActive || true,
        minSuccessRate: newRule.minSuccessRate || 80,
        minConversations: newRule.minConversations || 50,
        autoPromoteThreshold: newRule.autoPromoteThreshold || 85,
        testingDuration: newRule.testingDuration || 7,
        maxTestingConversations: newRule.maxTestingConversations || 100
      };
      setAutoTrainingRules(prev => [...prev, rule]);
      setNewRule({
        name: '',
        description: '',
        isActive: true,
        minSuccessRate: 80,
        minConversations: 50,
        autoPromoteThreshold: 85,
        testingDuration: 7,
        maxTestingConversations: 100
      });
      setShowCreateRule(false);
    }
  };

  const toggleRuleStatus = (ruleId: string) => {
    setAutoTrainingRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  const promoteToLive = (conversationId: string) => {
    setTopPerformers(prev => 
      prev.map(conv => 
        conv.id === conversationId ? { ...conv, status: 'live' as const } : conv
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'text-green-600 bg-green-100';
      case 'testing': return 'text-yellow-600 bg-yellow-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Automated Training Feedback Loop
          </h1>
          <p className="text-gray-600">
            Continuous AI training system that automatically identifies, tests, and promotes high-performing personas
          </p>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className={`text-lg font-semibold ${systemStatus.isRunning ? 'text-green-600' : 'text-red-600'}`}>
                  {systemStatus.isRunning ? 'Running' : 'Stopped'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${systemStatus.isRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Conversations Analyzed</p>
            <p className="text-2xl font-bold text-gray-900">{systemStatus.totalConversationsAnalyzed.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Personas Promoted</p>
            <p className="text-2xl font-bold text-gray-900">{systemStatus.personasPromoted}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Avg Improvement</p>
            <p className="text-2xl font-bold text-gray-900">{systemStatus.averageImprovementRate}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Auto Training Rules */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Auto Training Rules</h2>
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
                {autoTrainingRules.map(rule => (
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
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Min Success Rate:</span>
                        <span className="ml-2 font-medium">{rule.minSuccessRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Min Conversations:</span>
                        <span className="ml-2 font-medium">{rule.minConversations}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Promote Threshold:</span>
                        <span className="ml-2 font-medium">{rule.autoPromoteThreshold}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Testing Duration:</span>
                        <span className="ml-2 font-medium">{rule.testingDuration} days</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Training Sessions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Active Training Sessions</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {activeTrainingSessions.map(session => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{session.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.status === 'running' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Success Rate:</span>
                        <span className="ml-2 font-medium">{session.successRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Improvement:</span>
                        <span className="ml-2 font-medium text-green-600">+{session.improvementRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Conversations:</span>
                        <span className="ml-2 font-medium">{session.currentConversations}/{session.minConversations}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Threshold:</span>
                        <span className="ml-2 font-medium">{session.performanceThreshold}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((session.currentConversations / session.minConversations) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Top Performing Conversations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Persona
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topPerformers.map(conversation => (
                  <tr key={conversation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{conversation.personaName}</div>
                        <div className="text-sm text-gray-500">{conversation.personaId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{conversation.leadName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{conversation.successRate}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{conversation.conversionRate}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        ${conversation.revenueGenerated.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                        {conversation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {conversation.status === 'testing' && (
                        <Button
                          onClick={() => promoteToLive(conversation.id)}
                          variant="primary"
                          size="sm"
                        >
                          Promote to Live
                        </Button>
                      )}
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
              <h3 className="text-lg font-semibold mb-4">Create Auto Training Rule</h3>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Success Rate (%)</label>
                    <input
                      type="number"
                      value={newRule.minSuccessRate}
                      onChange={(e) => setNewRule(prev => ({ ...prev, minSuccessRate: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Conversations</label>
                    <input
                      type="number"
                      value={newRule.minConversations}
                      onChange={(e) => setNewRule(prev => ({ ...prev, minConversations: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
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
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  onClick={() => setShowCreateRule(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createAutoTrainingRule}
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

export default SalesTrainingFeedbackLoop; 