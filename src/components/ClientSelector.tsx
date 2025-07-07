import React, { useState, useEffect } from 'react';

interface Client {
  id: string;
  name: string;
  company: string;
  industry: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastActivity: string;
  totalLeads: number;
  enrichedLeads: number;
}

interface ClientSelectorProps {
  selectedClientId: string | null;
  onClientSelect: (clientId: string) => void;
  showCreateNew?: boolean;
  className?: string;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({
  selectedClientId,
  onClientSelect,
  showCreateNew = true,
  className = ''
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    company: '',
    industry: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockClients: Client[] = [
        {
          id: '1',
          name: 'John Smith',
          company: 'TechCorp Solutions',
          industry: 'Technology',
          status: 'active',
          createdAt: '2024-01-15',
          lastActivity: '2024-07-07',
          totalLeads: 1250,
          enrichedLeads: 890
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          company: 'Global Marketing Inc',
          industry: 'Marketing',
          status: 'active',
          createdAt: '2024-02-20',
          lastActivity: '2024-07-06',
          totalLeads: 890,
          enrichedLeads: 567
        },
        {
          id: '3',
          name: 'Mike Wilson',
          company: 'Finance Partners',
          industry: 'Financial Services',
          status: 'active',
          createdAt: '2024-03-10',
          lastActivity: '2024-07-05',
          totalLeads: 567,
          enrichedLeads: 423
        },
        {
          id: '4',
          name: 'Lisa Chen',
          company: 'Healthcare Solutions',
          industry: 'Healthcare',
          status: 'inactive',
          createdAt: '2024-01-05',
          lastActivity: '2024-06-20',
          totalLeads: 234,
          enrichedLeads: 156
        }
      ];
      setClients(mockClients);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewClient = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
      
      if (response.ok) {
        const createdClient = await response.json();
        setClients(prev => [...prev, createdClient]);
        setShowCreateModal(false);
        setNewClient({ name: '', company: '', industry: '' });
      }
    } catch (error) {
      console.error('Failed to create client:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedClient = clients.find(client => client.id === selectedClientId);

  return (
    <div className={`${className}`}>
      {/* Client Selection Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Client Selection</h3>
            <p className="text-sm text-gray-600">Select the client for data ingestion and enrichment</p>
          </div>
          {showCreateNew && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + New Client
            </button>
          )}
        </div>

        {/* Selected Client Display */}
        {selectedClient && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">{selectedClient.name}</h4>
                <p className="text-sm text-blue-700">{selectedClient.company}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedClient.status)}`}>
                    {selectedClient.status}
                  </span>
                  <span className="text-xs text-blue-600">
                    {selectedClient.totalLeads} leads • {selectedClient.enrichedLeads} enriched
                  </span>
                </div>
              </div>
              <button
                onClick={() => onClientSelect('')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Change Client
              </button>
            </div>
          </div>
        )}

        {/* Client Selection Dropdown */}
        {!selectedClient && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Client
            </label>
            <select
              value={selectedClientId || ''}
              onChange={(e) => onClientSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.company}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Create New Client Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Client</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Smith"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={newClient.company}
                  onChange={(e) => setNewClient(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="TechCorp Solutions"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <select
                  value={newClient.industry}
                  onChange={(e) => setNewClient(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select industry...</option>
                  <option value="Technology">Technology</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNewClient}
                disabled={!newClient.name || !newClient.company}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSelector; 