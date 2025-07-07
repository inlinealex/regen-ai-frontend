import React, { useState, useEffect } from 'react';

interface LiveMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  engagedLeads: number;
  firstContacts: number;
  meetingsBooked: number;
  conversions: number;
  revenue: number;
  cost: number;
  roi: number;
}

interface CampaignPerformance {
  id: string;
  name: string;
  type: string;
  status: string;
  metrics: LiveMetrics;
  goals: {
    targetLeads: number;
    targetEngagementRate: number;
    targetFirstContactRate: number;
    targetMeetingRate: number;
    targetConversionRate: number;
    targetRevenue: number;
  };
  performance: {
    engagementRate: number;
    firstContactRate: number;
    meetingRate: number;
    conversionRate: number;
    roi: number;
    costPerLead: number;
    revenuePerLead: number;
  };
}

interface LeadActivity {
  id: string;
  email: string;
  company: string;
  status: 'new' | 'qualified' | 'engaged' | 'first_contact' | 'meeting_booked' | 'converted';
  campaignId: string;
  campaignName: string;
  qualificationScore: number;
  lastActivity: string;
  revenue: number;
}

const LiveDataDashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignPerformance[]>([]);
  const [recentLeads, setRecentLeads] = useState<LeadActivity[]>([]);
  const [overallMetrics, setOverallMetrics] = useState<LiveMetrics>({
    totalLeads: 0,
    qualifiedLeads: 0,
    engagedLeads: 0,
    firstContacts: 0,
    meetingsBooked: 0,
    conversions: 0,
    revenue: 0,
    cost: 0,
    roi: 0
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://localhost:3000/api';

  useEffect(() => {
    loadLiveData();
    if (autoRefresh) {
      const interval = setInterval(loadLiveData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [selectedTimeframe, autoRefresh]);

  const loadLiveData = async () => {
    setLoading(true);
    try {
      // Load campaign performance
      const campaignsResponse = await fetch(`${API_BASE}/campaigns/performance?timeframe=${selectedTimeframe}`);
      const campaignsData = await campaignsResponse.json();
      setCampaigns(campaignsData.campaigns || []);

      // Load recent lead activity
      const leadsResponse = await fetch(`${API_BASE}/leads/recent?timeframe=${selectedTimeframe}`);
      const leadsData = await leadsResponse.json();
      setRecentLeads(leadsData.leads || []);

      // Calculate overall metrics
      const overall = campaignsData.campaigns?.reduce((acc: LiveMetrics, campaign: CampaignPerformance) => {
        acc.totalLeads += campaign.metrics.totalLeads;
        acc.qualifiedLeads += campaign.metrics.qualifiedLeads;
        acc.engagedLeads += campaign.metrics.engagedLeads;
        acc.firstContacts += campaign.metrics.firstContacts;
        acc.meetingsBooked += campaign.metrics.meetingsBooked;
        acc.conversions += campaign.metrics.conversions;
        acc.revenue += campaign.metrics.revenue;
        acc.cost += campaign.metrics.cost;
        return acc;
      }, {
        totalLeads: 0,
        qualifiedLeads: 0,
        engagedLeads: 0,
        firstContacts: 0,
        meetingsBooked: 0,
        conversions: 0,
        revenue: 0,
        cost: 0,
        roi: 0
      });

      if (overall) {
        overall.roi = overall.cost > 0 ? (overall.revenue - overall.cost) / overall.cost : 0;
        setOverallMetrics(overall);
      }
    } catch (error) {
      console.error('Failed to load live data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-600',
      paused: 'text-yellow-600',
      draft: 'text-gray-600',
      completed: 'text-blue-600',
      testing: 'text-purple-600'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const getPerformanceColor = (rate: number, target: number) => {
    if (rate >= target) return 'text-green-600';
    if (rate >= target * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Live Data Dashboard</h1>
              <p className="mt-2 text-gray-600">Real-time campaign performance and lead activity</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Timeframe:</label>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Auto-refresh</span>
              </div>
              <button
                onClick={loadLiveData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Overall Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{overallMetrics.totalLeads}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Meetings Booked</p>
                <p className="text-2xl font-bold text-gray-900">{overallMetrics.meetingsBooked}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(overallMetrics.revenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">ROI</p>
                <p className={`text-2xl font-bold ${overallMetrics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(overallMetrics.roi)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campaign Performance */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Campaign Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meetings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-500">{campaign.type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.metrics.totalLeads}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.metrics.meetingsBooked}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(campaign.metrics.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Lead Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Lead Activity</h2>
            </div>
            <div className="overflow-y-auto max-h-96">
              <div className="divide-y divide-gray-200">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {lead.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{lead.email}</p>
                          <p className="text-sm text-gray-500">{lead.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                          lead.status === 'meeting_booked' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'engaged' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.status.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatCurrency(lead.revenue)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>Score: {lead.qualificationScore}%</span>
                      <span>{lead.lastActivity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Performance Metrics</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">{campaign.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Engagement Rate:</span>
                      <span className={getPerformanceColor(campaign.performance.engagementRate, campaign.goals.targetEngagementRate)}>
                        {formatPercentage(campaign.performance.engagementRate)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Meeting Rate:</span>
                      <span className={getPerformanceColor(campaign.performance.meetingRate, campaign.goals.targetMeetingRate)}>
                        {formatPercentage(campaign.performance.meetingRate)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">ROI:</span>
                      <span className={campaign.performance.roi >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatPercentage(campaign.performance.roi)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Cost/Lead:</span>
                      <span className="text-gray-900">
                        {formatCurrency(campaign.performance.costPerLead)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveDataDashboard; 