import React, { useState, useEffect } from 'react';

interface Persona {
  id: string;
  name: string;
  description: string;
  instructions: string;
  trainingExamples: TrainingExample[];
  performanceMetrics: PerformanceMetrics;
  safetySettings: SafetySettings;
  version: number;
  status: 'draft' | 'active' | 'testing' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface TrainingExample {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  category: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  successRate: number;
  feedback: string;
  approved: boolean;
  createdAt: string;
}

interface PerformanceMetrics {
  totalInteractions: number;
  successRate: number;
  averageResponseTime: number;
  hallucinationRate: number;
  jailbreakAttempts: number;
  customerSatisfaction: number;
  conversionRate: number;
  recentImprovements: Improvement[];
}

interface Improvement {
  metric: string;
  improvement: string;
  timeframe: string;
  confidence: number;
}

interface SafetySettings {
  hallucinationDetection: boolean;
  jailbreakPrevention: boolean;
  factChecking: boolean;
  sourceValidation: boolean;
  confidenceThreshold: number;
  maxResponseLength: number;
  forbiddenTopics: string[];
}

interface TrainingSession {
  id: string;
  personaId: string;
  leadId: string;
  conversationHistory: ConversationMessage[];
  manualSwitches: ManualSwitch[];
  performanceScore: number;
  feedback: string;
  status: 'active' | 'completed' | 'reviewed';
  startTime: string;
  endTime?: string;
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  confidence: number;
  safetyFlags: string[];
}

interface ManualSwitch {
  fromPersona: string;
  toPersona: string;
  reason: string;
  timestamp: string;
  success: boolean;
}

const AdvancedPersonaTraining: React.FC = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [activeSession, setActiveSession] = useState<TrainingSession | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'training' | 'testing' | 'analytics' | 'safety'>('overview');
  const [loading, setLoading] = useState(false);
  const [showCreatePersona, setShowCreatePersona] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);

  const API_BASE = 'http://localhost:3000/api';

  useEffect(() => {
    loadPersonas();
    loadTrainingSessions();
  }, []);

  const loadPersonas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/personas`);
      const data = await response.json();
      if (data.success) {
        setPersonas(data.personas);
      }
    } catch (error) {
      console.error('Failed to load personas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrainingSessions = async () => {
    try {
      const response = await fetch(`${API_BASE}/training/sessions`);
      const data = await response.json();
      if (data.success) {
        setTrainingSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to load training sessions:', error);
    }
  };

  const createPersona = async (personaData: Partial<Persona>) => {
    try {
      const response = await fetch(`${API_BASE}/personas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personaData)
      });

      if (response.ok) {
        await loadPersonas();
        setShowCreatePersona(false);
      }
    } catch (error) {
      console.error('Failed to create persona:', error);
    }
  };

  const startTrainingSession = async (personaId: string, leadId: string) => {
    try {
      const response = await fetch(`${API_BASE}/training/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId, leadId })
      });

      if (response.ok) {
        const data = await response.json();
        setActiveSession(data.session);
        setShowTrainingModal(true);
      }
    } catch (error) {
      console.error('Failed to start training session:', error);
    }
  };

  const sendMessage = async (message: string) => {
    if (!activeSession) return;

    try {
      const response = await fetch(`${API_BASE}/training/sessions/${activeSession.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (response.ok) {
        const data = await response.json();
        setActiveSession(prev => prev ? {
          ...prev,
          conversationHistory: [...prev.conversationHistory, {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
            confidence: 1.0,
            safetyFlags: []
          }, {
            id: `msg-${Date.now() + 1}`,
            role: 'assistant',
            content: data.response,
            timestamp: new Date().toISOString(),
            confidence: data.confidence || 0.8,
            safetyFlags: data.safetyFlags || []
          }]
        } : null);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const switchPersona = async (newPersonaId: string, reason: string) => {
    if (!activeSession) return;

    try {
      const response = await fetch(`${API_BASE}/training/sessions/${activeSession.id}/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPersonaId, reason })
      });

      if (response.ok) {
        setActiveSession(prev => prev ? {
          ...prev,
          manualSwitches: [...prev.manualSwitches, {
            fromPersona: prev.personaId,
            toPersona: newPersonaId,
            reason,
            timestamp: new Date().toISOString(),
            success: true
          }],
          personaId: newPersonaId
        } : null);
      }
    } catch (error) {
      console.error('Failed to switch persona:', error);
    }
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSafetyColor = (flags: string[]) => {
    if (flags.length === 0) return 'text-green-600';
    if (flags.includes('critical')) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Persona Training</h1>
              <p className="mt-2 text-gray-600">Comprehensive AI persona training with advanced safety controls</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCreatePersona(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Persona
              </button>
              <button
                onClick={() => setShowTrainingModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Start Training
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'training', name: 'Training' },
              { id: 'testing', name: 'Testing' },
              { id: 'analytics', name: 'Analytics' },
              { id: 'safety', name: 'Safety' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  viewMode === tab.id
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
        {viewMode === 'overview' && (
          <div className="space-y-8">
            {/* Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Active Personas</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {personas.filter(p => p.status === 'active').length}
                </p>
                <p className="text-sm text-gray-600">Currently in use</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Training Sessions</h3>
                <p className="text-3xl font-bold text-green-600">
                  {trainingSessions.filter(s => s.status === 'active').length}
                </p>
                <p className="text-sm text-gray-600">Currently active</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Avg Success Rate</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {personas.length > 0 
                    ? Math.round(personas.reduce((sum, p) => sum + p.performanceMetrics.successRate, 0) / personas.length)
                    : 0}%
                </p>
                <p className="text-sm text-gray-600">Across all personas</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Safety Alerts</h3>
                <p className="text-3xl font-bold text-red-600">
                  {personas.reduce((sum, p) => sum + p.performanceMetrics.hallucinationRate + p.performanceMetrics.jailbreakAttempts, 0)}
                </p>
                <p className="text-sm text-gray-600">This week</p>
              </div>
            </div>

            {/* Persona Cards */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Persona Performance</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {personas.map((persona) => (
                    <div key={persona.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{persona.name}</h3>
                          <p className="text-sm text-gray-600">{persona.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          persona.status === 'active' ? 'bg-green-100 text-green-800' :
                          persona.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {persona.status}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Success Rate</p>
                            <p className={`text-sm font-medium ${getPerformanceColor(persona.performanceMetrics.successRate)}`}>
                              {persona.performanceMetrics.successRate}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Response Time</p>
                            <p className="text-sm font-medium text-gray-900">
                              {persona.performanceMetrics.averageResponseTime}s
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Hallucination Rate</p>
                            <p className="text-sm font-medium text-red-600">
                              {persona.performanceMetrics.hallucinationRate}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Conversions</p>
                            <p className="text-sm font-medium text-green-600">
                              {persona.performanceMetrics.conversionRate}%
                            </p>
                          </div>
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={() => {
                              setSelectedPersona(persona);
                              setViewMode('training');
                            }}
                            className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Train
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPersona(persona);
                              setViewMode('testing');
                            }}
                            className="flex-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Test
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Training Tab */}
        {viewMode === 'training' && selectedPersona && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Training: {selectedPersona.name}
              </h2>

              {/* Training Examples */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Training Examples</h3>
                <div className="space-y-4">
                  {selectedPersona.trainingExamples.map((example) => (
                    <div key={example.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Input: {example.input}</p>
                          <p className="text-sm text-gray-600">Expected: {example.expectedOutput}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            example.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            example.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {example.difficulty}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            example.approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {example.approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Success Rate: {example.successRate}% | Category: {example.category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Recent Improvements</h4>
                  <div className="space-y-2">
                    {selectedPersona.performanceMetrics.recentImprovements.map((improvement, index) => (
                      <div key={index} className="text-sm">
                        <span className="text-green-600">{improvement.improvement}</span>
                        <span className="text-gray-600"> in {improvement.metric}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Safety Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Hallucination Detection</span>
                      <span className={selectedPersona.safetySettings.hallucinationDetection ? 'text-green-600' : 'text-red-600'}>
                        {selectedPersona.safetySettings.hallucinationDetection ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jailbreak Prevention</span>
                      <span className={selectedPersona.safetySettings.jailbreakPrevention ? 'text-green-600' : 'text-red-600'}>
                        {selectedPersona.safetySettings.jailbreakPrevention ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fact Checking</span>
                      <span className={selectedPersona.safetySettings.factChecking ? 'text-green-600' : 'text-red-600'}>
                        {selectedPersona.safetySettings.factChecking ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Training Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                      Add Training Example
                    </button>
                    <button className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                      Start Live Training
                    </button>
                    <button className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                      Export Training Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Testing Tab */}
        {viewMode === 'testing' && selectedPersona && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Testing: {selectedPersona.name}
              </h2>

              {/* Test Scenarios */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Test Scenarios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Objection Handling', difficulty: 'medium', success: 85 },
                    { name: 'Price Negotiation', difficulty: 'hard', success: 72 },
                    { name: 'Technical Questions', difficulty: 'medium', success: 91 },
                    { name: 'Urgency Creation', difficulty: 'easy', success: 88 }
                  ].map((scenario, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          scenario.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          scenario.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {scenario.difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Success Rate</span>
                        <span className={`text-sm font-medium ${getPerformanceColor(scenario.success)}`}>
                          {scenario.success}%
                        </span>
                      </div>
                      <button className="w-full mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        Run Test
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Testing Interface */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Live Testing Interface</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Test Input</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Enter test scenario..."
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        Run Test
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Switch Persona
                      </button>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                        Save Test Case
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {viewMode === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Training Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Overall Performance</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Interactions</span>
                      <span className="font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate</span>
                      <span className="font-medium text-green-600">94.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Response Time</span>
                      <span className="font-medium">2.4s</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Safety Metrics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Hallucination Rate</span>
                      <span className="font-medium text-red-600">1.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jailbreak Attempts</span>
                      <span className="font-medium text-red-600">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Safety Score</span>
                      <span className="font-medium text-green-600">98.5%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-2">Training Progress</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Training Examples</span>
                      <span className="font-medium">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approved Examples</span>
                      <span className="font-medium text-green-600">142</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Review</span>
                      <span className="font-medium text-yellow-600">14</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Success Rate Over Time</h3>
                  <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-500">Chart Placeholder</span>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Safety Incidents</h3>
                  <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-500">Chart Placeholder</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Safety Tab */}
        {viewMode === 'safety' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Safety Controls</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Safety Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Hallucination Detection</p>
                        <p className="text-sm text-gray-600">Detect and flag AI hallucinations</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Jailbreak Prevention</p>
                        <p className="text-sm text-gray-600">Prevent prompt injection attacks</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Fact Checking</p>
                        <p className="text-sm text-gray-600">Verify factual accuracy</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Safety Alerts</h3>
                  <div className="space-y-3">
                    {[
                      { type: 'hallucination', severity: 'medium', message: 'AI claimed incorrect company size', time: '2 hours ago' },
                      { type: 'jailbreak', severity: 'high', message: 'Potential prompt injection detected', time: '4 hours ago' },
                      { type: 'factual_error', severity: 'low', message: 'Incorrect pricing information', time: '6 hours ago' }
                    ].map((alert, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                            <p className="text-xs text-gray-600">{alert.time}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                            alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Training Modal */}
        {showTrainingModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Live Training Session</h3>
                  <button
                    onClick={() => setShowTrainingModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {activeSession ? (
                  <div className="space-y-4">
                    {/* Conversation History */}
                    <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto">
                      {activeSession.conversationHistory.map((message) => (
                        <div key={message.id} className={`mb-3 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                          <div className={`inline-block p-3 rounded-lg ${
                            message.role === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-white border'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </span>
                              {message.role === 'assistant' && (
                                <>
                                  <span className={`text-xs ${getSafetyColor(message.safetyFlags)}`}>
                                    Confidence: {Math.round(message.confidence * 100)}%
                                  </span>
                                  {message.safetyFlags.length > 0 && (
                                    <span className="text-xs text-red-600">
                                      Flags: {message.safetyFlags.join(', ')}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            sendMessage(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.querySelector('input') as HTMLInputElement;
                          if (input?.value) {
                            sendMessage(input.value);
                            input.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Send
                      </button>
                    </div>

                    {/* Persona Switching */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Switch Persona</h4>
                      <div className="flex space-x-2">
                        {personas.map((persona) => (
                          <button
                            key={persona.id}
                            onClick={() => switchPersona(persona.id, 'Manual switch during training')}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                          >
                            {persona.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Select a persona to start training...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedPersonaTraining; 