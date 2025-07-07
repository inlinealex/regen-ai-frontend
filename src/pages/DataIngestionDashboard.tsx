import React, { useState, useRef } from 'react';
import ClientSelector from '../components/ClientSelector';

interface LeadData {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  jobTitle?: string;
  industry?: string;
  companySize?: string;
  linkedin?: string;
  status: 'new' | 'qualified' | 'contacted' | 'converted' | 'lost';
  qualificationScore?: number;
  notes?: string;
  source: string;
  createdAt: string;
}

interface ImportJob {
  id: string;
  name: string;
  type: 'csv' | 'crm' | 'manual';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRecords: number;
  processedRecords: number;
  validRecords: number;
  invalidRecords: number;
  enrichedRecords: number;
  createdAt: string;
  completedAt?: string;
  errors?: string[];
}

interface EnrichmentResult {
  leadId: string;
  originalData: LeadData;
  enrichedData: LeadData;
  enrichmentScore: number;
  newFields: string[];
  confidence: number;
}

interface FieldMapping {
  mappings: Record<string, string>;
  confidence: number;
  suggestions: string[];
}

const DataIngestionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('import');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [enrichmentResults, setEnrichmentResults] = useState<EnrichmentResult[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[][]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({} as FieldMapping);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [autoMappingConfidence, setAutoMappingConfidence] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE = 'http://localhost:3000/api';

  // Field detection patterns
  const fieldPatterns = {
    name: [
      'name', 'full_name', 'fullname', 'first_name', 'last_name', 'contact_name', 'person_name',
      'customer_name', 'client_name', 'lead_name', 'contact', 'person'
    ],
    email: [
      'email', 'e-mail', 'email_address', 'emailaddress', 'mail', 'contact_email',
      'primary_email', 'work_email', 'business_email'
    ],
    company: [
      'company', 'company_name', 'organization', 'org', 'business', 'firm', 'enterprise',
      'corporation', 'corp', 'inc', 'ltd', 'llc', 'workplace', 'employer'
    ],
    phone: [
      'phone', 'telephone', 'phone_number', 'phonenumber', 'mobile', 'cell', 'cellphone',
      'work_phone', 'business_phone', 'contact_phone', 'tel'
    ],
    jobTitle: [
      'title', 'job_title', 'jobtitle', 'position', 'role', 'job', 'occupation',
      'designation', 'job_role', 'work_title', 'professional_title'
    ],
    industry: [
      'industry', 'sector', 'business_type', 'vertical', 'market', 'field',
      'industry_type', 'business_sector', 'market_sector'
    ],
    companySize: [
      'size', 'company_size', 'employees', 'employee_count', 'headcount', 'team_size',
      'staff_count', 'workforce', 'company_employees', 'employee_number'
    ],
    linkedin: [
      'linkedin', 'linkedin_url', 'linkedin_profile', 'linkedin_link', 'social_linkedin',
      'linkedin_page', 'linkedin_account'
    ],
    budget: [
      'budget', 'budget_range', 'spending', 'investment', 'budget_amount',
      'budget_size', 'budget_range', 'investment_amount'
    ],
    authority: [
      'authority', 'decision_maker', 'decision_making', 'role_level', 'seniority',
      'management_level', 'decision_power', 'authority_level'
    ],
    need: [
      'need', 'requirement', 'pain_point', 'challenge', 'problem', 'objective',
      'goal', 'requirement', 'business_need', 'use_case'
    ],
    timeline: [
      'timeline', 'timeframe', 'deadline', 'urgency', 'timeline_requirement',
      'project_timeline', 'implementation_timeline', 'time_constraint'
    ]
  };

  const detectFieldMapping = (headers: string[]): FieldMapping => {
    const mappings: Record<string, string> = {};
    let totalConfidence = 0;
    let matchedFields = 0;
    const suggestions: string[] = [];

    headers.forEach((header, index) => {
      const lowerHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
      let bestMatch = '';
      let bestConfidence = 0;

      // Check each field pattern
      Object.entries(fieldPatterns).forEach(([fieldName, patterns]) => {
        patterns.forEach(pattern => {
          const similarity = calculateSimilarity(lowerHeader, pattern);
          if (similarity > bestConfidence) {
            bestConfidence = similarity;
            bestMatch = fieldName;
          }
          if (similarity > 0.3) {
            suggestions.push(fieldName);
          }
        });
      });

      if (bestConfidence > 0.5) {
        mappings[header] = bestMatch;
        totalConfidence += bestConfidence;
        matchedFields++;
      } else {
        mappings[header] = 'notes'; // Default to notes for unrecognized fields
        suggestions.push('notes');
      }
    });

    const confidence = matchedFields > 0 ? totalConfidence / matchedFields : 0;
    setAutoMappingConfidence(confidence);

    return {
      mappings,
      confidence,
      suggestions: Array.from(new Set(suggestions)) // Remove duplicates
    };
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      previewCsvFile(file);
    }
  };

  const previewCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').slice(0, 6); // Preview first 5 rows
      const csvData = rows.map(row => row.split(',').map(cell => cell.trim()));
      setCsvPreview(csvData);
      
      // Auto-detect field mapping
      if (csvData.length > 0) {
        const headers = csvData[0];
        const detectedMapping = detectFieldMapping(headers);
        setFieldMapping(detectedMapping);
      }
    };
    reader.readAsText(file);
  };

  const startImport = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    const jobId = Date.now().toString();
    const newJob: ImportJob = {
      id: jobId,
      name: selectedFile.name,
      type: 'csv',
      status: 'processing',
      totalRecords: csvPreview.length - 1, // Exclude header
      processedRecords: 0,
      validRecords: 0,
      invalidRecords: 0,
      enrichedRecords: 0,
      createdAt: new Date().toISOString()
    };

    setImportJobs(prev => [newJob, ...prev]);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fieldMapping', JSON.stringify(fieldMapping));

      const response = await fetch(`${API_BASE}/data-ingestion/import-csv`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        // Simulate processing progress
        for (let i = 0; i <= 100; i += 10) {
          setProcessingProgress(i);
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        const updatedJob: ImportJob = {
          ...newJob,
          status: 'completed',
          processedRecords: result.totalRecords,
          validRecords: result.validRecords,
          invalidRecords: result.invalidRecords,
          enrichedRecords: result.enrichedRecords,
          completedAt: new Date().toISOString()
        };

        setImportJobs(prev => prev.map(job => job.id === jobId ? updatedJob : job));
        setLeads(prev => [...prev, ...result.leads]);
      }
    } catch (error) {
      console.error('Import failed:', error);
      const failedJob: ImportJob = {
        ...newJob,
        status: 'failed',
        errors: ['Import failed']
      };
      setImportJobs(prev => prev.map(job => job.id === jobId ? failedJob : job));
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      setSelectedFile(null);
      setCsvPreview([]);
    }
  };

  const enrichLeads = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const response = await fetch(`${API_BASE}/data-ingestion/enrich-leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds: leads.map(lead => lead.id)
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Simulate enrichment progress
        for (let i = 0; i <= 100; i += 20) {
          setProcessingProgress(i);
          await new Promise(resolve => setTimeout(resolve, 300));
        }

        setEnrichmentResults(result.enrichmentResults);
        setLeads(prev => prev.map(lead => {
          const enrichment = result.enrichmentResults.find((r: EnrichmentResult) => r.leadId === lead.id);
          return enrichment ? { ...lead, ...enrichment.enrichedData } : lead;
        }));
      }
    } catch (error) {
      console.error('Enrichment failed:', error);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const validateLeads = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE}/data-ingestion/validate-leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds: leads.map(lead => lead.id)
        })
      });

      const result = await response.json();
      if (result.success) {
        setLeads(prev => prev.map(lead => {
          const validation = result.validations.find((v: any) => v.leadId === lead.id);
          return validation ? { ...lead, ...validation.updates } : lead;
        }));
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getJobTypeIcon = (type: string) => {
    switch (type) {
      case 'csv': return '📄';
      case 'crm': return '🔗';
      case 'manual': return '✏️';
      default: return '📁';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Client Selection */}
        <ClientSelector
          selectedClientId={selectedClientId}
          onClientSelect={setSelectedClientId}
          className="mb-6"
        />
        
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Data Ingestion Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Import, validate, and enrich lead data from multiple sources
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Total Leads: <span className="font-semibold">{leads.length}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Enriched: <span className="font-semibold text-green-600">
                    {enrichmentResults.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'import', name: 'Import Data', icon: '📥' },
                { id: 'leads', name: 'Lead Management', icon: '👥' },
                { id: 'enrichment', name: 'Data Enrichment', icon: '🔍' },
                { id: 'jobs', name: 'Import Jobs', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'import' && (
              <div className="space-y-6">
                {/* Import Sources */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* CSV Import */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">📄</span>
                      <h3 className="text-lg font-semibold text-gray-900">CSV Import</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Upload CSV files with automatic field detection and mapping
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Select CSV File
                    </button>
                  </div>

                  {/* CRM Integration */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">🔗</span>
                      <h3 className="text-lg font-semibold text-gray-900">CRM Integration</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Connect to Pipedrive, HubSpot, or Salesforce
                    </p>
                    <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                      Configure CRM
                    </button>
                  </div>

                  {/* Manual Entry */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">✏️</span>
                      <h3 className="text-lg font-semibold text-gray-900">Manual Entry</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Add leads manually through the interface
                    </p>
                    <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                      Add Lead
                    </button>
                  </div>
                </div>

                {/* CSV Preview and Auto Field Mapping */}
                {selectedFile && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Automatic Field Detection & Mapping
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Confidence:</span>
                        <span className={`text-sm font-medium ${getConfidenceColor(autoMappingConfidence)}`}>
                          {(autoMappingConfidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    {/* CSV Preview */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">File Preview</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200">
                          <thead>
                            <tr>
                              {csvPreview[0]?.map((header, index) => (
                                <th key={index} className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-700 bg-gray-50">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {csvPreview.slice(1, 4).map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                  <td key={cellIndex} className="border border-gray-200 px-3 py-2 text-xs text-gray-900">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Auto Field Mapping */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Detected Field Mapping</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {csvPreview[0]?.map((header, index) => {
                          const mappedField = fieldMapping.mappings?.[header] || 'notes';
                          const confidence = fieldMapping.confidence || 0;
                          return (
                            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                              <div>
                                <div className="font-medium text-gray-900">{header}</div>
                                <div className="text-sm text-gray-600">→ {mappedField}</div>
                              </div>
                              <div className="text-right">
                                <div className={`text-xs font-medium ${getConfidenceColor(confidence)}`}>
                                  {(confidence * 100).toFixed(0)}%
                                </div>
                                <div className="text-xs text-gray-500">confidence</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Import Actions */}
                    <div className="flex space-x-3">
                      <button
                        onClick={startImport}
                        disabled={isProcessing}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {isProcessing ? 'Importing...' : 'Start Import'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setCsvPreview([]);
                          setFieldMapping({ mappings: {}, confidence: 0, suggestions: [] });
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Progress Bar */}
                    {isProcessing && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Processing...</span>
                          <span>{processingProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${processingProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'leads' && (
              <div className="space-y-6">
                {/* Lead Management Actions */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Lead Management</h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={validateLeads}
                      disabled={leads.length === 0 || isProcessing}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                    >
                      Validate All
                    </button>
                    <button
                      onClick={enrichLeads}
                      disabled={leads.length === 0 || isProcessing}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      Enrich All
                    </button>
                  </div>
                </div>

                {/* Leads Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lead
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Company
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Source
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {leads.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                              No leads imported yet. Upload a CSV file to get started.
                            </td>
                          </tr>
                        ) : (
                          leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                                  <div className="text-sm text-gray-500">{lead.email}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{lead.company}</div>
                                <div className="text-sm text-gray-500">{lead.jobTitle}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                                  lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                                  lead.status === 'converted' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {lead.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {lead.qualificationScore || 0}/100
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {lead.source}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900 mr-3">
                                  Edit
                                </button>
                                <button className="text-green-600 hover:text-green-900">
                                  Enrich
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'enrichment' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Data Enrichment Results</h3>
                
                {enrichmentResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrichmentResults.map((result) => (
                      <div key={result.leadId} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">
                            {result.originalData.name}
                          </h4>
                          <span className="text-sm text-gray-500">
                            Score: {result.enrichmentScore}/100
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Company:</span>
                            <span className="text-gray-900">{result.enrichedData.company}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Industry:</span>
                            <span className="text-gray-900">{result.enrichedData.industry}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Size:</span>
                            <span className="text-gray-900">{result.enrichedData.companySize}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Confidence:</span>
                            <span className="text-gray-900">{(result.confidence * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                        
                        {result.newFields.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-600 mb-1">New Fields:</div>
                            <div className="flex flex-wrap gap-1">
                              {result.newFields.map((field, index) => (
                                <span
                                  key={index}
                                  className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                                >
                                  {field}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-gray-500">No enrichment results yet. Run enrichment to see results.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Import Jobs</h3>
                
                <div className="space-y-4">
                  {importJobs.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">⚙️</div>
                      <p className="text-gray-500">No import jobs yet. Upload a CSV file to see job history.</p>
                    </div>
                  ) : (
                    importJobs.map((job) => (
                      <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getJobTypeIcon(job.type)}</span>
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">{job.name}</h4>
                              <p className="text-sm text-gray-500">
                                {new Date(job.createdAt).toLocaleDateString()} at{' '}
                                {new Date(job.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Total Records:</span>
                            <div className="font-medium">{job.totalRecords}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Valid Records:</span>
                            <div className="font-medium text-green-600">{job.validRecords}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Invalid Records:</span>
                            <div className="font-medium text-red-600">{job.invalidRecords}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Enriched Records:</span>
                            <div className="font-medium text-blue-600">{job.enrichedRecords}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Success Rate:</span>
                            <div className="font-medium">
                              {job.totalRecords > 0 ? ((job.validRecords / job.totalRecords) * 100).toFixed(1) : 0}%
                            </div>
                          </div>
                        </div>
                        
                        {job.errors && job.errors.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="text-sm font-medium text-gray-700 mb-2">Errors:</div>
                            <div className="space-y-1">
                              {job.errors.map((error, index) => (
                                <div key={index} className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                                  {error}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataIngestionDashboard; 