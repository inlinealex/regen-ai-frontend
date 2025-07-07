import React, { useState, useEffect } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  persona?: string;
  switchReason?: string;
  channel?: 'whatsapp' | 'sms' | 'email' | 'test';
  messageId?: string;
}

interface LeadData {
  id: string;
  name: string;
  company: string;
  industry: string;
  companySize: string;
  email: string;
  phone?: string;
  linkedin?: string;
  jobTitle?: string;
  budget?: string;
  authority?: string;
  need?: string;
  timeline?: string;
  lastContacted?: string;
  status: 'new' | 'qualified' | 'contacted' | 'converted' | 'lost';
  qualificationScore: number;
  notes?: string;
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  leadData: LeadData;
  initialPersona: string;
  testMessages: string[];
  expectedSwitches: Array<{
    messageIndex: number;
    fromPersona: string;
    toPersona: string;
    reason: string;
  }>;
}

const TestingChatWindow: React.FC = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [currentPersona, setCurrentPersona] = useState('');
  const [loading, setLoading] = useState(false);
  const [testMode, setTestMode] = useState<'manual' | 'scenario'>('manual');
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null);
  const [scenarioStep, setScenarioStep] = useState(0);
  const [autoMode, setAutoMode] = useState(false);
  const [bypassMode, setBypassMode] = useState(true);
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null);
  const [availableLeads, setAvailableLeads] = useState<LeadData[]>([]);
  const [communicationChannel, setCommunicationChannel] = useState<'whatsapp' | 'sms' | 'email' | 'test'>('whatsapp');
  const [showLeadSelector, setShowLeadSelector] = useState(false);

  const API_BASE = 'http://localhost:3000/api';

  // Sample leads for testing
  const sampleLeads: LeadData[] = [
    {
      id: '1',
      name: 'John Smith',
      company: 'TechCorp Inc',
      industry: 'Technology',
      companySize: '201-1000',
      email: 'john@techcorp.com',
      phone: '+1234567890',
      linkedin: 'linkedin.com/in/johnsmith',
      jobTitle: 'VP of Sales',
      budget: '75000',
      authority: 'decision_maker',
      need: 'Improve lead conversion rates',
      timeline: 'immediate',
      lastContacted: '2024-01-15',
      status: 'qualified',
      qualificationScore: 85,
      notes: 'Interested in AI-powered lead generation'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      company: 'DataFlow Solutions',
      industry: 'Technology',
      companySize: '51-200',
      email: 'sarah@dataflow.com',
      phone: '+1234567891',
      linkedin: 'linkedin.com/in/sarahjohnson',
      jobTitle: 'Marketing Director',
      budget: '45000',
      authority: 'influencer',
      need: 'Data processing solution',
      timeline: 'within_1_month',
      lastContacted: '2024-01-10',
      status: 'contacted',
      qualificationScore: 72,
      notes: 'Looking for scalable data solutions'
    },
    {
      id: '3',
      name: 'Mike Davis',
      company: 'QuickStart Ltd',
      industry: 'Retail',
      companySize: '50-200',
      email: 'mike@quickstart.com',
      phone: '+1234567892',
      linkedin: 'linkedin.com/in/mikedavis',
      jobTitle: 'CEO',
      budget: '100000',
      authority: 'decision_maker',
      need: 'ASAP implementation',
      timeline: 'immediate',
      lastContacted: '2024-01-20',
      status: 'qualified',
      qualificationScore: 90,
      notes: 'Urgent need for lead generation'
    }
  ];

  const testScenarios: TestScenario[] = [
    {
      id: 'objection-test',
      name: 'Objection Handling Test',
      description: 'Test persona switching when customer raises objections',
      leadData: sampleLeads[0],
      initialPersona: 'sales-executive',
      testMessages: [
        'Hi, I\'m interested in your AI lead generation services',
        'What\'s the cost?',
        'That seems expensive for our budget',
        'Can you show me the ROI?',
        'I need to think about it'
      ],
      expectedSwitches: [
        { messageIndex: 2, fromPersona: 'sales-executive', toPersona: 'price-negotiator', reason: 'Pricing discussion' },
        { messageIndex: 3, fromPersona: 'price-negotiator', toPersona: 'objection-handler', reason: 'Objection detected' }
      ]
    },
    {
      id: 'technical-test',
      name: 'Technical Support Test',
      description: 'Test persona switching for technical questions',
      leadData: sampleLeads[1],
      initialPersona: 'sales-executive',
      testMessages: [
        'Hello, I\'m looking for a solution for our data processing needs',
        'How does the API integration work?',
        'What about the technical implementation?',
        'How long does setup typically take?',
        'Can you provide technical documentation?'
      ],
      expectedSwitches: [
        { messageIndex: 1, fromPersona: 'sales-executive', toPersona: 'technical-specialist', reason: 'Technical question' },
        { messageIndex: 2, fromPersona: 'technical-specialist', toPersona: 'technical-specialist', reason: 'Technical implementation' }
      ]
    },
    {
      id: 'urgency-test',
      name: 'Urgency Handling Test',
      description: 'Test persona switching for urgent requests',
      leadData: sampleLeads[2],
      initialPersona: 'sales-executive',
      testMessages: [
        'Hi, we need this implemented ASAP',
        'Our deadline is next week',
        'Can you expedite the process?',
        'We\'re willing to pay extra for speed',
        'When can you start?'
      ],
      expectedSwitches: [
        { messageIndex: 0, fromPersona: 'sales-executive', toPersona: 'urgency-specialist', reason: 'Urgency detected' },
        { messageIndex: 2, fromPersona: 'urgency-specialist', toPersona: 'urgency-specialist', reason: 'Expedited process request' }
      ]
    }
  ];

  useEffect(() => {
    setAvailableLeads(sampleLeads);
  }, []);

  useEffect(() => {
    if (selectedScenario && autoMode) {
      runScenario();
    }
  }, [selectedScenario, autoMode]);

  const startNewConversation = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/testing/start-conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testMode: true,
          bypassMode: bypassMode,
          communicationChannel: communicationChannel,
          leadData: selectedLead || selectedScenario?.leadData || {
            name: 'Test User',
            company: 'Test Company',
            industry: 'Technology',
            companySize: '51-200',
            email: 'test@example.com'
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setConversationId(data.conversationId);
        setCurrentPersona(data.initialPersona);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || !conversationId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date(),
      channel: communicationChannel,
      messageId: `msg_${Date.now()}`
    };

    setMessages([...messages, userMessage]);
    setUserInput('');

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/testing/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: userInput,
          currentPersona,
          bypassMode,
          communicationChannel,
          leadData: selectedLead || selectedScenario?.leadData
        })
      });

      const data = await response.json();
      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          persona: data.persona,
          switchReason: data.switchReason,
          channel: communicationChannel,
          messageId: data.messageId
        };

        setMessages(prev => [...prev, assistantMessage]);
        setCurrentPersona(data.persona);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const runScenario = async () => {
    if (!selectedScenario) return;

    setScenarioStep(0);
    await startNewConversation();

    for (let i = 0; i < selectedScenario.testMessages.length; i++) {
      setUserInput(selectedScenario.testMessages[i]);
      await new Promise(resolve => setTimeout(resolve, 2000));
      await sendMessage();
      setScenarioStep(i + 1);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setConversationId(null);
    setCurrentPersona('');
    setScenarioStep(0);
  };

  const getPersonaDisplayName = (personaId: string) => {
    const personas = {
      'sales-executive': 'Sales Executive',
      'objection-handler': 'Objection Handler',
      'technical-specialist': 'Technical Specialist',
      'urgency-specialist': 'Urgency Specialist',
      'relationship-builder': 'Relationship Builder',
      'price-negotiator': 'Price Negotiator'
    };
    return personas[personaId as keyof typeof personas] || personaId;
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return '💬';
      case 'sms': return '📱';
      case 'email': return '📧';
      default: return '🧪';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Testing Chat Window</h1>
                <p className="text-gray-600 mt-1">
                  Simulate conversations with AI personas in a controlled environment
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Bypass Mode:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bypassMode}
                      onChange={(e) => setBypassMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="text-sm text-gray-600">
                    {bypassMode ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Channel:</span>
                  <select
                    value={communicationChannel}
                    onChange={(e) => setCommunicationChannel(e.target.value as any)}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                    <option value="test">Test</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left Panel - Controls */}
            <div className="space-y-6">
              {/* Lead Selection */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Assignment</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowLeadSelector(!showLeadSelector)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {selectedLead ? `Selected: ${selectedLead.name}` : 'Select Lead'}
                  </button>
                  
                  {showLeadSelector && (
                    <div className="mt-3 space-y-2">
                      {availableLeads.map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowLeadSelector(false);
                          }}
                          className="p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <div className="font-medium text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-600">{lead.company}</div>
                          <div className="text-xs text-gray-500">Score: {lead.qualificationScore}/100</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {selectedLead && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <div className="text-sm font-medium text-blue-900">Current Lead:</div>
                      <div className="text-sm text-blue-800">{selectedLead.name} - {selectedLead.company}</div>
                      <div className="text-xs text-blue-700">Score: {selectedLead.qualificationScore}/100</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Test Mode Selection */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Mode</h3>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTestMode('manual')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        testMode === 'manual'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Manual
                    </button>
                    <button
                      onClick={() => setTestMode('scenario')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        testMode === 'scenario'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Scenario
                    </button>
                  </div>
                </div>
              </div>

              {/* Scenario Selection */}
              {testMode === 'scenario' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Scenarios</h3>
                  <div className="space-y-3">
                    {testScenarios.map((scenario) => (
                      <div
                        key={scenario.id}
                        onClick={() => setSelectedScenario(scenario)}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          selectedScenario?.id === scenario.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{scenario.name}</div>
                        <div className="text-sm text-gray-600">{scenario.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Lead: {scenario.leadData.name} - {scenario.leadData.company}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Controls</h3>
                <div className="space-y-3">
                  <button
                    onClick={startNewConversation}
                    disabled={loading}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Starting...' : 'Start New Conversation'}
                  </button>
                  
                  {testMode === 'scenario' && selectedScenario && (
                    <>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={autoMode}
                          onChange={(e) => setAutoMode(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Auto-run scenario</span>
                      </div>
                      <button
                        onClick={runScenario}
                        disabled={loading}
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
                      >
                        Run Scenario
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={resetConversation}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Reset Conversation
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conversation ID:</span>
                    <span className="font-mono text-gray-900">
                      {conversationId ? conversationId.slice(0, 8) + '...' : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Persona:</span>
                    <span className="text-gray-900">
                      {currentPersona ? getPersonaDisplayName(currentPersona) : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Messages:</span>
                    <span className="text-gray-900">{messages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bypass Mode:</span>
                    <span className={`font-medium ${bypassMode ? 'text-green-600' : 'text-red-600'}`}>
                      {bypassMode ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Channel:</span>
                    <span className="text-gray-900">
                      {getChannelIcon(communicationChannel)} {communicationChannel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Panel - Chat */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-lg h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedLead ? `${selectedLead.name} - ${selectedLead.company}` : 'Test Conversation'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {currentPersona ? getPersonaDisplayName(currentPersona) : 'No persona selected'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bypassMode 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {bypassMode ? 'BYPASS' : 'LIVE'}
                      </span>
                      <span className="text-2xl">{getChannelIcon(communicationChannel)}</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <div className="text-4xl mb-4">💬</div>
                      <p>No messages yet. Start a conversation to begin testing.</p>
                    </div>
                  ) : (
                    messages.map((message) => (
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
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                            {message.persona && message.role === 'assistant' && (
                              <span className="ml-2">• {getPersonaDisplayName(message.persona)}</span>
                            )}
                            {message.switchReason && (
                              <span className="ml-2">• {message.switchReason}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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

                {/* Input */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!conversationId || loading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!userInput.trim() || !conversationId || loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestingChatWindow; 