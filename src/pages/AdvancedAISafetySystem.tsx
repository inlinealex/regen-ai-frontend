import React, { useState, useEffect } from 'react';

interface SafetyAlert {
  id: string;
  type: 'hallucination' | 'jailbreak' | 'factual_error' | 'inappropriate' | 'bias' | 'privacy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  response: string;
  persona: string;
  leadId: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'escalated';
  reviewedBy?: string;
  reviewNotes?: string;
  confidence: number;
  safetyFlags: string[];
  factCheckResults?: FactCheckResult[];
  jailbreakAnalysis?: JailbreakAnalysis;
}

interface FactCheckResult {
  claim: string;
  verified: boolean;
  sources: string[];
  confidence: number;
  notes: string;
}

interface JailbreakAnalysis {
  detected: boolean;
  technique: string;
  confidence: number;
  blocked: boolean;
  fallbackResponse: string;
}

interface SafetyMetrics {
  totalInteractions: number;
  alertsGenerated: number;
  hallucinationRate: number;
  jailbreakAttempts: number;
  manualReviews: number;
  autoApprovals: number;
  averageResponseTime: number;
  safetyScore: number;
  factCheckAccuracy: number;
  jailbreakPreventionRate: number;
}

interface SafetyConfig {
  manualModeEnabled: boolean;
  hallucinationDetectionEnabled: boolean;
  jailbreakPreventionEnabled: boolean;
  trainingFeedbackEnabled: boolean;
  autoApprovalThreshold: number;
  factCheckingEnabled: boolean;
  sourceValidationEnabled: boolean;
  biasDetectionEnabled: boolean;
  privacyProtectionEnabled: boolean;
  emergencyShutdownEnabled: boolean;
  confidenceThreshold: number;
  maxResponseLength: number;
  forbiddenTopics: string[];
  safePersonas: string[];
  escalationRules: EscalationRule[];
}

