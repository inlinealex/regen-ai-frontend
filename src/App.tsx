import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UberLayout from './layouts/UberLayout';
import HomeDashboard from './pages/HomeDashboard';
import PersonaTraining from './pages/PersonaTraining';
import InstructionSetTraining from './pages/InstructionSetTraining';
import SalesTrainingFeedbackLoop from './pages/SalesTrainingFeedbackLoop';
import PhoneNumberManagement from './pages/PhoneNumberManagement';
import TestingChatWindow from './pages/TestingChatWindow';
import DataIngestionDashboard from './pages/DataIngestionDashboard';
import LeadQualificationManagement from './pages/LeadQualificationManagement';
import StaffAnalyticsDashboard from './pages/StaffAnalyticsDashboard';
import CustomerAnalyticsDashboard from './pages/CustomerAnalyticsDashboard';
import AdvancedPersonaTraining from './pages/AdvancedPersonaTraining';
import AISafetyMonitoringDashboard from './pages/AISafetyMonitoringDashboard';
import LeadManagementDashboard from './pages/LeadManagementDashboard';
import CampaignManagementInterface from './pages/CampaignManagementInterface';
import CustomerDataEnrichment from './pages/CustomerDataEnrichment';
import DatabaseConfiguration from './pages/DatabaseConfiguration';
import VectorDatabaseDashboard from './pages/VectorDatabaseDashboard';
import EnhancedPersonaTraining from './pages/EnhancedPersonaTraining';
import LiveDataDashboard from './pages/LiveDataDashboard';
import AdvancedAISafetySystem from './pages/AdvancedAISafetySystem';
import ManualTrainingInterface from './pages/ManualTrainingInterface';
import StaffDashboard from './pages/StaffDashboard';
import ClientManagement from './pages/ClientManagement';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <Router>
      <UberLayout>
        <Routes>
          <Route path="/" element={<HomeDashboard />} />
          <Route path="/persona-training" element={<PersonaTraining />} />
          <Route path="/instruction-sets" element={<InstructionSetTraining />} />
          <Route path="/sales-training" element={<SalesTrainingFeedbackLoop />} />
          <Route path="/phone-numbers" element={<PhoneNumberManagement />} />
          <Route path="/testing-chat" element={<TestingChatWindow />} />
          <Route path="/data-ingestion" element={<DataIngestionDashboard />} />
          <Route path="/lead-qualification" element={<LeadQualificationManagement />} />
          <Route path="/staff-analytics" element={<StaffAnalyticsDashboard />} />
          <Route path="/customer-analytics" element={<CustomerAnalyticsDashboard />} />
          <Route path="/advanced-training" element={<AdvancedPersonaTraining />} />
          <Route path="/ai-safety" element={<AISafetyMonitoringDashboard />} />
          <Route path="/lead-management" element={<LeadManagementDashboard />} />
          <Route path="/campaign-management" element={<CampaignManagementInterface />} />
          <Route path="/customer-enrichment" element={<CustomerDataEnrichment />} />
          <Route path="/database-config" element={<DatabaseConfiguration />} />
          <Route path="/vector-database" element={<VectorDatabaseDashboard />} />
          <Route path="/enhanced-persona-training" element={<EnhancedPersonaTraining />} />
          <Route path="/live-data" element={<LiveDataDashboard />} />
          <Route path="/advanced-ai-safety" element={<AdvancedAISafetySystem />} />
          <Route path="/manual-training" element={<ManualTrainingInterface />} />
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
          <Route path="/client-management" element={<ClientManagement />} />
        </Routes>
      </UberLayout>
    </Router>
  );
};

export default App; 