import React, { useState, useEffect } from 'react';

interface PhoneNumber {
  id: string;
  number: string;
  type: 'twilio' | 'whatsapp';
  agent: string;
  campaign: string;
  status: 'active' | 'inactive' | 'testing';
  capabilities: {
    sms: boolean;
    voice: boolean;
    whatsapp: boolean;
  };
  usage: {
    totalMessages: number;
    totalCalls: number;
    monthlyLimit: number;
    currentMonth: number;
  };
  metadata: {
    region: string;
    timezone: string;
    language: string;
    industry: string;
  };
}

interface PhoneNumberPool {
  id: string;
  name: string;
  description: string;
  numbers: PhoneNumber[];
  rules: {
    maxConcurrentCalls: number;
    maxMessagesPerMinute: number;
    businessHours: {
      start: string;
      end: string;
      timezone: string;
    };
  };
}

interface UsageStats {
  totalNumbers: number;
  activeNumbers: number;
  totalMessages: number;
  totalCalls: number;
  byAgent: { [agent: string]: { count: number; messages: number; calls: number } };
  byCampaign: { [campaign: string]: { count: number; messages: number; calls: number } };
  byType: { [type: string]: { count: number; messages: number; calls: number } };
}

const PhoneNumberManagement: React.FC = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [phoneNumberPools, setPhoneNumberPools] = useState<PhoneNumberPool[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('numbers');
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://localhost:3000/api';

  useEffect(() => {
    loadPhoneNumbers();
    loadPhoneNumberPools();
    loadUsageStats();
  }, []);

  const loadPhoneNumbers = async () => {
    try {
      const response = await fetch(`${API_BASE}/phone-numbers`);
      const data = await response.json();
      if (data.success) {
        setPhoneNumbers(data.phoneNumbers);
      }
    } catch (error) {
      console.error('Failed to load phone numbers:', error);
    }
  };

  const loadPhoneNumberPools = async () => {
    try {
      const response = await fetch(`${API_BASE}/phone-numbers/pools`);
      const data = await response.json();
      if (data.success) {
        setPhoneNumberPools(data.pools);
      }
    } catch (error) {
      console.error('Failed to load phone number pools:', error);
    }
  };

  const loadUsageStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/phone-numbers/stats`);
      const data = await response.json();
      if (data.success) {
        setUsageStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    }
  };

  const updatePhoneNumberStatus = async (id: string, status: 'active' | 'inactive' | 'testing') => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/phone-numbers/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (data.success) {
        loadPhoneNumbers();
      }
    } catch (error) {
      console.error('Failed to update phone number status:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPhoneNumber = async (phoneNumber: Omit<PhoneNumber, 'id'>) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/phone-numbers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(phoneNumber)
      });

      const data = await response.json();
      if (data.success) {
        loadPhoneNumbers();
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to add phone number:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetMonthlyUsage = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/phone-numbers/reset-usage`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        loadPhoneNumbers();
        loadUsageStats();
      }
    } catch (error) {
      console.error('Failed to reset monthly usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Phone Number Management</h1>
          <p className="text-gray-600">Manage Twilio phone numbers, assignments, and usage tracking</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'numbers', name: 'Phone Numbers', count: phoneNumbers.length },
              { id: 'pools', name: 'Number Pools', count: phoneNumberPools.length },
              { id: 'usage', name: 'Usage Analytics' }
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
                {tab.count && tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Phone Numbers Tab */}
        {activeTab === 'numbers' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Phone Numbers List */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Phone Numbers</h2>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Number
                </button>
              </div>

              <div className="space-y-4">
                {phoneNumbers.map((number) => (
                  <div
                    key={number.id}
                    onClick={() => setSelectedNumber(number)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedNumber?.id === number.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{number.number}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {number.agent} • {number.campaign}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Type: {number.type}</span>
                          <span>Region: {number.metadata.region}</span>
                          <span>Timezone: {number.metadata.timezone}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          number.status === 'active' ? 'bg-green-100 text-green-800' :
                          number.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {number.status}
                        </span>
                        <div className="text-right">
                          <div className="text-xs text-gray-600">Usage</div>
                          <div className={`text-xs font-medium ${getUsageColor(getUsagePercentage(number.usage.currentMonth, number.usage.monthlyLimit))}`}>
                            {number.usage.currentMonth}/{number.usage.monthlyLimit}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex space-x-2">
                        {number.capabilities.sms && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">SMS</span>
                        )}
                        {number.capabilities.voice && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Voice</span>
                        )}
                        {number.capabilities.whatsapp && (
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">WhatsApp</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {number.usage.totalMessages} messages • {number.usage.totalCalls} calls
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone Number Details */}
            {selectedNumber && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Number Details</h2>
                  <div className="flex space-x-2">
                    <select
                      value={selectedNumber.status}
                      onChange={(e) => updatePhoneNumberStatus(selectedNumber.id, e.target.value as any)}
                      disabled={loading}
                      className="px-3 py-1 text-sm border rounded focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="testing">Testing</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Number:</span>
                        <span className="ml-2 font-medium">{selectedNumber.number}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2 font-medium">{selectedNumber.type}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Agent:</span>
                        <span className="ml-2 font-medium">{selectedNumber.agent}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Campaign:</span>
                        <span className="ml-2 font-medium">{selectedNumber.campaign}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Capabilities</h3>
                    <div className="flex space-x-2">
                      {selectedNumber.capabilities.sms && (
                        <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded">SMS</span>
                      )}
                      {selectedNumber.capabilities.voice && (
                        <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded">Voice</span>
                      )}
                      {selectedNumber.capabilities.whatsapp && (
                        <span className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded">WhatsApp</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Usage Statistics</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Monthly Usage</span>
                          <span>{selectedNumber.usage.currentMonth}/{selectedNumber.usage.monthlyLimit}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              getUsagePercentage(selectedNumber.usage.currentMonth, selectedNumber.usage.monthlyLimit) >= 90
                                ? 'bg-red-600'
                                : getUsagePercentage(selectedNumber.usage.currentMonth, selectedNumber.usage.monthlyLimit) >= 75
                                ? 'bg-yellow-600'
                                : 'bg-green-600'
                            }`}
                            style={{
                              width: `${getUsagePercentage(selectedNumber.usage.currentMonth, selectedNumber.usage.monthlyLimit)}%`
                            }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total Messages:</span>
                          <span className="ml-2 font-medium">{selectedNumber.usage.totalMessages}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Calls:</span>
                          <span className="ml-2 font-medium">{selectedNumber.usage.totalCalls}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Metadata</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Region:</span>
                        <span className="ml-2 font-medium">{selectedNumber.metadata.region}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Timezone:</span>
                        <span className="ml-2 font-medium">{selectedNumber.metadata.timezone}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Language:</span>
                        <span className="ml-2 font-medium">{selectedNumber.metadata.language}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Industry:</span>
                        <span className="ml-2 font-medium">{selectedNumber.metadata.industry}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add Phone Number Form */}
            {showAddForm && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Phone Number</h2>
                <AddPhoneNumberForm
                  onAdd={addPhoneNumber}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            )}
          </div>
        )}

        {/* Number Pools Tab */}
        {activeTab === 'pools' && (
          <div className="space-y-6">
            {phoneNumberPools.map((pool) => (
              <div key={pool.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{pool.name}</h3>
                    <p className="text-gray-600 mt-1">{pool.description}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {pool.numbers.length} numbers
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Pool Rules</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Max Concurrent Calls:</span>
                        <span className="font-medium">{pool.rules.maxConcurrentCalls}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Messages/Minute:</span>
                        <span className="font-medium">{pool.rules.maxMessagesPerMinute}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Business Hours:</span>
                        <span className="font-medium">
                          {pool.rules.businessHours.start} - {pool.rules.businessHours.end} ({pool.rules.businessHours.timezone})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Numbers in Pool</h4>
                    <div className="space-y-2">
                      {pool.numbers.map((number) => (
                        <div key={number.id} className="flex justify-between items-center text-sm">
                          <span>{number.number}</span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            number.status === 'active' ? 'bg-green-100 text-green-800' :
                            number.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {number.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Usage Analytics Tab */}
        {activeTab === 'usage' && usageStats && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-gray-900">{usageStats.totalNumbers}</div>
                <div className="text-sm text-gray-600">Total Numbers</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-green-600">{usageStats.activeNumbers}</div>
                <div className="text-sm text-gray-600">Active Numbers</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-blue-600">{usageStats.totalMessages}</div>
                <div className="text-sm text-gray-600">Total Messages</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-purple-600">{usageStats.totalCalls}</div>
                <div className="text-sm text-gray-600">Total Calls</div>
              </div>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* By Agent */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Agent</h3>
                <div className="space-y-3">
                  {Object.entries(usageStats.byAgent).map(([agent, stats]) => (
                    <div key={agent} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{agent}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{stats.count} numbers</div>
                        <div className="text-xs text-gray-600">{stats.messages} messages, {stats.calls} calls</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Campaign */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Campaign</h3>
                <div className="space-y-3">
                  {Object.entries(usageStats.byCampaign).map(([campaign, stats]) => (
                    <div key={campaign} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{campaign}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{stats.count} numbers</div>
                        <div className="text-xs text-gray-600">{stats.messages} messages, {stats.calls} calls</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Type */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Type</h3>
                <div className="space-y-3">
                  {Object.entries(usageStats.byType).map(([type, stats]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{type}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{stats.count} numbers</div>
                        <div className="text-xs text-gray-600">{stats.messages} messages, {stats.calls} calls</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Monthly Reset</h3>
                  <p className="text-sm text-gray-600">Reset usage counters for all phone numbers</p>
                </div>
                <button
                  onClick={resetMonthlyUsage}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Reset Monthly Usage
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add Phone Number Form Component
const AddPhoneNumberForm: React.FC<{
  onAdd: (phoneNumber: Omit<PhoneNumber, 'id'>) => void;
  onCancel: () => void;
}> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    number: '',
    type: 'twilio' as 'twilio' | 'whatsapp',
    agent: '',
    campaign: '',
    status: 'active' as 'active' | 'inactive' | 'testing',
    capabilities: {
      sms: true,
      voice: true,
      whatsapp: false
    },
    usage: {
      totalMessages: 0,
      totalCalls: 0,
      monthlyLimit: 1000,
      currentMonth: 0
    },
    metadata: {
      region: 'US',
      timezone: 'America/New_York',
      language: 'en',
      industry: 'technology'
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          required
          value={formData.number}
          onChange={(e) => setFormData({ ...formData, number: e.target.value })}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="+1234567890"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'twilio' | 'whatsapp' })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="twilio">Twilio</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="testing">Testing</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Agent</label>
          <input
            type="text"
            required
            value={formData.agent}
            onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="sales-executive"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Campaign</label>
          <input
            type="text"
            required
            value={formData.campaign}
            onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="lead-qualification"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Capabilities</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.capabilities.sms}
              onChange={(e) => setFormData({
                ...formData,
                capabilities: { ...formData.capabilities, sms: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-900">SMS</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.capabilities.voice}
              onChange={(e) => setFormData({
                ...formData,
                capabilities: { ...formData.capabilities, voice: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-900">Voice</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.capabilities.whatsapp}
              onChange={(e) => setFormData({
                ...formData,
                capabilities: { ...formData.capabilities, whatsapp: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-900">WhatsApp</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Monthly Limit</label>
          <input
            type="number"
            required
            value={formData.usage.monthlyLimit}
            onChange={(e) => setFormData({
              ...formData,
              usage: { ...formData.usage, monthlyLimit: parseInt(e.target.value) }
            })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Region</label>
          <select
            value={formData.metadata.region}
            onChange={(e) => setFormData({
              ...formData,
              metadata: { ...formData.metadata, region: e.target.value }
            })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="US">US</option>
            <option value="UK">UK</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
          </select>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add Phone Number
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PhoneNumberManagement; 