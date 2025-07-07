import React, { useState, useEffect } from 'react';
import './AnalyticsDashboard.css';

interface CustomerAnalyticsData {
  customer: {
    id: string;
    name: string;
    company: string;
    plan: string;
    startDate: string;
  };
  overview: {
    totalConversations: number;
    totalLeads: number;
    conversionRate: number;
    averageResponseTime: number;
    successRate: number;
    costSavings: number;
    roi: number;
  };
  conversations: Array<{
    id: string;
    leadName: string;
    leadCompany: string;
    status: 'qualified' | 'unqualified' | 'converted' | 'lost';
    personaUsed: string;
    responseTime: number;
    outcome: string;
    date: string;
  }>;
  personas: Array<{
    id: string;
    name: string;
    usageCount: number;
    successRate: number;
    averageResponseTime: number;
  }>;
  trends: Array<{
    date: string;
    conversations: number;
    conversions: number;
    responseTime: number;
  }>;
  recommendations: Array<{
    type: 'optimization' | 'improvement' | 'alert';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

interface CustomerLiveMetrics {
  activeConversations: number;
  meetingsScheduled: number;
  qualificationStatus: 'qualified' | 'unqualified' | 'pending';
  responseTime: number;
  satisfactionScore: number;
  totalInteractions: number;
  lastActivity: string;
  nextMeeting: string | null;
}

interface CustomerConversation {
  id: string;
  persona: string;
  status: 'active' | 'waiting' | 'completed';
  lastMessage: string;
  lastActivity: string;
  duration: string;
  messagesCount: number;
}

interface CustomerMeeting {
  id: string;
  date: string;
  time: string;
  type: 'discovery' | 'demo' | 'proposal' | 'follow-up';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
}

const CustomerAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<CustomerAnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);
  const [liveMetrics, setLiveMetrics] = useState<CustomerLiveMetrics>({
    activeConversations: 0,
    meetingsScheduled: 0,
    qualificationStatus: 'pending',
    responseTime: 0,
    satisfactionScore: 0,
    totalInteractions: 0,
    lastActivity: '',
    nextMeeting: null
  });
  const [conversations, setConversations] = useState<CustomerConversation[]>([]);
  const [meetings, setMeetings] = useState<CustomerMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = 'http://localhost:3000/api';

  useEffect(() => {
    loadCustomerAnalytics();
    fetchCustomerLiveData();
    fetchCustomerConversations();
    fetchCustomerMeetings();
  }, [timeRange]);

