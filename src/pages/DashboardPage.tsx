import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ParentDashboard from './dashboards/ParentDashboard';
import ProfessionalDashboard from './dashboards/ProfessionalDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import CommunityDashboard from './dashboards/CommunityDashboard';
import OrgAdminDashboard from './dashboards/OrgAdminDashboard';
import ProgramDashboard from './dashboards/ProgramDashboard';
import MinistryDashboard from './dashboards/MinistryDashboard';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';

const dashboardMap: Record<string, React.FC> = {
  parent: ParentDashboard,
  professional: ProfessionalDashboard,
  teacher: TeacherDashboard,
  community: CommunityDashboard,
  orgAdmin: OrgAdminDashboard,
  program: ProgramDashboard,
  ministry: MinistryDashboard,
  superAdmin: SuperAdminDashboard,
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const DashboardComponent = dashboardMap[user.role] || ParentDashboard;
  return <DashboardComponent />;
};

export default DashboardPage;
