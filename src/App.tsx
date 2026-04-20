import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ChildrenModule from "./pages/modules/ChildrenModule";
import RecordsModule from "./pages/modules/RecordsModule";
import ScreeningModule from "./pages/modules/ScreeningModule";
import ADHDModule from "./pages/modules/ADHDModule";
import AutismModule from "./pages/modules/AutismModule";
import OrientationModule from "./pages/modules/OrientationModule";
import AppointmentsModule from "./pages/modules/AppointmentsModule";
import TeleconsultationModule from "./pages/modules/TeleconsultationModule";
import GuidanceModule from "./pages/modules/GuidanceModule";
import EducationModule from "./pages/modules/EducationModule";
import CommunityModule from "./pages/modules/CommunityModule";
import TrainingModule from "./pages/modules/TrainingModule";
import ReportingModule from "./pages/modules/ReportingModule";
import QuestionnairesModule from "./pages/modules/QuestionnairesModule";
import ResultsModule from "./pages/modules/ResultsModule";
import ResourcesModule from "./pages/modules/ResourcesModule";
import ObservationsModule from "./pages/modules/ObservationsModule";
import CarePlansModule from "./pages/modules/CarePlansModule";
import DocumentsModule from "./pages/modules/DocumentsModule";
import FamiliesModule from "./pages/modules/FamiliesModule";
import ActivitiesModule from "./pages/modules/ActivitiesModule";
import UsersModule from "./pages/modules/UsersModule"; 
import SettingsModule from "./pages/modules/SettingsModule";
import IndicatorsModule from "./pages/modules/IndicatorsModule";
import MappingModule from "./pages/modules/MappingModule";
import StructuresModule from "./pages/modules/StructuresModule";
import ExportModule from "./pages/modules/ExportModule";
import TrendsModule from "./pages/modules/TrendsModule";

// Notre nouveau module de supervision en temps réel
import AgentSupervisionModule from "./pages/modules/AgentSupervisionModule";

import CountriesModule from "./pages/modules/CountriesModule";
import OrganizationsModule from "./pages/modules/OrganizationsModule";
import RolesModule from "./pages/modules/RolesModule";
import ModulesManagement from "./pages/modules/ModulesManagement";
import LanguagesModule from "./pages/modules/LanguagesModule";
import LogsModule from "./pages/modules/LogsModule";
import SupportModule from "./pages/modules/SupportModule";
import NasqScreeningModule from "./pages/modules/NasqScreeningModule";
import AgentLoginPage from "./pages/AgentLoginPage";

// NOUVEAU : Import du portail parent
import ParentDashboard from "./pages/dashboards/ParentDashboard";

import NotFound from "./pages/NotFound";

// Notre nouveau Garde du Corps
import ProtectedDashboard from "./components/ProtectedDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* === ROUTES PUBLIQUES & CONNEXION === */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/login-agent" element={<AgentLoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* === ROUTE AGENT TERRAIN (Ouverte aux agents) === */}
              <Route path="/recensement" element={<NasqScreeningModule />} />
              
              {/* === ROUTES DASHBOARD (VERROUILLÉES) === */}
              {/* Si un agent tente d'accéder à ces routes, ProtectedDashboard le bloquera */}
              <Route element={<ProtectedDashboard />}>
                
                {/* NOUVELLE ROUTE : PORTAIL PARENT */}
                <Route path="/parent-dashboard" element={<ParentDashboard />} />

                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dashboard/children" element={<ChildrenModule />} />
                <Route path="/dashboard/records" element={<RecordsModule />} />
                <Route path="/dashboard/screening" element={<ScreeningModule />} />
                <Route path="/dashboard/adhd" element={<ADHDModule />} />
                <Route path="/dashboard/autism" element={<AutismModule />} />
                <Route path="/dashboard/orientation" element={<OrientationModule />} />
                <Route path="/dashboard/appointments" element={<AppointmentsModule />} />
                <Route path="/dashboard/teleconsultation" element={<TeleconsultationModule />} />
                <Route path="/dashboard/guidance" element={<GuidanceModule />} />
                <Route path="/dashboard/education" element={<EducationModule />} />
                <Route path="/dashboard/community" element={<CommunityModule />} />
                <Route path="/dashboard/training" element={<TrainingModule />} />
                <Route path="/dashboard/reporting" element={<ReportingModule />} />
                <Route path="/dashboard/questionnaires" element={<QuestionnairesModule />} />
                <Route path="/dashboard/results" element={<ResultsModule />} />
                <Route path="/dashboard/resources" element={<ResourcesModule />} />
                <Route path="/dashboard/observations" element={<ObservationsModule />} />
                <Route path="/dashboard/care-plans" element={<CarePlansModule />} />
                <Route path="/dashboard/documents" element={<DocumentsModule />} />
                <Route path="/dashboard/families" element={<FamiliesModule />} />
                <Route path="/dashboard/activities" element={<ActivitiesModule />} />
                <Route path="/dashboard/users" element={<UsersModule />} />
                <Route path="/dashboard/settings" element={<SettingsModule />} />
                <Route path="/dashboard/indicators" element={<IndicatorsModule />} />
                <Route path="/dashboard/mapping" element={<MappingModule />} />
                <Route path="/dashboard/structures" element={<StructuresModule />} />
                <Route path="/dashboard/export" element={<ExportModule />} />
                <Route path="/dashboard/trends" element={<TrendsModule />} />
                
                {/* La route d'analyse est remplacée par la supervision live */}
                <Route path="/dashboard/analysis" element={<AgentSupervisionModule />} />
                
                <Route path="/dashboard/countries" element={<CountriesModule />} />
                <Route path="/dashboard/organizations" element={<OrganizationsModule />} />
                <Route path="/dashboard/roles" element={<RolesModule />} />
                <Route path="/dashboard/modules" element={<ModulesManagement />} />
                <Route path="/dashboard/languages" element={<LanguagesModule />} />
                <Route path="/dashboard/logs" element={<LogsModule />} />
                <Route path="/dashboard/support" element={<SupportModule />} />
              </Route>
              
              {/* === ROUTE 404 === */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;