import React, { useState, useEffect } from 'react';

interface SafetyAlert {
  id: string;
  type: 'hallucination' | 'jailbreak' | 'inappropriate' | 'factual_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  response: string;
  persona: string;
  leadId: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewNotes?: string;
}

interface SafetyMetrics {
  totalInteractions: number;
  alertsGenerated: number;
  hallucinationRate: number;
  jailbreakAttempts: number;
  manualReviews: number;
  autoApprovals: number;
  averageResponseTime: number;
}

interface SafetyConfig {
  manualModeEnabled: boolean;
  hallucinationDetectionEnabled: boolean;
  jailbreakPreventionEnabled: boolean;
  trainingFeedbackEnabled: boolean;
  autoApprovalThreshold: number;
  factCheckingEnabled: boolean;
  sourceValidationEnabled: boolean;
}

const AISafetyMonitoringDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [metrics, setMetrics] = useState<SafetyMetrics | null>(null);
  const [config, setConfig] = useState<SafetyConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'config' | 'training'>('overview');
  const [selectedAlert, setSelectedAlert] = useState<SafetyAlert | null>(null);

  const API_BASE = 'http://localhost:3000/api';

  useEffect(() => {
    loadSafetyData();
  }, []);

  const loadSafetyData = async () => {
    setLoading(true);
    try {
      const [alertsRes, metricsRes, configRes] = await Promise.all([
        fetch(`${API_BASE}/ai-safety/alerts`),
        fetch(`${API_BASE}/ai-safety/metrics`),
        fetch(`${API_BASE}/ai-safety/config`)
      ]);

      const alertsData = await alertsRes.json();
      const metricsData = await metricsRes.json();
      const configData = await configRes.json();

      if (alertsData.success) setAlerts(alertsData.alerts);
      if (metricsData.success) setMetrics(metricsData.metrics);
      if (configData.success) setConfig(configData.config);
    } catch (error) {
      console.error('Failed to load safety data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAlertStatus = async (alertId: string, status: SafetyAlert['status'], notes?: string) => {
    try {
      const response = await fetch(`${API_BASE}/ai-safety/alerts/${alertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNotes: notes })
      });

      if (response.ok) {
        setAlerts(alerts.map(alert => 
          alert.id === alertId 
            ? { ...alert, status, reviewNotes: notes, reviewedBy: 'Staff Member' }
            : alert
        ));
      }
    } catch (error) {
      console.error('Failed to update alert status:', error);
    }
  };

  const updateSafetyConfig = async (updates: Partial<SafetyConfig>) => {
    try {
      const response = await fetch(`${API_BASE}/ai-safety/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setConfig(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('Failed to update safety config:', error);
    }
  };

  const getSeverityColor = (severity: SafetyAlert['severity']) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity];
  };

  const getAlertTypeColor = (type: SafetyAlert['type']) => {
    const colors = {
      hallucination: 'bg-purple-100 text-purple-800',
      jailbreak: 'bg-red-100 text-red-800',
      inappropriate: 'bg-orange-100 text-orange-800',
      factual_error: 'bg-blue-100 text-blue-800'
    };
    return colors[type];
  };

  const getStatusColor = (status: SafetyAlert['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Safety Monitoring</h1>
              <p className="mt-2 text-gray-600">Monitor and control AI safety features and alerts</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={loadSafetyData}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'alerts', name: 'Alerts' },
              { id: 'config', name: 'Configuration' },
              { id: 'training', name: 'Training Data' }
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
        {activeTab === 'overview' && metrics && (
          <div className="space-y-8">
            {/* Safety Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Interactions</h3>
                <p className="text-3xl font-bold text-gray-900">{metrics.totalInteractions}</p>
                <p className="text-sm text-green-600">+12% from last week</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Safety Alerts</h3>
                <p className="text-3xl font-bold text-orange-600">{metrics.alertsGenerated}</p>
                <p className="text-sm text-gray-600">{(metrics.alertsGenerated / metrics.totalInteractions * 100).toFixed(1)}% rate</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Hallucination Rate</h3>
                <p className="text-3xl font-bold text-red-600">{metrics.hallucinationRate}%</p>
                <p className="text-sm text-green-600">-2.1% from last week</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Manual Reviews</h3>
                <p className="text-3xl font-bold text-blue-600">{metrics.manualReviews}</p>
                <p className="text-sm text-gray-600">{(metrics.manualReviews / metrics.totalInteractions * 100).toFixed(1)}% rate</p>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Recent Safety Alerts</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${getAlertTypeColor(alert.type)}`}>
                              {alert.type.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(alert.status)}`}>
                              {alert.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900">{alert.message}</p>
                        </div>
                        <span className="text-xs text-gray-500">{alert.timestamp}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Response:</strong> {alert.response.substring(0, 100)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Safety Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Manual Mode</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${config?.manualModeEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {config?.manualModeEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Hallucination Detection</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${config?.hallucinationDetectionEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {config?.hallucinationDetectionEnabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Jailbreak Prevention</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${config?.jailbreakPreventionEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {config?.jailbreakPreventionEnabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Response Time</span>
                    <span className="text-sm font-medium text-gray-900">{metrics.averageResponseTime}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Auto Approvals</span>
                    <span className="text-sm font-medium text-gray-900">{metrics.autoApprovals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Jailbreak Attempts</span>
                    <span className="text-sm font-medium text-red-600">{metrics.jailbreakAttempts}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading alerts...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getAlertTypeColor(alert.type)}`}>
                            {alert.type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(alert.status)}`}>
                            {alert.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">{alert.message}</h3>
                        <p className="text-sm text-gray-600 mt-1">Persona: {alert.persona} | Lead: {alert.leadId}</p>
                      </div>
                      <span className="text-xs text-gray-500">{alert.timestamp}</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">AI Response:</p>
                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                          {alert.response}
                        </div>
                      </div>

                      {alert.reviewNotes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Review Notes:</p>
                          <div className="bg-blue-50 p-3 rounded text-sm text-gray-700">
                            {alert.reviewNotes}
                          </div>
                        </div>
                      )}

                      {alert.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateAlertStatus(alert.id, 'approved')}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateAlertStatus(alert.id, 'rejected')}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => setSelectedAlert(alert)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Review
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === 'config' && config && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Safety Configuration</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Manual Mode</h4>
                    <p className="text-sm text-gray-600">Require manual approval for all AI interactions</p>
                  </div>
                  <button
                    onClick={() => updateSafetyConfig({ manualModeEnabled: !config.manualModeEnabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.manualModeEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.manualModeEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Hallucination Detection</h4>
                    <p className="text-sm text-gray-600">Detect and flag potential AI hallucinations</p>
                  </div>
                  <button
                    onClick={() => updateSafetyConfig({ hallucinationDetectionEnabled: !config.hallucinationDetectionEnabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.hallucinationDetectionEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.hallucinationDetectionEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Jailbreak Prevention</h4>
                    <p className="text-sm text-gray-600">Prevent prompt injection and jailbreak attempts</p>
                  </div>
                  <button
                    onClick={() => updateSafetyConfig({ jailbreakPreventionEnabled: !config.jailbreakPreventionEnabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.jailbreakPreventionEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.jailbreakPreventionEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Training Feedback</h4>
                    <p className="text-sm text-gray-600">Collect feedback for AI training improvement</p>
                  </div>
                  <button
                    onClick={() => updateSafetyConfig({ trainingFeedbackEnabled: !config.trainingFeedbackEnabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.trainingFeedbackEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.trainingFeedbackEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Fact Checking</h4>
                    <p className="text-sm text-gray-600">Verify factual accuracy of AI responses</p>
                  </div>
                  <button
                    onClick={() => updateSafetyConfig({ factCheckingEnabled: !config.factCheckingEnabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.factCheckingEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.factCheckingEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Training Data Tab */}
        {activeTab === 'training' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Training Data Management</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900">Approved Examples</h4>
                    <p className="text-2xl font-bold text-blue-600">1,247</p>
                    <p className="text-sm text-blue-700">High-quality responses</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-900">Rejected Examples</h4>
                    <p className="text-2xl font-bold text-red-600">89</p>
                    <p className="text-sm text-red-700">Improvement needed</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900">Training Accuracy</h4>
                    <p className="text-2xl font-bold text-green-600">94.2%</p>
                    <p className="text-sm text-green-700">Model performance</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Recent Training Data</h4>
                  <div className="space-y-3">
                    {alerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                            <p className="text-xs text-gray-600 mt-1">Type: {alert.type}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(alert.status)}`}>
                            {alert.status}
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
      </div>
    </div>
  );
};

export default AISafetyMonitoringDashboard; 