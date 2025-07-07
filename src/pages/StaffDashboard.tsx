import React, { useState, useEffect } from 'react';

interface SafetyConfig {
  manualModeEnabled: boolean;
  hallucinationDetectionEnabled: boolean;
  jailbreakPreventionEnabled: boolean;
  trainingFeedbackEnabled: boolean;
}

interface InteractionRequest {
  leadId: string;
  personaId: string;
  message: string;
  context: any;
  requiresApproval: boolean;
}

interface TrainingData {
  id: string;
  leadId: string;
  personaId: string;
  originalMessage: string;
  aiResponse: string;
  approved: boolean;
  rejectionReason?: string;
  staffFeedback?: string;
  timestamp: Date;
}

const StaffDashboard: React.FC = () => {
  const [safetyConfig, setSafetyConfig] = useState<SafetyConfig | null>(null);
  const [approvalQueue, setApprovalQueue] = useState<InteractionRequest[]>([]);
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const API_BASE = 'http://localhost:3000/api';

  useEffect(() => {
    loadSafetyConfig();
    loadApprovalQueue();
    loadTrainingData();
  }, []);

  const loadSafetyConfig = async () => {
    try {
      const response = await fetch(`${API_BASE}/ai-safety/config`);
      const data = await response.json();
      if (data.success) {
        setSafetyConfig(data.config);
      }
    } catch (error) {
      console.error('Failed to load safety config:', error);
    }
  };

  const loadApprovalQueue = async () => {
    try {
      const response = await fetch(`${API_BASE}/ai-safety/approval-queue`);
      const data = await response.json();
      if (data.success) {
        setApprovalQueue(data.queue);
      }
    } catch (error) {
      console.error('Failed to load approval queue:', error);
    }
  };

  const loadTrainingData = async () => {
    try {
      const response = await fetch(`${API_BASE}/ai-safety/training-data`);
      const data = await response.json();
      if (data.success) {
        setTrainingData(data.trainingData);
      }
    } catch (error) {
      console.error('Failed to load training data:', error);
    }
  };

  const toggleSafetyFeature = async (feature: keyof SafetyConfig) => {
    if (!safetyConfig) return;

    setLoading(true);
    try {
      const newConfig = {
        ...safetyConfig,
        [feature]: !safetyConfig[feature]
      };

      const response = await fetch(`${API_BASE}/ai-safety/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });

      const data = await response.json();
      if (data.success) {
        setSafetyConfig(newConfig);
      }
    } catch (error) {
      console.error('Failed to update safety config:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveInteraction = async (interactionId: string, approved: boolean, feedback?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/ai-safety/approve-interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interactionId, approved, feedback })
      });

      const data = await response.json();
      if (data.success) {
        loadApprovalQueue();
        loadTrainingData();
      }
    } catch (error) {
      console.error('Failed to approve interaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportTrainingData = async () => {
    try {
      const response = await fetch(`${API_BASE}/ai-safety/export-training-data`);
      const data = await response.json();
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.exportData, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'training-data.json';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export training data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Staff Dashboard</h1>
          <p className="mt-2 text-gray-600">AI Safety & Training Management</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard' },
              { id: 'safety', name: 'Safety Controls' },
              { id: 'approvals', name: 'Approval Queue' },
              { id: 'training', name: 'Training Data' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Safety Status</h3>
              <div className="mt-4 space-y-2">
                {safetyConfig && Object.entries(safetyConfig).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {value ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Approval Queue</h3>
              <div className="mt-4">
                <p className="text-3xl font-bold text-blue-600">{approvalQueue.length}</p>
                <p className="text-sm text-gray-600">Pending approvals</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Training Data</h3>
              <div className="mt-4">
                <p className="text-3xl font-bold text-green-600">{trainingData.length}</p>
                <p className="text-sm text-gray-600">Total examples</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setActiveTab('safety')}
                  className="w-full text-left text-sm text-blue-600 hover:text-blue-800"
                >
                  Configure Safety Settings
                </button>
                <button
                  onClick={() => setActiveTab('approvals')}
                  className="w-full text-left text-sm text-blue-600 hover:text-blue-800"
                >
                  Review Approval Queue
                </button>
                <button
                  onClick={exportTrainingData}
                  className="w-full text-left text-sm text-blue-600 hover:text-blue-800"
                >
                  Export Training Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Safety Controls Tab */}
        {activeTab === 'safety' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Safety Configuration</h2>
            {safetyConfig && (
              <div className="space-y-4">
                {Object.entries(safetyConfig).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {key === 'manualModeEnabled' && 'Require manual approval for all AI interactions'}
                        {key === 'hallucinationDetectionEnabled' && 'Detect and flag potential AI hallucinations'}
                        {key === 'jailbreakPreventionEnabled' && 'Prevent prompt injection and jailbreak attempts'}
                        {key === 'trainingFeedbackEnabled' && 'Collect feedback for AI training improvement'}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSafetyFeature(key as keyof SafetyConfig)}
                      disabled={loading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Approval Queue Tab */}
        {activeTab === 'approvals' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Approval Queue</h2>
            {approvalQueue.length === 0 ? (
              <p className="text-gray-500">No interactions pending approval</p>
            ) : (
              <div className="space-y-4">
                {approvalQueue.map((interaction, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">Lead: {interaction.leadId}</h3>
                        <p className="text-sm text-gray-600">Persona: {interaction.personaId}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => approveInteraction(interaction.leadId, true)}
                          disabled={loading}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => approveInteraction(interaction.leadId, false, 'Rejected by staff')}
                          disabled={loading}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-700">{interaction.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Training Data Tab */}
        {activeTab === 'training' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Training Data</h2>
              <button
                onClick={exportTrainingData}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Export Data
              </button>
            </div>
            {trainingData.length === 0 ? (
              <p className="text-gray-500">No training data available</p>
            ) : (
              <div className="space-y-4">
                {trainingData.map((data) => (
                  <div key={data.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">Lead: {data.leadId}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(data.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        data.approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {data.approved ? 'Approved' : 'Rejected'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Original Message:</p>
                        <p className="text-sm text-gray-600">{data.originalMessage}</p>
                      </div>
                      {data.aiResponse && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">AI Response:</p>
                          <p className="text-sm text-gray-600">{data.aiResponse}</p>
                        </div>
                      )}
                      {data.rejectionReason && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Rejection Reason:</p>
                          <p className="text-sm text-red-600">{data.rejectionReason}</p>
                        </div>
                      )}
                      {data.staffFeedback && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Staff Feedback:</p>
                          <p className="text-sm text-gray-600">{data.staffFeedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard; 