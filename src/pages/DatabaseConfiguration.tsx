import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'vector' | 'redis' | 'mongodb';
  host: string;
  port: number;
  database: string;
  username: string;
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  lastConnected: Date;
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
  performance: {
    queriesPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
  };
  dataUsage: {
    size: string;
    tables: number;
    indexes: number;
  };
}

interface DatabaseConfig {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  primaryDatabase: string;
  vectorDatabase: string;
  backupDatabase?: string;
  replicationConfig: {
    enabled: boolean;
    primary: string;
    replicas: string[];
  };
  shardingConfig: {
    enabled: boolean;
    shards: number;
    distributionStrategy: string;
  };
}

const DatabaseConfiguration: React.FC = () => {
  const [databaseConnections, setDatabaseConnections] = useState<DatabaseConnection[]>([
    {
      id: '1',
      name: 'Primary PostgreSQL',
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      database: 'regen_primary',
      username: 'regen_user',
      status: 'connected',
      lastConnected: new Date(),
      connectionPool: {
        active: 12,
        idle: 8,
        total: 20
      },
      performance: {
        queriesPerSecond: 245.3,
        averageResponseTime: 12.5,
        errorRate: 0.02
      },
      dataUsage: {
        size: '2.4 GB',
        tables: 45,
        indexes: 128
      }
    },
    {
      id: '2',
      name: 'Vector Database',
      type: 'vector',
      host: 'localhost',
      port: 6330,
      database: 'regen_vectors',
      username: 'vector_user',
      status: 'connected',
      lastConnected: new Date(),
      connectionPool: {
        active: 8,
        idle: 4,
        total: 12
      },
      performance: {
        queriesPerSecond: 156.7,
        averageResponseTime: 8.2,
        errorRate: 0.01
      },
      dataUsage: {
        size: '1.8 GB',
        tables: 12,
        indexes: 89
      }
    },
    {
      id: '3',
      name: 'Analytics PostgreSQL',
      type: 'postgresql',
      host: 'analytics-db.regen.ai',
      port: 5432,
      database: 'regen_analytics',
      username: 'analytics_user',
      status: 'connected',
      lastConnected: new Date(),
      connectionPool: {
        active: 6,
        idle: 3,
        total: 10
      },
      performance: {
        queriesPerSecond: 89.2,
        averageResponseTime: 18.7,
        errorRate: 0.05
      },
      dataUsage: {
        size: '5.2 GB',
        tables: 67,
        indexes: 234
      }
    }
  ]);

  const [databaseConfigs, setDatabaseConfigs] = useState<DatabaseConfig[]>([
    {
      id: '1',
      name: 'Production Configuration',
      description: 'Primary production database setup with vector search',
      isActive: true,
      primaryDatabase: '1',
      vectorDatabase: '2',
      replicationConfig: {
        enabled: true,
        primary: '1',
        replicas: ['3']
      },
      shardingConfig: {
        enabled: false,
        shards: 1,
        distributionStrategy: 'none'
      }
    },
    {
      id: '2',
      name: 'Development Configuration',
      description: 'Development environment with local databases',
      isActive: false,
      primaryDatabase: '1',
      vectorDatabase: '2',
      replicationConfig: {
        enabled: false,
        primary: '1',
        replicas: []
      },
      shardingConfig: {
        enabled: false,
        shards: 1,
        distributionStrategy: 'none'
      }
    }
  ]);

  const [systemMetrics, setSystemMetrics] = useState({
    totalConnections: 42,
    activeConnections: 26,
    averageResponseTime: 13.1,
    totalQueriesPerSecond: 491.2,
    overallErrorRate: 0.026,
    dataSize: '9.4 GB',
    lastUpdated: new Date()
  });

  const [selectedConnection, setSelectedConnection] = useState<DatabaseConnection | null>(null);
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [newConnection, setNewConnection] = useState<Partial<DatabaseConnection>>({
    name: '',
    type: 'postgresql',
    host: '',
    port: 5432,
    database: '',
    username: ''
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        totalConnections: prev.totalConnections + Math.floor(Math.random() * 3) - 1,
        activeConnections: prev.activeConnections + Math.floor(Math.random() * 2) - 1,
        averageResponseTime: prev.averageResponseTime + (Math.random() - 0.5) * 2,
        totalQueriesPerSecond: prev.totalQueriesPerSecond + (Math.random() - 0.5) * 10,
        lastUpdated: new Date()
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const addDatabaseConnection = () => {
    if (newConnection.name && newConnection.host && newConnection.database) {
      const connection: DatabaseConnection = {
        id: Date.now().toString(),
        name: newConnection.name,
        type: newConnection.type || 'postgresql',
        host: newConnection.host,
        port: newConnection.port || 5432,
        database: newConnection.database,
        username: newConnection.username || '',
        status: 'connecting',
        lastConnected: new Date(),
        connectionPool: {
          active: 0,
          idle: 0,
          total: 0
        },
        performance: {
          queriesPerSecond: 0,
          averageResponseTime: 0,
          errorRate: 0
        },
        dataUsage: {
          size: '0 MB',
          tables: 0,
          indexes: 0
        }
      };
      setDatabaseConnections(prev => [...prev, connection]);
      setNewConnection({
        name: '',
        type: 'postgresql',
        host: '',
        port: 5432,
        database: '',
        username: ''
      });
      setShowAddConnection(false);
    }
  };

  const testConnection = (connectionId: string) => {
    setDatabaseConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: 'connecting' as const }
          : conn
      )
    );

    // Simulate connection test
    setTimeout(() => {
      setDatabaseConnections(prev => 
        prev.map(conn => 
          conn.id === connectionId 
            ? { ...conn, status: 'connected' as const, lastConnected: new Date() }
            : conn
        )
      );
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'connecting': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'postgresql': return '🐘';
      case 'vector': return '🔍';
      case 'redis': return '📦';
      case 'mongodb': return '🍃';
      default: return '🗄️';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Database Configuration
          </h1>
          <p className="text-gray-600">
            Manage multiple database connections including PostgreSQL and vector databases
          </p>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Total Connections</p>
            <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalConnections}</p>
            <p className="text-sm text-gray-500">{systemMetrics.activeConnections} active</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
            <p className="text-2xl font-bold text-blue-600">{systemMetrics.averageResponseTime.toFixed(1)}ms</p>
            <p className="text-sm text-gray-500">across all DBs</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Queries/Second</p>
            <p className="text-2xl font-bold text-green-600">{systemMetrics.totalQueriesPerSecond.toFixed(1)}</p>
            <p className="text-sm text-gray-500">total throughput</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Error Rate</p>
            <p className="text-2xl font-bold text-red-600">{(systemMetrics.overallErrorRate * 100).toFixed(2)}%</p>
            <p className="text-sm text-gray-500">overall</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Database Connections */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Database Connections</h2>
                <Button 
                  onClick={() => setShowAddConnection(true)}
                  variant="primary"
                >
                  Add Connection
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {databaseConnections.map(connection => (
                  <div key={connection.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getTypeIcon(connection.type)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{connection.name}</h3>
                          <p className="text-sm text-gray-500">{connection.host}:{connection.port}/{connection.database}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                          {connection.status}
                        </span>
                        <Button
                          onClick={() => testConnection(connection.id)}
                          variant="outline"
                          size="sm"
                        >
                          Test
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Pool:</span>
                        <span className="ml-2 font-medium">{connection.connectionPool.active}/{connection.connectionPool.total}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">QPS:</span>
                        <span className="ml-2 font-medium">{connection.performance.queriesPerSecond.toFixed(1)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Response:</span>
                        <span className="ml-2 font-medium">{connection.performance.averageResponseTime.toFixed(1)}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Size:</span>
                        <span className="ml-2 font-medium">{connection.dataUsage.size}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Last connected: {connection.lastConnected.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Database Configurations */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Database Configurations</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {databaseConfigs.map(config => (
                  <div key={config.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{config.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        config.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {config.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Primary DB:</span>
                        <span className="ml-2 font-medium">
                          {databaseConnections.find(db => db.id === config.primaryDatabase)?.name || 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Vector DB:</span>
                        <span className="ml-2 font-medium">
                          {databaseConnections.find(db => db.id === config.vectorDatabase)?.name || 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Replication:</span>
                        <span className="ml-2 font-medium">{config.replicationConfig.enabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Sharding:</span>
                        <span className="ml-2 font-medium">{config.shardingConfig.enabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                    {config.replicationConfig.enabled && (
                      <div className="text-xs text-gray-500">
                        Replicas: {config.replicationConfig.replicas.length} configured
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Database Performance Chart */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Database Performance Overview</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {databaseConnections.map(connection => (
                <div key={connection.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{connection.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                      {connection.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Queries/sec:</span>
                      <span className="font-medium">{connection.performance.queriesPerSecond.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg response:</span>
                      <span className="font-medium">{connection.performance.averageResponseTime.toFixed(1)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Error rate:</span>
                      <span className="font-medium">{(connection.performance.errorRate * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data size:</span>
                      <span className="font-medium">{connection.dataUsage.size}</span>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(connection.connectionPool.active / connection.connectionPool.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Connection pool: {connection.connectionPool.active}/{connection.connectionPool.total}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Connection Modal */}
        {showAddConnection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add Database Connection</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Connection Name</label>
                  <input
                    type="text"
                    value={newConnection.name}
                    onChange={(e) => setNewConnection(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Database Type</label>
                  <select
                    value={newConnection.type}
                    onChange={(e) => setNewConnection(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="postgresql">PostgreSQL</option>
                    <option value="vector">Vector Database</option>
                    <option value="redis">Redis</option>
                    <option value="mongodb">MongoDB</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                    <input
                      type="text"
                      value={newConnection.host}
                      onChange={(e) => setNewConnection(prev => ({ ...prev, host: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                    <input
                      type="number"
                      value={newConnection.port}
                      onChange={(e) => setNewConnection(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Database</label>
                    <input
                      type="text"
                      value={newConnection.database}
                      onChange={(e) => setNewConnection(prev => ({ ...prev, database: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={newConnection.username}
                      onChange={(e) => setNewConnection(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  onClick={() => setShowAddConnection(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addDatabaseConnection}
                  variant="primary"
                >
                  Add Connection
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseConfiguration; 