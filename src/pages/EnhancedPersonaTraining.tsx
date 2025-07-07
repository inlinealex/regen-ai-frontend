import React, { useState, useEffect } from 'react';

interface Persona {
  id: string;
  name: string;
  description: string;
  type: 'base' | 'custom' | 'specialized';
  instructions: string;
  trainingData: {
    positiveExamples: string[];
    negativeExamples: string[];
    conversationPatterns: string[];
  };
  performance: {
    accuracy: number;
    responseRate: number;
    conversionRate: number;
    lastTrained: string;
  };
  settings: {
    manualMode: boolean;
    autoLearning: boolean;
    safetyChecks: boolean;
    hallucinationPrevention: boolean;
    jailbreakPrevention: boolean;
  };
}

interface TrainingSession {
  id: string;
  personaId: string;
  leadId: string;
  conversationHistory: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    persona?: string;
    manuallySwitched?: boolean;
    switchReason?: string;
  }>;
  manualSwitches: Array<{
    fromPersona: string;
    toPersona: string;
    reason: string;
    timestamp: string;
  }>;
  performance: {
    totalMessages: number;
    manualSwitches: number;
    userSatisfaction: number;
    conversionAchieved: boolean;
  };
  status: 'active' | 'completed' | 'reviewed';
  startTime: string;
  endTime?: string;
}

interface BaseData {
  id: string;
  name: string;
  category: 'industry' | 'company_size' | 'lead_stage' | 'objection_type';
  data: string[];
  description: string;
}