  const loadCustomerAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/analytics/customer?timeRange=${timeRange}`);
      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error('Failed to load customer analytics:', error);
      // Load mock data for development
      setAnalyticsData(getMockCustomerAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const getMockCustomerAnalytics = (): CustomerAnalyticsData => ({
    customer: {
      id: 'cust-1',
      name: 'TechCorp Inc',
      company: 'Technology',
      plan: 'Professional',
      startDate: '2024-01-01'
    },
    overview: {
      totalConversations: 156,
      totalLeads: 89,
      conversionRate: 28.2,
      averageResponseTime: 1.8,
      successRate: 82.1,
      costSavings: 12450,
      roi: 340
    },
    conversations: [
      {
        id: 'conv-1',
        leadName: 'John Smith',
        leadCompany: 'DataFlow Solutions',
        status: 'converted',
        personaUsed: 'Sales Executive',
        responseTime: 1.2,
        outcome: 'Qualified and converted',
        date: '2024-01-15T10:30:00Z'
      },
      {
        id: 'conv-2',
        leadName: 'Sarah Johnson',
        leadCompany: 'CloudTech Ltd',
        status: 'qualified',
        personaUsed: 'Technical Specialist',
        responseTime: 2.1,
        outcome: 'Qualified for technical demo',
        date: '2024-01-14T15:45:00Z'
      },
      {
        id: 'conv-3',
        leadName: 'Mike Davis',
        leadCompany: 'StartupXYZ',
        status: 'unqualified',
        personaUsed: 'Sales Executive',
        responseTime: 1.8,
        outcome: 'Not a good fit',
        date: '2024-01-13T09:15:00Z'
      }
    ],
    personas: [
      {
        id: 'sales-executive',
        name: 'Sales Executive',
        usageCount: 89,
        successRate: 78.2,
        averageResponseTime: 2.1
      },
      {
        id: 'technical-specialist',
        name: 'Technical Specialist',
        usageCount: 45,
        successRate: 85.7,
        averageResponseTime: 2.8
      },
      {
        id: 'objection-handler',
        name: 'Objection Handler',
        usageCount: 22,
        successRate: 82.1,
        averageResponseTime: 1.9
      }
    ],
    trends: [
      { date: '2024-01-09', conversations: 8, conversions: 3, responseTime: 2.1 },
      { date: '2024-01-10', conversations: 12, conversions: 4, responseTime: 1.9 },
      { date: '2024-01-11', conversations: 10, conversions: 3, responseTime: 2.3 },
      { date: '2024-01-12', conversations: 15, conversions: 5, responseTime: 2.0 },
      { date: '2024-01-13', conversations: 11, conversions: 4, responseTime: 2.2 },
      { date: '2024-01-14', conversations: 14, conversions: 6, responseTime: 1.8 },
      { date: '2024-01-15', conversations: 9, conversions: 3, responseTime: 2.1 }
    ],
    recommendations: [
      {
        type: 'optimization',
        title: 'Optimize Technical Specialist Usage',
        description: 'Your technical specialist persona has 85.7% success rate. Consider using it more for technical leads.',
        impact: 'high'
      },
      {
        type: 'improvement',
        title: 'Improve Response Time',
        description: 'Average response time is 1.8s. Target is 1.5s for better engagement.',
        impact: 'medium'
      },
      {
        type: 'alert',
        title: 'High Unqualified Rate',
        description: '23% of leads are being marked as unqualified. Review qualification criteria.',
        impact: 'high'
      }
    ]
  });

  const fetchCustomerLiveData = async () => {
    try {
      const response = await fetch('/api/analytics/customer/live-metrics');
      const data = await response.json();
      setLiveMetrics(data);
    } catch (error) {
      console.error('Error fetching customer live metrics:', error);
    }
  };

  const fetchCustomerConversations = async () => {
    try {
      const response = await fetch('/api/analytics/customer/conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching customer conversations:', error);
    }
  };

  const fetchCustomerMeetings = async () => {
    try {
      const response = await fetch('/api/analytics/customer/meetings');
      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error('Error fetching customer meetings:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'converted': return 'text-green-600 bg-green-100';
      case 'qualified': return 'text-blue-600 bg-blue-100';
      case 'unqualified': return 'text-red-600 bg-red-100';
      case 'lost': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'optimization': return 'text-blue-600 bg-blue-100';
      case 'improvement': return 'text-yellow-600 bg-yellow-100';
      case 'alert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
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

  const getQualificationColor = (status: string) => {
    const colors = {
      qualified: '#10B981',
      unqualified: '#EF4444',
      pending: '#F59E0B'
    };
    return colors[status as keyof typeof colors] || '#F59E0B';
  };

  const getMeetingTypeColor = (type: string) => {
    const colors = {
      discovery: '#3B82F6',
      demo: '#8B5CF6',
      proposal: '#F59E0B',
      'follow-up': '#10B981'
    };
    return colors[type as keyof typeof colors] || '#6B7280';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h1>Your Analytics Dashboard</h1>
        <div className="last-updated">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card live">
          <div className="metric-header">
            <h3>Active Conversations</h3>
            <div className="live-indicator">● LIVE</div>
          </div>
          <div className="metric-value">{liveMetrics.activeConversations}</div>
          <div className="metric-subtitle">Currently engaging with our team</div>
        </div>

        <div className="metric-card live">
          <div className="metric-header">
            <h3>Meetings Scheduled</h3>
            <div className="live-indicator">● LIVE</div>
          </div>
          <div className="metric-value">{liveMetrics.meetingsScheduled}</div>
          <div className="metric-subtitle">Upcoming discussions</div>
        </div>

        <div className="metric-card live">
          <div className="metric-header">
            <h3>Qualification Status</h3>
            <div className="live-indicator">● LIVE</div>
          </div>
          <div 
            className="metric-value"
            style={{ color: getQualificationColor(liveMetrics.qualificationStatus) }}
          >
            {liveMetrics.qualificationStatus.charAt(0).toUpperCase() + liveMetrics.qualificationStatus.slice(1)}
          </div>
          <div className="metric-subtitle">Lead qualification status</div>
        </div>

        <div className="metric-card live">
          <div className="metric-header">
            <h3>Response Time</h3>
            <div className="live-indicator">● LIVE</div>
          </div>
          <div className="metric-value">{liveMetrics.responseTime} minutes</div>
          <div className="metric-subtitle">Average response time</div>
        </div>

        <div className="metric-card live">
          <div className="metric-header">
            <h3>Satisfaction Score</h3>
            <div className="live-indicator">● LIVE</div>
          </div>
          <div className="metric-value">{liveMetrics.satisfactionScore}/10</div>
          <div className="metric-subtitle">Your satisfaction rating</div>
        </div>

        <div className="metric-card live">
          <div className="metric-header">
            <h3>Total Interactions</h3>
            <div className="live-indicator">● LIVE</div>
          </div>
          <div className="metric-value">{liveMetrics.totalInteractions}</div>
          <div className="metric-subtitle">All-time interactions</div>
        </div>
      </div>

      {/* Current Status */}
      <div className="section">
        <h2>Your Current Status</h2>
        <div className="status-grid">
          <div className="status-card">
            <h3>Last Activity</h3>
            <div className="status-value">{liveMetrics.lastActivity}</div>
            <div className="status-subtitle">Most recent interaction</div>
          </div>

          <div className="status-card">
            <h3>Next Meeting</h3>
            <div className="status-value">
              {liveMetrics.nextMeeting || 'No meetings scheduled'}
            </div>
            <div className="status-subtitle">Upcoming appointment</div>
          </div>

          <div className="status-card">
            <h3>Engagement Level</h3>
            <div className="status-value">
              {liveMetrics.activeConversations > 0 ? 'High' : 'Standard'}
            </div>
            <div className="status-subtitle">Based on activity</div>
          </div>
        </div>
      </div>

      {/* Your Conversations */}
      <div className="section">
        <h2>Your Conversations</h2>
        <div className="conversations-grid">
          {conversations.map((conversation) => (
            <div key={conversation.id} className="conversation-card">
              <div className="conversation-header">
                <h4>Conversation with {conversation.persona}</h4>
                <span className={`status-badge ${conversation.status}`}>
                  {conversation.status}
                </span>
              </div>
              <div className="conversation-details">
                <div className="detail-item">
                  <span className="label">Duration:</span>
                  <span className="value">{conversation.duration}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Messages:</span>
                  <span className="value">{conversation.messagesCount}</span>
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

      {/* Your Meetings */}
      <div className="section">
        <h2>Your Meetings</h2>
        <div className="meetings-grid">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="meeting-card">
              <div className="meeting-header">
                <h4>{meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)} Meeting</h4>
                <span 
                  className="meeting-type-badge"
                  style={{ backgroundColor: getMeetingTypeColor(meeting.type) }}
                >
                  {meeting.type}
                </span>
              </div>
              <div className="meeting-details">
                <div className="meeting-date">{meeting.date} at {meeting.time}</div>
                <div className={`meeting-status ${meeting.status}`}>
                  {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                </div>
                {meeting.notes && (
                  <div className="meeting-notes">
                    <strong>Notes:</strong> {meeting.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="section">
        <h2>Your Performance Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <h3>Response Quality</h3>
            <div className="insight-value">
              {liveMetrics.satisfactionScore >= 8 ? 'Excellent' : 
               liveMetrics.satisfactionScore >= 6 ? 'Good' : 'Needs Improvement'}
            </div>
            <div className="insight-description">
              Based on your satisfaction score of {liveMetrics.satisfactionScore}/10
            </div>
          </div>

          <div className="insight-card">
            <h3>Engagement Level</h3>
            <div className="insight-value">
              {liveMetrics.totalInteractions > 20 ? 'Very High' :
               liveMetrics.totalInteractions > 10 ? 'High' :
               liveMetrics.totalInteractions > 5 ? 'Moderate' : 'Getting Started'}
            </div>
            <div className="insight-description">
              {liveMetrics.totalInteractions} total interactions
            </div>
          </div>

          <div className="insight-card">
            <h3>Next Steps</h3>
            <div className="insight-value">
              {liveMetrics.meetingsScheduled > 0 ? 'Meeting Scheduled' :
               liveMetrics.activeConversations > 0 ? 'Continue Conversation' :
               'Start New Conversation'}
            </div>
            <div className="insight-description">
              Recommended next action
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-button primary">
            Start New Conversation
          </button>
          <button className="action-button secondary">
            Schedule Meeting
          </button>
          <button className="action-button secondary">
            View Full History
          </button>
          <button className="action-button secondary">
            Update Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalyticsDashboard; 