interface EscalationRule {
  id: string;
  condition: string;
  action: 'flag' | 'block' | 'escalate' | 'shutdown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

interface SafetyReport {
  id: string;
  sessionId: string;
  personaId: string;
  leadId: string;
  startTime: string;
  endTime: string;
  totalMessages: number;
  safetyIncidents: number;
  averageConfidence: number;
  factCheckResults: FactCheckResult[];
  jailbreakAttempts: number;
  hallucinationDetections: number;
  recommendations: string[];
}

const AdvancedAISafetySystem: React.FC = () => {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [metrics, setMetrics] = useState<SafetyMetrics | null>(null);
  const [config, setConfig] = useState<SafetyConfig | null>(null);
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'config' | 'reports' | 'training' | 'monitoring'>('overview');
  const [selectedAlert, setSelectedAlert] = useState<SafetyAlert | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(false);

  const API_BASE = 'http://localhost:3000/api';

  useEffect(() => {
    loadSafetyData();
  }, []);

  useEffect(() => {
    if (realTimeMonitoring) {
      const interval = setInterval(loadSafetyData, 5000);
      return () => clearInterval(interval);
    }
  }, [realTimeMonitoring]);

  const loadSafetyData = async () => {
    setLoading(true);
    try {
      const [alertsRes, metricsRes, configRes, reportsRes] = await Promise.all([
        fetch(`${API_BASE}/ai-safety/alerts`),
        fetch(`${API_BASE}/ai-safety/metrics`),
        fetch(`${API_BASE}/ai-safety/config`),
        fetch(`${API_BASE}/ai-safety/reports`)
      ]);

      const alertsData = await alertsRes.json();
      const metricsData = await metricsRes.json();
      const configData = await configRes.json();
      const reportsData = await reportsRes.json();

      if (alertsData.success) setAlerts(alertsData.alerts);
      if (metricsData.success) setMetrics(metricsData.metrics);
      if (configData.success) setConfig(configData.config);
      if (reportsData.success) setReports(reportsData.reports);
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
      factual_error: 'bg-blue-100 text-blue-800',
      bias: 'bg-pink-100 text-pink-800',
      privacy: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type];
  };

  const getStatusColor = (status: SafetyAlert['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      escalated: 'bg-purple-100 text-purple-800'
    };
    return colors[status];
  };

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced AI Safety System</h1>
              <p className="mt-2 text-gray-600">Comprehensive AI safety monitoring and control</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setRealTimeMonitoring(!realTimeMonitoring)}
                className={`px-4 py-2 rounded-lg ${
                  realTimeMonitoring 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-white'
                }`}
              >
                {realTimeMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              </button>
              <button
                onClick={loadSafetyData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
              { id: 'reports', name: 'Reports' },
              { id: 'training', name: 'Training' },
              { id: 'monitoring', name: 'Monitoring' }
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
                <h3 className="text-sm font-medium text-gray-500">Safety Score</h3>
                <p className={`text-3xl font-bold ${getSafetyScoreColor(metrics.safetyScore)}`}>
                  {metrics.safetyScore}%
                </p>
                <p className="text-sm text-green-600">+2.1% from last week</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Safety Alerts</h3>
                <p className="text-3xl font-bold text-orange-600">{metrics.alertsGenerated}</p>
                <p className="text-sm text-gray-600">{(metrics.alertsGenerated / metrics.totalInteractions * 100).toFixed(1)}% rate</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Hallucination Rate</h3>
                <p className="text-3xl font-bold text-red-600">{metrics.hallucinationRate}%</p>
                <p className="text-sm text-green-600">-1.2% from last week</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Jailbreak Prevention</h3>
                <p className="text-3xl font-bold text-green-600">{metrics.jailbreakPreventionRate}%</p>
                <p className="text-sm text-green-600">+5.3% from last week</p>
              </div>
            </div>

            {/* Real-time Monitoring */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Real-time Safety Monitoring</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-medium text-red-900 mb-2">Critical Alerts</h3>
                  <div className="space-y-2">
                    {alerts.filter(a => a.severity === 'critical').slice(0, 3).map((alert) => (
                      <div key={alert.id} className="text-sm">
                        <p className="font-medium text-red-900">{alert.type}</p>
                        <p className="text-red-700">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-medium text-yellow-900 mb-2">Active Sessions</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Sessions</span>
                      <span className="font-medium">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span>High Risk</span>
                      <span className="font-medium text-red-600">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medium Risk</span>
                      <span className="font-medium text-yellow-600">7</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Safety Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>All Systems</span>
                      <span className="font-medium text-green-600">Operational</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto-Approvals</span>
                      <span className="font-medium">{metrics.autoApprovals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Manual Reviews</span>
                      <span className="font-medium">{metrics.manualReviews}</span>
                    </div>
                  </div>
                </div>
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
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>Confidence: {Math.round(alert.confidence * 100)}%</span>
                        <span>Persona: {alert.persona}</span>
                        {alert.safetyFlags.length > 0 && (
                          <span className="text-red-600">Flags: {alert.safetyFlags.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  ))}
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
                        <p className="text-sm text-gray-600">Persona: {alert.persona} | Lead: {alert.leadId}</p>
                      </div>
                      <span className="text-xs text-gray-500">{alert.timestamp}</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">AI Response:</p>
                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                          {alert.response}
                        </div>
                      </div>

                      {/* Fact Check Results */}
                      {alert.factCheckResults && alert.factCheckResults.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Fact Check Results:</p>
                          <div className="space-y-2">
                            {alert.factCheckResults.map((result, index) => (
                              <div key={index} className="bg-blue-50 p-3 rounded">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium">{result.claim}</span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    result.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {result.verified ? 'Verified' : 'Unverified'}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600">Confidence: {Math.round(result.confidence * 100)}%</p>
                                {result.sources.length > 0 && (
                                  <p className="text-xs text-gray-600">Sources: {result.sources.join(', ')}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Jailbreak Analysis */}
                      {alert.jailbreakAnalysis && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Jailbreak Analysis:</p>
                          <div className="bg-red-50 p-3 rounded">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Technique: {alert.jailbreakAnalysis.technique}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                alert.jailbreakAnalysis.blocked ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {alert.jailbreakAnalysis.blocked ? 'Blocked' : 'Not Blocked'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">Confidence: {Math.round(alert.jailbreakAnalysis.confidence * 100)}%</p>
                            {alert.jailbreakAnalysis.fallbackResponse && (
                              <p className="text-xs text-gray-600 mt-1">
                                Fallback: {alert.jailbreakAnalysis.fallbackResponse}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

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
                            onClick={() => updateAlertStatus(alert.id, 'escalated')}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                          >
                            Escalate
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAlert(alert);
                              setShowAlertModal(true);
                            }}
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
              <div className="space-y-6">
                {/* Core Safety Features */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Core Safety Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'manualModeEnabled', label: 'Manual Mode', description: 'Require manual approval for all AI interactions' },
                      { key: 'hallucinationDetectionEnabled', label: 'Hallucination Detection', description: 'Detect and flag AI hallucinations' },
                      { key: 'jailbreakPreventionEnabled', label: 'Jailbreak Prevention', description: 'Prevent prompt injection attacks' },
                      { key: 'factCheckingEnabled', label: 'Fact Checking', description: 'Verify factual accuracy of responses' },
                      { key: 'sourceValidationEnabled', label: 'Source Validation', description: 'Validate information sources' },
                      { key: 'biasDetectionEnabled', label: 'Bias Detection', description: 'Detect and flag biased responses' },
                      { key: 'privacyProtectionEnabled', label: 'Privacy Protection', description: 'Protect sensitive information' },
                      { key: 'emergencyShutdownEnabled', label: 'Emergency Shutdown', description: 'Enable emergency shutdown capability' }
                    ].map((feature) => (
                      <div key={feature.key} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{feature.label}</p>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                        <button
                          onClick={() => updateSafetyConfig({ [feature.key]: !config[feature.key as keyof SafetyConfig] })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            config[feature.key as keyof SafetyConfig] ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              config[feature.key as keyof SafetyConfig] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Thresholds and Limits */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Thresholds and Limits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Approval Threshold</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={config.autoApprovalThreshold}
                        onChange={(e) => updateSafetyConfig({ autoApprovalThreshold: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confidence Threshold</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={config.confidenceThreshold}
                        onChange={(e) => updateSafetyConfig({ confidenceThreshold: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Response Length</label>
                      <input
                        type="number"
                        min="100"
                        max="2000"
                        value={config.maxResponseLength}
                        onChange={(e) => updateSafetyConfig({ maxResponseLength: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Escalation Rules */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Escalation Rules</h4>
                  <div className="space-y-3">
                    {config.escalationRules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{rule.condition}</p>
                          <p className="text-sm text-gray-600">Action: {rule.action} | Severity: {rule.severity}</p>
                        </div>
                        <button
                          onClick={() => updateSafetyConfig({
                            escalationRules: config.escalationRules.map(r => 
                              r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                            )
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            rule.enabled ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              rule.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Safety Reports</h2>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Session {report.sessionId}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(report.startTime).toLocaleDateString()} - {new Date(report.endTime).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{report.totalMessages} messages</p>
                        <p className="text-sm text-red-600">{report.safetyIncidents} incidents</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Average Confidence</p>
                        <p className="text-sm font-medium">{Math.round(report.averageConfidence * 100)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Fact Checks</p>
                        <p className="text-sm font-medium">{report.factCheckResults.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Jailbreak Attempts</p>
                        <p className="text-sm font-medium text-red-600">{report.jailbreakAttempts}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Hallucinations</p>
                        <p className="text-sm font-medium text-red-600">{report.hallucinationDetections}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Recommendations:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {report.recommendations.map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Training Tab */}
        {activeTab === 'training' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Safety Training Data</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Training Examples</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Examples</span>
                      <span className="font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approved</span>
                      <span className="font-medium text-green-600">1,180</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Review</span>
                      <span className="font-medium text-yellow-600">67</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Safety Performance</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Detection Accuracy</span>
                      <span className="font-medium text-green-600">94.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>False Positives</span>
                      <span className="font-medium text-red-600">2.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>False Negatives</span>
                      <span className="font-medium text-red-600">1.8%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-2">Model Improvements</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Last Training</span>
                      <span className="font-medium">2 days ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Training</span>
                      <span className="font-medium">5 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Model Version</span>
                      <span className="font-medium">v2.1.4</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Training Actions</h3>
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Add Training Example
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    Retrain Model
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                    Export Training Data
                  </button>
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                    Validate Model
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Real-time Monitoring</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Live Activity Feed</h3>
                  <div className="h-64 bg-gray-50 rounded overflow-y-auto p-4 space-y-2">
                    {[
                      { time: '2:34 PM', event: 'Hallucination detected in Sales Executive persona', severity: 'medium' },
                      { time: '2:31 PM', event: 'Jailbreak attempt blocked successfully', severity: 'high' },
                      { time: '2:28 PM', event: 'Fact check completed - 3 claims verified', severity: 'low' },
                      { time: '2:25 PM', event: 'New training session started', severity: 'low' },
                      { time: '2:22 PM', event: 'Safety alert escalated to manual review', severity: 'high' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 text-sm">
                        <span className="text-gray-500">{activity.time}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          activity.severity === 'high' ? 'bg-red-100 text-red-800' :
                          activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {activity.severity}
                        </span>
                        <span className="text-gray-700">{activity.event}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">System Status</h3>
                  <div className="space-y-3">
                    {[
                      { service: 'Hallucination Detection', status: 'operational', uptime: '99.9%' },
                      { service: 'Jailbreak Prevention', status: 'operational', uptime: '99.8%' },
                      { service: 'Fact Checking', status: 'operational', uptime: '99.7%' },
                      { service: 'Bias Detection', status: 'operational', uptime: '99.9%' },
                      { service: 'Privacy Protection', status: 'operational', uptime: '99.8%' }
                    ].map((service, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{service.service}</p>
                          <p className="text-xs text-gray-600">Uptime: {service.uptime}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          service.status === 'operational' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {service.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alert Modal */}
        {showAlertModal && selectedAlert && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Review Safety Alert</h3>
                  <button
                    onClick={() => setShowAlertModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Alert Type</p>
                    <p className="text-sm text-gray-900">{selectedAlert.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Message</p>
                    <p className="text-sm text-gray-900">{selectedAlert.message}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">AI Response</p>
                    <p className="text-sm text-gray-900">{selectedAlert.response}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Review Notes</p>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Add review notes..."
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        updateAlertStatus(selectedAlert.id, 'approved');
                        setShowAlertModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        updateAlertStatus(selectedAlert.id, 'rejected');
                        setShowAlertModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setShowAlertModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
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

export default AdvancedAISafetySystem; 