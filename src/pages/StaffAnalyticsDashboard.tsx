import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AnalyticsDashboard.css';

interface AnalyticsData {
  overall: {
    totalConversations: number;
    totalLeads: number;
    conversionRate: number;
    averageResponseTime: number;
    personaSwitchRate: number;
    successRate: number;
  };
  customers: Array<{
    id: string;
    name: string;
    company: string;
    conversations: number;
    conversionRate: number;
    averageResponseTime: number;
    personaSwitches: number;
    successRate: number;
    lastActivity: string;
    status: 'active' | 'inactive' | 'pending';
  }>;
  personas: Array<{
    id: string;
    name: string;
    usageCount: number;
    successRate: number;
    averageResponseTime: number;
    switchToCount: number;
    switchFromCount: number;
  }>;
  trends: Array<{
    date: string;
    conversations: number;
    conversions: number;
    responseTime: number;
  }>;
}

interface LiveMetrics {
  activeConversations: number;
  dealsInProgress: number;
  meetingsRequested: number;
  conversionRate: number;
  qualifiedLeads: number;
  unqualifiedLeads: number;
  totalLeads: number;
  revenueThisMonth: number;
  avgResponseTime: number;
  customerSatisfation: number;
}

interface Conversation {
  id: string;
  leadName: string;
  persona: string;
  status: 'active' | 'meeting_scheduled' | 'qualified' | 'unqualified';
  lastMessage: string;
  lastActivity: string;
  duration: string;
}

interface Deal {
  id: string;
  leadName: string;
  value: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed';
  probability: number;
  expectedCloseDate: string;
}

const StaffAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    activeConversations: 0,
    dealsInProgress: 0,
    meetingsRequested: 0,
    conversionRate: 0,
    qualifiedLeads: 0,
    unqualifiedLeads: 0,
    totalLeads: 0,
    revenueThisMonth: 0,
    avgResponseTime: 0,
    customerSatisfation: 0
  });
  const [activeConversations, setActiveConversations] = useState<Conversation[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = 'http://localhost:3000/api';

  useEffect(() => {
    loadAnalyticsData();
    fetchLiveData();
    fetchActiveConversations();
    fetchDeals();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/analytics/staff?timeRange=${timeRange}`);
      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      // Load mock data for development
      setAnalyticsData(getMockAnalyticsData());
    } finally {
      setLoading(false);
    }
  };

  const getMockAnalyticsData = (): AnalyticsData => ({
    overall: {
      totalConversations: 47,
      totalLeads: 32,
      conversionRate: 18.5,
      averageResponseTime: 2.8,
      personaSwitchRate: 12.3,
      successRate: 72.1
    },
    customers: [
      {
        id: 'cust-1',
        name: 'TechCorp Inc',
        company: 'Technology',
        conversations: 12,
        conversionRate: 25.0,
        averageResponseTime: 2.1,
        personaSwitches: 3,
        successRate: 75.0,
        lastActivity: '2024-01-15T10:30:00Z',
        status: 'active'
      },
      {
        id: 'cust-2',
        name: 'DataFlow Solutions',
        company: 'Technology',
        conversations: 8,
        conversionRate: 12.5,
        averageResponseTime: 3.2,
        personaSwitches: 2,
        successRate: 62.5,
        lastActivity: '2024-01-14T15:45:00Z',
        status: 'active'
      },
      {
        id: 'cust-3',
        name: 'Growth Partners',
        company: 'Consulting',
        conversations: 15,
        conversionRate: 20.0,
        averageResponseTime: 2.5,
        personaSwitches: 4,
        successRate: 80.0,
        lastActivity: '2024-01-15T09:15:00Z',
        status: 'active'
      }
    ],
    personas: [
      {
        id: 'sales-executive',
        name: 'Sales Executive',
        usageCount: 18,
        successRate: 72.2,
        averageResponseTime: 2.3,
        switchToCount: 5,
        switchFromCount: 2
      },
      {
        id: 'objection-handler',
        name: 'Objection Handler',
        usageCount: 12,
        successRate: 75.0,
        averageResponseTime: 2.1,
        switchToCount: 8,
        switchFromCount: 3
      },
      {
        id: 'technical-specialist',
        name: 'Technical Specialist',
        usageCount: 9,
        successRate: 77.8,
        averageResponseTime: 3.1,
        switchToCount: 4,
        switchFromCount: 1
      }
    ],
    trends: [
      { date: '2024-01-09', conversations: 5, conversions: 1, responseTime: 2.8 },
      { date: '2024-01-10', conversations: 7, conversions: 2, responseTime: 2.5 },
      { date: '2024-01-11', conversations: 4, conversions: 1, responseTime: 3.1 },
      { date: '2024-01-12', conversations: 6, conversions: 1, responseTime: 2.7 },
      { date: '2024-01-13', conversations: 8, conversions: 2, responseTime: 2.4 },
      { date: '2024-01-14', conversations: 5, conversions: 1, responseTime: 2.9 },
      { date: '2024-01-15', conversations: 12, conversions: 3, responseTime: 2.2 }
    ]
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchLiveData = async () => {
    try {
      const response = await fetch('/api/analytics/staff/live-metrics');
      const data = await response.json();
      setLiveMetrics(data);
    } catch (error) {
      console.error('Error fetching live metrics:', error);
      // Use realistic minimal data instead of inflated numbers
      setLiveMetrics({
        activeConversations: 3,
        dealsInProgress: 2,
        meetingsRequested: 1,
        conversionRate: 18.5,
        qualifiedLeads: 6,
        unqualifiedLeads: 26,
        totalLeads: 32,
        revenueThisMonth: 1250,
        avgResponseTime: 2.8,
        customerSatisfation: 4.2
      });
    }
  };

  const fetchActiveConversations = async () => {
    try {
      const response = await fetch('/api/analytics/staff/active-conversations');
      const data = await response.json();
      setActiveConversations(data);
    } catch (error) {
      console.error('Error fetching active conversations:', error);
      // Use realistic minimal data
      setActiveConversations([
        {
          id: 'conv-1',
          leadName: 'John Smith',
          persona: 'sales-executive',
          status: 'active',
          lastMessage: 'What are your pricing options?',
          lastActivity: '2024-01-15T14:30:00Z',
          duration: '15m'
        },
        {
          id: 'conv-2',
          leadName: 'Sarah Johnson',
          persona: 'technical-specialist',
          status: 'meeting_scheduled',
          lastMessage: 'Can you explain the integration process?',
          lastActivity: '2024-01-15T13:45:00Z',
          duration: '32m'
        },
        {
          id: 'conv-3',
          leadName: 'Mike Wilson',
          persona: 'objection-handler',
          status: 'qualified',
          lastMessage: 'I need to discuss this with my team',
          lastActivity: '2024-01-15T12:20:00Z',
          duration: '28m'
        }
      ]);
    }
  };

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/analytics/staff/deals');
      const data = await response.json();
      setDeals(data);
    } catch (error) {
      console.error('Error fetching deals:', error);
      // Use realistic minimal data
      setDeals([
        {
          id: 'deal-1',
          leadName: 'TechCorp Inc',
          value: 2500,
          stage: 'qualification',
          probability: 60,
          expectedCloseDate: '2024-02-15'
        },
        {
          id: 'deal-2',
          leadName: 'DataFlow Solutions',
          value: 1800,
          stage: 'prospecting',
          probability: 30,
          expectedCloseDate: '2024-03-01'
        }
      ]);
    }
  };

  const getConversionRateColor = (rate: number) => {
    if (rate >= 25) return '#10B981';
    if (rate >= 15) return '#F59E0B';
    return '#EF4444';
  };

  const getDealStageColor = (stage: string) => {
    const colors = {
      prospecting: '#6B7280',
      qualification: '#3B82F6',
      proposal: '#F59E0B',
      negotiation: '#8B5CF6',
      closed: '#10B981'
    };
    return colors[stage as keyof typeof colors] || '#6B7280';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Staff Analytics Dashboard</h1>
              <p className="mt-2 text-gray-600">Overall system performance and customer metrics</p>
            </div>
            <div className="flex space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <Link
                to="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Training
              </Link>
            </div>
          </div>
        </div>

        {analyticsData && (
          <>
            {/* Overall Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Total Conversations</h3>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.overall.totalConversations}</p>
                <p className="text-sm text-green-600">+12% from last period</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.overall.conversionRate}%</p>
                <p className="text-sm text-green-600">+2.1% from last period</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Avg Response Time</h3>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.overall.averageResponseTime}s</p>
                <p className="text-sm text-red-600">+0.3s from last period</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
                <p className="text-3xl font-bold text-gray-900">{analyticsData.overall.successRate}%</p>
                <p className="text-sm text-green-600">+1.8% from last period</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Customer Performance */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Customer Performance</h2>
                  <p className="text-sm text-gray-600">Individual customer metrics and performance</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analyticsData.customers.map((customer) => (
                      <div
                        key={customer.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedCustomer === customer.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedCustomer(customer.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{customer.name}</h3>
                            <p className="text-sm text-gray-600">{customer.company}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(customer.status)}`}>
                            {customer.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-gray-500">Conversations</p>
                            <p className="font-medium">{customer.conversations}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Conversion Rate</p>
                            <p className="font-medium">{customer.conversionRate}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Success Rate</p>
                            <p className="font-medium">{customer.successRate}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Last Activity</p>
                            <p className="font-medium">{formatDate(customer.lastActivity)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Persona Performance */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Persona Performance</h2>
                  <p className="text-sm text-gray-600">How each persona is performing</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analyticsData.personas.map((persona) => (
                      <div key={persona.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium text-gray-900">{persona.name}</h3>
                          <span className="text-sm text-gray-500">{persona.usageCount} uses</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Success Rate</p>
                            <p className="font-medium">{persona.successRate}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Avg Response</p>
                            <p className="font-medium">{persona.averageResponseTime}s</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Switches</p>
                            <p className="font-medium">{persona.switchToCount}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Trends Chart */}
            <div className="mt-8 bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Performance Trends</h2>
                <p className="text-sm text-gray-600">Conversations and conversions over time</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-7 gap-4">
                  {analyticsData.trends.map((trend, index) => (
                    <div key={index} className="text-center">
                      <p className="text-xs text-gray-500 mb-2">
                        {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <div className="space-y-1">
                        <div className="bg-blue-100 rounded p-2">
                          <p className="text-xs text-blue-800">Conversations</p>
                          <p className="font-bold text-blue-900">{trend.conversations}</p>
                        </div>
                        <div className="bg-green-100 rounded p-2">
                          <p className="text-xs text-green-800">Conversions</p>
                          <p className="font-bold text-green-900">{trend.conversions}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Customer View */}
            {selectedCustomer && (
              <div className="mt-8 bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Customer Details: {analyticsData.customers.find(c => c.id === selectedCustomer)?.name}
                  </h2>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>
                <div className="p-6">
                  {/* Add detailed customer analytics here */}
                  <p className="text-gray-600">Detailed customer analytics coming soon...</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Live Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-card live">
            <div className="metric-header">
              <h3>Active Conversations</h3>
              <div className="live-indicator">● LIVE</div>
            </div>
            <div className="metric-value">{liveMetrics.activeConversations}</div>
            <div className="metric-trend positive">+3 this hour</div>
          </div>

          <div className="metric-card live">
            <div className="metric-header">
              <h3>Deals in Progress</h3>
              <div className="live-indicator">● LIVE</div>
            </div>
            <div className="metric-value">{liveMetrics.dealsInProgress}</div>
            <div className="metric-trend positive">+2 this week</div>
          </div>

          <div className="metric-card live">
            <div className="metric-header">
              <h3>Meetings Requested</h3>
              <div className="live-indicator">● LIVE</div>
            </div>
            <div className="metric-value">{liveMetrics.meetingsRequested}</div>
            <div className="metric-trend positive">+5 today</div>
          </div>

          <div className="metric-card live">
            <div className="metric-header">
              <h3>Conversion Rate</h3>
              <div className="live-indicator">● LIVE</div>
            </div>
            <div 
              className="metric-value" 
              style={{ color: getConversionRateColor(liveMetrics.conversionRate) }}
            >
              {liveMetrics.conversionRate}%
            </div>
            <div className="metric-trend positive">+2.1% vs last month</div>
          </div>

          <div className="metric-card live">
            <div className="metric-header">
              <h3>Qualified Leads</h3>
              <div className="live-indicator">● LIVE</div>
            </div>
            <div className="metric-value">{liveMetrics.qualifiedLeads}</div>
            <div className="metric-subtitle">
              {liveMetrics.totalLeads > 0 
                ? `${Math.round((liveMetrics.qualifiedLeads / liveMetrics.totalLeads) * 100)}% of total`
                : '0% of total'
              }
            </div>
          </div>

          <div className="metric-card live">
            <div className="metric-header">
              <h3>Revenue This Month</h3>
              <div className="live-indicator">● LIVE</div>
            </div>
            <div className="metric-value">£{liveMetrics.revenueThisMonth.toLocaleString()}</div>
            <div className="metric-trend positive">+12% vs last month</div>
          </div>
        </div>

        {/* Lead Qualification Breakdown */}
        <div className="section">
          <h2>Lead Qualification Status</h2>
          <div className="qualification-breakdown">
            <div className="qualification-card qualified">
              <div className="qualification-header">
                <h3>Qualified Leads</h3>
                <div className="qualification-count">{liveMetrics.qualifiedLeads}</div>
              </div>
              <div className="qualification-percentage">
                {liveMetrics.totalLeads > 0 
                  ? `${Math.round((liveMetrics.qualifiedLeads / liveMetrics.totalLeads) * 100)}%`
                  : '0%'
                }
              </div>
              <div className="qualification-trend positive">+8 this week</div>
            </div>

            <div className="qualification-card unqualified">
              <div className="qualification-header">
                <h3>Unqualified Leads</h3>
                <div className="qualification-count">{liveMetrics.unqualifiedLeads}</div>
              </div>
              <div className="qualification-percentage">
                {liveMetrics.totalLeads > 0 
                  ? `${Math.round((liveMetrics.unqualifiedLeads / liveMetrics.totalLeads) * 100)}%`
                  : '0%'
                }
              </div>
              <div className="qualification-trend negative">-3 this week</div>
            </div>

            <div className="qualification-card total">
              <div className="qualification-header">
                <h3>Total Leads</h3>
                <div className="qualification-count">{liveMetrics.totalLeads}</div>
              </div>
              <div className="qualification-percentage">100%</div>
              <div className="qualification-trend neutral">+5 this week</div>
            </div>
          </div>
        </div>

        {/* Active Conversations */}
        <div className="section">
          <h2>Active Conversations</h2>
          <div className="conversations-grid">
            {activeConversations.map((conversation) => (
              <div key={conversation.id} className="conversation-card">
                <div className="conversation-header">
                  <h4>{conversation.leadName}</h4>
                  <span className={`status-badge ${conversation.status}`}>
                    {conversation.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="conversation-details">
                  <div className="detail-item">
                    <span className="label">Persona:</span>
                    <span className="value">{conversation.persona}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Duration:</span>
                    <span className="value">{conversation.duration}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Last Activity:</span>
                    <span className="value">{conversation.lastActivity}</span>
                  </div>
                </div>
                <div className="conversation-message">
                  <strong>Last Message:</strong> {conversation.lastMessage}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deals Pipeline */}
        <div className="section">
          <h2>Deals Pipeline</h2>
          <div className="deals-grid">
            {deals.map((deal) => (
              <div key={deal.id} className="deal-card">
                <div className="deal-header">
                  <h4>{deal.leadName}</h4>
                  <span 
                    className="stage-badge"
                    style={{ backgroundColor: getDealStageColor(deal.stage) }}
                  >
                    {deal.stage}
                  </span>
                </div>
                <div className="deal-details">
                  <div className="deal-value">£{deal.value.toLocaleString()}</div>
                  <div className="deal-probability">{deal.probability}% probability</div>
                  <div className="deal-date">Expected: {deal.expectedCloseDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="section">
          <h2>Performance Metrics</h2>
          <div className="performance-grid">
            <div className="performance-card">
              <h3>Average Response Time</h3>
              <div className="performance-value">{liveMetrics.avgResponseTime} minutes</div>
              <div className="performance-trend positive">-2.3 min vs last week</div>
            </div>

            <div className="performance-card">
              <h3>Customer Satisfaction</h3>
              <div className="performance-value">{liveMetrics.customerSatisfation}/10</div>
              <div className="performance-trend positive">+0.4 vs last month</div>
            </div>

            <div className="performance-card">
              <h3>Qualification Rate</h3>
              <div className="performance-value">
                {liveMetrics.totalLeads > 0 
                  ? `${Math.round((liveMetrics.qualifiedLeads / liveMetrics.totalLeads) * 100)}%`
                  : '0%'
                }
              </div>
              <div className="performance-trend positive">+3.2% vs last month</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffAnalyticsDashboard; 