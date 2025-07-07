import React, { useState, useEffect } from 'react';

interface VectorHealth {
  status: string;
  database: string;
  totalEmbeddings: number;
  namespaces: string[];
}

interface Embedding {
  id: string;
  metadata: any;
  timestamp: string;
}

interface SimilarityResult {
  id: string;
  similarity: number;
  metadata: any;
}

const VectorDatabaseDashboard: React.FC = () => {
  const [health, setHealth] = useState<VectorHealth | null>(null);
  const [embeddings, setEmbeddings] = useState<Embedding[]>([]);
  const [similarityResults, setSimilarityResults] = useState<SimilarityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'personas' | 'training' | 'interactions'>('personas');

  const API_BASE = 'http://localhost:3000/api';

  useEffect(() => {
    loadHealth();
    loadEmbeddings();
  }, []);

  const loadHealth = async () => {
    try {
      const response = await fetch(`${API_BASE}/vector/health`);
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Error loading vector health:', error);
    }
  };

  const loadEmbeddings = async () => {
    try {
      const response = await fetch(`${API_BASE}/vector/embeddings`);
      const data = await response.json();
      if (data.success) {
        setEmbeddings(data.embeddings);
      }
    } catch (error) {
      console.error('Error loading embeddings:', error);
    }
  };

  const searchSimilar = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      let endpoint = '';
      switch (searchType) {
        case 'personas':
          endpoint = '/vector/similar-personas';
          break;
        case 'training':
          endpoint = '/vector/similar-training-examples';
          break;
        case 'interactions':
          endpoint = '/vector/similar-interactions';
          break;
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit: 5 }),
      });

      const data = await response.json();
      if (data.success) {
        setSimilarityResults(data.results);
      }
    } catch (error) {
      console.error('Error searching similar:', error);
    } finally {
      setLoading(false);
    }
  };

  const storeTestEmbedding = async (type: string) => {
    try {
      const testData = {
        personaId: `test-${Date.now()}`,
        personaData: {
          name: `Test ${type}`,
          description: `Test ${type} description`,
          instructions: `Test ${type} instructions`
        }
      };

      const response = await fetch(`${API_BASE}/vector/store-persona`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const data = await response.json();
      if (data.success) {
        loadEmbeddings(); // Refresh the list
        alert('Test embedding stored successfully!');
      }
    } catch (error) {
      console.error('Error storing test embedding:', error);
      alert('Error storing test embedding');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Vector Database Dashboard
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Monitor and test vector database operations for AI efficiency
          </p>
        </div>

        {/* Health Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Health Status</h2>
          {health ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-green-800">Status</div>
                <div className="text-2xl font-bold text-green-600">{health.status}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-blue-800">Database</div>
                <div className="text-2xl font-bold text-blue-600">{health.database}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-purple-800">Total Embeddings</div>
                <div className="text-2xl font-bold text-purple-600">{health.totalEmbeddings}</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-orange-800">Namespaces</div>
                <div className="text-2xl font-bold text-orange-600">{health.namespaces.length}</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Loading health status...</div>
          )}
        </div>

        {/* Similarity Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Similarity Search</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="personas">Personas</option>
              <option value="training">Training Examples</option>
              <option value="interactions">Interactions</option>
            </select>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter search query..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={searchSimilar}
              disabled={loading || !query.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {similarityResults.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Results</h3>
              <div className="space-y-2">
                {similarityResults.map((result, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{result.id}</div>
                        <div className="text-sm text-gray-600">
                          {JSON.stringify(result.metadata, null, 2)}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-blue-600">
                        {(result.similarity * 100).toFixed(2)}% similar
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Embeddings List */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Stored Embeddings</h2>
            <button
              onClick={() => storeTestEmbedding('Persona')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add Test Embedding
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {embeddings.map((embedding, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium text-gray-900 mb-2">{embedding.id}</div>
                <div className="text-sm text-gray-600 mb-2">
                  Type: {embedding.metadata?.type || 'Unknown'}
                </div>
                {embedding.metadata?.name && (
                  <div className="text-sm text-gray-600 mb-2">
                    Name: {embedding.metadata.name}
                  </div>
                )}
                {embedding.metadata?.description && (
                  <div className="text-sm text-gray-600 mb-2">
                    Description: {embedding.metadata.description}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {new Date(embedding.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => storeTestEmbedding('Training Example')}
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="font-medium text-blue-900">Add Training Example</div>
              <div className="text-sm text-blue-600">Store a test training example embedding</div>
            </button>
            <button
              onClick={() => storeTestEmbedding('Interaction')}
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="font-medium text-purple-900">Add Interaction</div>
              <div className="text-sm text-purple-600">Store a test interaction embedding</div>
            </button>
            <button
              onClick={loadEmbeddings}
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="font-medium text-green-900">Refresh Data</div>
              <div className="text-sm text-green-600">Reload all embeddings</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VectorDatabaseDashboard; 