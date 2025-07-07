import React, { useState, useEffect } from 'react';

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  persona?: string;
  manuallySwitched?: boolean;
  switchReason?: string;
}

interface Persona {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  examples: string[];
}

interface TrainingSession {
  id: string;
  leadId: string;
  currentPersona: string;
  conversationHistory: ConversationMessage[];
  manualSwitches: Array<{
    fromPersona: string;
    toPersona: string;
    reason: string;
    timestamp: Date;
  }>;
  sessionStart: Date;
  isActive: boolean;
}

const ManualTrainingInterface: React.FC = () => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [activeSession, setActiveSession] = useState<TrainingSession | null>(null);
  const [userInput, setUserInput] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('');
  const [manualMode, setManualMode] = useState(true);
  const [learningEnabled, setLearningEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://localhost:3000/api';

  const personas: Persona[] = [
    {
      id: 'sales-executive',
      name: 'Sales Executive',
      description: 'Professional sales representative focused on B2B lead qualification',
      capabilities: ['Lead qualification', 'Value proposition', 'Relationship building'],
      examples: ['I\'d love to learn more about your business needs...', 'What challenges are you currently facing?']
    },
    {
      id: 'objection-handler',
      name: 'Objection Handler',
      description: 'Specialist in handling sales objections and concerns',
      capabilities: ['Active listening', 'Objection reframing', 'Value reinforcement'],
      examples: ['I understand your concern about the cost. Let me show you the ROI...', 'That\'s a great question. Many of our clients had the same concern...']
    },
    {
      id: 'technical-specialist',
      name: 'Technical Specialist',
      description: 'Expert in technical implementation and integration',
      capabilities: ['Technical architecture', 'Integration planning', 'Implementation guidance'],
      examples: ['For your integration, I recommend starting with the API documentation...', 'The implementation typically takes 2-3 weeks with your current setup...']
    },
    {
      id: 'urgency-specialist',
      name: 'Urgency Specialist',
      description: 'Expert in handling time-sensitive requests and urgent needs',
      capabilities: ['Rapid response', 'Expedited onboarding', 'Priority support'],
      examples: ['I understand this is urgent. Let me expedite the process for you...', 'For urgent implementations, we can have you live within 48 hours...']
    },
    {
      id: 'relationship-builder',
      name: 'Relationship Builder',
      description: 'Specialist in building long-term business relationships',
      capabilities: ['Long-term value', 'Partnership development', 'Strategic planning'],
      examples: ['I\'m excited about building a long-term partnership with you...', 'Let\'s think about this as a strategic relationship, not just a transaction...']
    },
    {
      id: 'price-negotiator',
      name: 'Price Negotiator',
      description: 'Expert in pricing discussions and value-based negotiations',
      capabilities: ['Value-based pricing', 'ROI demonstration', 'Flexible pricing'],
      examples: ['Let me show you the value you\'ll receive for this investment...', 'I can offer you a special package that fits your budget...']
    }
  ];

  useEffect(() => {
    loadTrainingSessions();
  }, []);

  const loadTrainingSessions = async () => {
    try {
      const response = await fetch(`${API_BASE}/training/sessions`);
      const data = await response.json();
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to load training sessions:', error);
    }
  };

  const createNewSession = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/training/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: `training-lead-${Date.now()}`,
          initialPersona: 'sales-executive'
        })
      });

      const data = await response.json();
      if (data.success) {
        const newSession: TrainingSession = {
          id: data.sessionId,
          leadId: data.leadId,
          currentPersona: 'sales-executive',
          conversationHistory: [],
          manualSwitches: [],
          sessionStart: new Date(),
          isActive: true
        };

        setSessions([...sessions, newSession]);
        setActiveSession(newSession);
        setSelectedPersona('sales-executive');
      }
    } catch (error) {
      console.error('Failed to create training session:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || !activeSession) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };

    // Add user message to conversation
    const updatedSession = {
      ...activeSession,
      conversationHistory: [...activeSession.conversationHistory, userMessage]
    };

    setActiveSession(updatedSession);
    setUserInput('');

    // Generate AI response
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/training/process-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          message: userInput,
          manualMode,
          currentPersona: activeSession.currentPersona
        })
      });

      const data = await response.json();
      if (data.success) {
        const aiMessage: ConversationMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          persona: data.persona
        };

        const finalSession = {
          ...updatedSession,
          conversationHistory: [...updatedSession.conversationHistory, aiMessage],
          currentPersona: data.persona
        };

        setActiveSession(finalSession);
        updateSession(finalSession);
      }
    } catch (error) {
      console.error('Failed to process message:', error);
    } finally {
      setLoading(false);
    }
  };

  const manuallySwitchPersona = async (newPersona: string, reason: string) => {
    if (!activeSession) return;

    const switchRecord = {
      fromPersona: activeSession.currentPersona,
      toPersona: newPersona,
      reason,
      timestamp: new Date()
    };

    const updatedSession = {
      ...activeSession,
      currentPersona: newPersona,
      manualSwitches: [...activeSession.manualSwitches, switchRecord]
    };

    setActiveSession(updatedSession);
    setSelectedPersona(newPersona);

    // Record the manual switch for learning
    try {
      await fetch(`${API_BASE}/training/record-manual-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          fromPersona: activeSession.currentPersona,
          toPersona: newPersona,
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
    setSessions(sessions.map(s => s.id === session.id ? session : s));
  };

  const endSession = async () => {
    if (!activeSession) return;

    try {
      await fetch(`${API_BASE}/training/sessions/${activeSession.id}/end`, {
        method: 'PUT'
      });

      const updatedSession = { ...activeSession, isActive: false };
      updateSession(updatedSession);
      setActiveSession(null);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const getPersonaByName = (personaId: string) => {
    return personas.find(p => p.id === personaId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manual Training Interface</h1>
          <p className="mt-2 text-gray-600">Train personas by manually switching during conversations</p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Manual Mode</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={manualMode}
                  onChange={(e) => setManualMode(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">
                  {manualMode ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Learning</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={learningEnabled}
                  onChange={(e) => setLearningEnabled(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">
                  {learningEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <div>
              <button
                onClick={createNewSession}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'New Training Session'}
              </button>
            </div>

            <div>
              <button
                onClick={endSession}
                disabled={!activeSession}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                End Session
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Persona Selection Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Persona Switch</h2>
            
            {activeSession && (
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Current Persona:</strong> {getPersonaByName(activeSession.currentPersona)?.name}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {personas.map((persona) => (
                <div
                  key={persona.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    activeSession?.currentPersona === persona.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPersona(persona.id)}
                >
                  <h3 className="font-medium text-gray-900">{persona.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{persona.description}</p>
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">Capabilities:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {persona.capabilities.slice(0, 2).map((capability, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedPersona && activeSession && selectedPersona !== activeSession.currentPersona && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-medium text-yellow-800 mb-2">Switch Persona</h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Switch from <strong>{getPersonaByName(activeSession.currentPersona)?.name}</strong> to{' '}
                  <strong>{getPersonaByName(selectedPersona)?.name}</strong>
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Reason for switch (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    id="switch-reason"
                  />
                  <button
                    onClick={() => {
                      const reason = (document.getElementById('switch-reason') as HTMLInputElement)?.value || 'Manual switch';
                      manuallySwitchPersona(selectedPersona, reason);
                    }}
                    className="w-full px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                  >
                    Switch to {getPersonaByName(selectedPersona)?.name}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Conversation Panel */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Training Conversation</h2>
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
                          {message.timestamp.toLocaleTimeString()}
                          {message.persona && (
                            <span className="ml-2 px-2 py-1 bg-gray-200 rounded">
                              {getPersonaByName(message.persona)?.name}
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
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No active training session</p>
                  <p className="text-sm mt-2">Create a new session to start training</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            {activeSession && (
              <div className="p-6 border-t">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!userInput.trim() || loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Training Sessions List */}
        {sessions.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Training Sessions</h2>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    activeSession?.id === session.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveSession(session)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">Session {session.id}</h3>
                      <p className="text-sm text-gray-600">
                        Messages: {session.conversationHistory.length} | 
                        Manual Switches: {session.manualSwitches.length}
                      </p>
                      <p className="text-xs text-gray-500">
                        Started: {session.sessionStart.toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        session.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {session.isActive ? 'Active' : 'Ended'}
                    </span>
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

export default ManualTrainingInterface; 