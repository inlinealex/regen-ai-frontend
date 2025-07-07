// API service for connecting to backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const api = {
  // Health check
  health: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },

  // AI endpoints
  qualifyLead: async (leadData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/ai/qualify-lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });
    return response.json();
  },

  generateOutreach: async (leadData: any, persona = 'sales_executive') => {
    const response = await fetch(`${API_BASE_URL}/api/ai/generate-outreach`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...leadData, persona }),
    });
    return response.json();
  },

  // Vector database endpoints
  vectorSearch: async (query: string) => {
    const response = await fetch(`${API_BASE_URL}/api/vector/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    return response.json();
  },

  addToVectorDB: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/vector/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Database endpoints
  getLeads: async () => {
    const response = await fetch(`${API_BASE_URL}/api/leads`);
    return response.json();
  },

  getCampaigns: async () => {
    const response = await fetch(`${API_BASE_URL}/api/campaigns`);
    return response.json();
  },

  // Analytics endpoints
  getAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/api/analytics`);
    return response.json();
  },
};

export default api; 