const EnhancedPersonaTraining: React.FC = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [activeSession, setActiveSession] = useState<TrainingSession | null>(null);
  const [baseData, setBaseData] = useState<BaseData[]>([]);
  const [viewMode, setViewMode] = useState<'overview' | 'training' | 'testing' | 'analytics' | 'settings' | 'base-data'>('overview');
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [showCreatePersona, setShowCreatePersona] = useState(false);
  const [showBaseDataEditor, setShowBaseDataEditor] = useState(false);

  const API_BASE = 'http://localhost:3000/api';

  useEffect(() => {
    loadPersonas();
    loadTrainingSessions();
    loadBaseData();
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

  const loadBaseData = async () => {
    try {
      const response = await fetch(`${API_BASE}/base-data`);
      const data = await response.json();
      if (data.success) {
        setBaseData(data.baseData);
      }
    } catch (error) {
      console.error('Failed to load base data:', error);
    }
  };

  const createNewSession = async (personaId: string) => {
    try {
      const response = await fetch(`${API_BASE}/training/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId,
          leadId: `training-lead-${Date.now()}`,
          manualMode: true
        })
      });

      const data = await response.json();
      if (data.success) {
        const newSession: TrainingSession = {
          id: data.sessionId,
          personaId,
          leadId: data.leadId,
          conversationHistory: [],
          manualSwitches: [],
          performance: {
            totalMessages: 0,
            manualSwitches: 0,
            userSatisfaction: 0,
            conversionAchieved: false
          },
          status: 'active',
          startTime: new Date().toISOString()
        };

        setTrainingSessions([...trainingSessions, newSession]);
        setActiveSession(newSession);
      }
    } catch (error) {
      console.error('Failed to create training session:', error);
    }
  };

  const sendMessage = async (message: string) => {
    if (!activeSession || !message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: message,
      timestamp: new Date().toISOString()
    };

    const updatedSession = {
      ...activeSession,
      conversationHistory: [...activeSession.conversationHistory, userMessage]
    };

    setActiveSession(updatedSession);
    setUserInput('');

    // Generate AI response
    try {
      const response = await fetch(`${API_BASE}/training/process-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          message,
          manualMode: selectedPersona?.settings.manualMode || true,
          currentPersona: activeSession.personaId
        })
      });

      const data = await response.json();
      if (data.success) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: data.response,
          timestamp: new Date().toISOString(),
          persona: data.persona
        };

        const finalSession = {
          ...updatedSession,
          conversationHistory: [...updatedSession.conversationHistory, aiMessage]
        };

        setActiveSession(finalSession);
        updateSession(finalSession);
      }
    } catch (error) {
      console.error('Failed to process message:', error);
    }
  };

  const manuallySwitchPersona = async (newPersonaId: string, reason: string) => {
    if (!activeSession) return;

    const switchRecord = {
      fromPersona: activeSession.personaId,
      toPersona: newPersonaId,
      reason,
      timestamp: new Date().toISOString()
    };

    const updatedSession = {
      ...activeSession,
      personaId: newPersonaId,
      manualSwitches: [...activeSession.manualSwitches, switchRecord]
    };

    setActiveSession(updatedSession);

    // Record the manual switch for learning
    try {
      await fetch(`${API_BASE}/training/record-manual-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          fromPersona: activeSession.personaId,
          toPersona: newPersonaId,
          reason,
          conversationContext: activeSession.conversationHistory.slice(-3)
        })
      });
    } catch (error) {
      console.error('Failed to record manual switch:', error);
    }

    updateSession(updatedSession);
  };

  const updateSession = (session: TrainingSession) => {
    setTrainingSessions(trainingSessions.map(s => s.id === session.id ? session : s));
  };

  const updatePersonaSettings = async (personaId: string, settings: Partial<Persona['settings']>) => {
    try {
      const response = await fetch(`${API_BASE}/personas/${personaId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setPersonas(personas.map(p => 
          p.id === personaId ? { ...p, settings: { ...p.settings, ...settings } } : p
        ));
      }
    } catch (error) {
      console.error('Failed to update persona settings:', error);
    }
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Persona Training</h1>
          <p className="mt-2 text-gray-600">Train personas with manual mode controls and base data management</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'training', name: 'Training' },
              { id: 'testing', name: 'Testing' },
              { id: 'analytics', name: 'Analytics' },
              { id: 'settings', name: 'Settings' },
              { id: 'base-data', name: 'Base Data' }
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
            {/* Persona Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personas.map((persona) => (
                <div key={persona.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{persona.name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      persona.type === 'base' ? 'bg-blue-100 text-blue-800' :
                      persona.type === 'custom' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {persona.type}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{persona.description}</p>
                  
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Accuracy</p>
                      <p className={`text-sm font-medium ${getPerformanceColor(persona.performance.accuracy)}`}>
                        {persona.performance.accuracy}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Response Rate</p>
                      <p className={`text-sm font-medium ${getPerformanceColor(persona.performance.responseRate)}`}>
                        {persona.performance.responseRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Conversion Rate</p>
                      <p className={`text-sm font-medium ${getPerformanceColor(persona.performance.conversionRate)}`}>
                        {persona.performance.conversionRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Trained</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(persona.performance.lastTrained).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Settings Status */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Manual Mode</span>
                      <span className={persona.settings.manualMode ? 'text-green-600' : 'text-red-600'}>
                        {persona.settings.manualMode ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Auto Learning</span>
                      <span className={persona.settings.autoLearning ? 'text-green-600' : 'text-red-600'}>
                        {persona.settings.autoLearning ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Safety Checks</span>
                      <span className={persona.settings.safetyChecks ? 'text-green-600' : 'text-red-600'}>
                        {persona.settings.safetyChecks ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPersona(persona);
                        setViewMode('training');
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Train
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPersona(persona);
                        setViewMode('settings');
                      }}
                      className="flex-1 px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Settings
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Training Tab */}
        {viewMode === 'training' && selectedPersona && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Persona Settings Panel */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manual Mode</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedPersona.settings.manualMode}
                      onChange={(e) => updatePersonaSettings(selectedPersona.id, { manualMode: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">
                      {selectedPersona.settings.manualMode ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Auto Learning</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedPersona.settings.autoLearning}
                      onChange={(e) => updatePersonaSettings(selectedPersona.id, { autoLearning: e.target.checked })}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">
                      {selectedPersona.settings.autoLearning ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Safety Checks</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedPersona.settings.safetyChecks}
                      onChange={(e) => updatePersonaSettings(selectedPersona.id, { safetyChecks: e.target.checked })}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">
                      {selectedPersona.settings.safetyChecks ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hallucination Prevention</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedPersona.settings.hallucinationPrevention}
                      onChange={(e) => updatePersonaSettings(selectedPersona.id, { hallucinationPrevention: e.target.checked })}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">
                      {selectedPersona.settings.hallucinationPrevention ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jailbreak Prevention</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedPersona.settings.jailbreakPrevention}
                      onChange={(e) => updatePersonaSettings(selectedPersona.id, { jailbreakPrevention: e.target.checked })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">
                      {selectedPersona.settings.jailbreakPrevention ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => createNewSession(selectedPersona.id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Start Training Session
                </button>
              </div>
            </div>

            {/* Conversation Panel */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Training Conversation</h2>
                {activeSession && (
                  <p className="text-sm text-gray-600 mt-1">
                    Session: {activeSession.id} | Messages: {activeSession.conversationHistory.length}
                  </p>
                )}
              </div>

              {/* Conversation Messages */}
              <div className="h-96 overflow-y-auto p-6">
                {activeSession ? (
                  <div className="space-y-4">
                    {activeSession.conversationHistory.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="text-sm">{message.content}</div>
                          <div className="text-xs opacity-75 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                            {message.persona && (
                              <span className="ml-2 px-2 py-1 bg-gray-200 rounded">
                                {personas.find(p => p.id === message.persona)?.name}
                              </span>
                            )}
                            {message.manuallySwitched && (
                              <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 rounded">
                                Manual
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>No active training session</p>
                    <p className="text-sm mt-2">Start a session to begin training</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              {activeSession && (
                <div className="p-6 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage(userInput);
                        }
                      }}
                    />
                    <button
                      onClick={() => sendMessage(userInput)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {viewMode === 'settings' && selectedPersona && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Persona Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Instructions Editor */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">Instructions</h3>
                <textarea
                  value={selectedPersona.instructions}
                  onChange={(e) => {
                    // Update instructions logic here
                  }}
                  rows={10}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter persona instructions..."
                />
              </div>

              {/* Training Data */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">Training Data</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Positive Examples</label>
                    <textarea
                      value={selectedPersona.trainingData.positiveExamples.join('\n')}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter positive examples..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Negative Examples</label>
                    <textarea
                      value={selectedPersona.trainingData.negativeExamples.join('\n')}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter negative examples..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Base Data Tab */}
        {viewMode === 'base-data' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Base Data Management</h2>
              <button
                onClick={() => setShowBaseDataEditor(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Base Data
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {baseData.map((data) => (
                <div key={data.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{data.name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      data.category === 'industry' ? 'bg-blue-100 text-blue-800' :
                      data.category === 'company_size' ? 'bg-green-100 text-green-800' :
                      data.category === 'lead_stage' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {data.category}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{data.description}</p>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Data Items: {data.data.length}</p>
                    <div className="max-h-32 overflow-y-auto">
                      {data.data.slice(0, 5).map((item, index) => (
                        <div key={index} className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded">
                          {item}
                        </div>
                      ))}
                      {data.data.length > 5 && (
                        <div className="text-xs text-gray-500">
                          +{data.data.length - 5} more items
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedPersonaTraining; 