import {
  LayoutDashboard, Baby, ClipboardList, Brain, Puzzle, ArrowRightLeft,
  Calendar, Video, BookHeart, GraduationCap, Users, Award, BarChart3,
  Heart, FileText, Home, Eye, MapPin, Building, Globe, Activity,
  Settings, Shield, Layers, TrendingUp, FolderOpen, Bell, Stethoscope,
  UserCheck, Map, BookOpen, Briefcase, Database, Lock, Monitor, Flag
} from 'lucide-react';
import type { UserRole } from '@/contexts/AuthContext';

export interface NavItem {
  icon: any;
  labelKey: string;
  path: string;
}

const parentNav: NavItem[] = [
  { icon: LayoutDashboard, labelKey: 'sidebar.dashboard', path: '/dashboard' },
  { icon: Baby, labelKey: 'sidebar.myChildren', path: '/dashboard/children' },
  { icon: FileText, labelKey: 'sidebar.devPassport', path: '/dashboard/screening' },
  { icon: ClipboardList, labelKey: 'sidebar.questionnaires', path: '/dashboard/questionnaires' },
  { icon: BarChart3, labelKey: 'sidebar.results', path: '/dashboard/results' },
  { icon: Calendar, labelKey: 'sidebar.appointments', path: '/dashboard/appointments' },
  { icon: Video, labelKey: 'sidebar.teleconsultation', path: '/dashboard/teleconsultation' },
  { icon: BookHeart, labelKey: 'sidebar.guidance', path: '/dashboard/guidance' },
  { icon: Heart, labelKey: 'sidebar.resources', path: '/dashboard/resources' },
];

const professionalNav: NavItem[] = [
  { icon: LayoutDashboard, labelKey: 'sidebar.dashboard', path: '/dashboard' },
  { icon: Baby, labelKey: 'sidebar.patients', path: '/dashboard/children' },
  { icon: FolderOpen, labelKey: 'sidebar.childRecords', path: '/dashboard/records' },
  { icon: ClipboardList, labelKey: 'sidebar.evaluations', path: '/dashboard/screening' },
  { icon: Brain, labelKey: 'sidebar.adhd', path: '/dashboard/adhd' },
  { icon: Puzzle, labelKey: 'sidebar.autism', path: '/dashboard/autism' },
  { icon: Stethoscope, labelKey: 'sidebar.carePlans', path: '/dashboard/care-plans' },
  { icon: Calendar, labelKey: 'sidebar.appointments', path: '/dashboard/appointments' },
  { icon: Video, labelKey: 'sidebar.teleconsultation', path: '/dashboard/teleconsultation' },
  { icon: FileText, labelKey: 'sidebar.clinicalDocs', path: '/dashboard/documents' },
  { icon: Award, labelKey: 'sidebar.training', path: '/dashboard/training' },
];

const teacherNav: NavItem[] = [
  { icon: LayoutDashboard, labelKey: 'sidebar.dashboard', path: '/dashboard' },
  { icon: GraduationCap, labelKey: 'sidebar.students', path: '/dashboard/children' },
  { icon: Eye, labelKey: 'sidebar.observations', path: '/dashboard/observations' },
  { icon: ClipboardList, labelKey: 'sidebar.eduScreening', path: '/dashboard/screening' },
  { icon: BookOpen, labelKey: 'sidebar.pedRecommendations', path: '/dashboard/education' },
  { icon: FileText, labelKey: 'sidebar.supportPlans', path: '/dashboard/support-plans' },
  { icon: Heart, labelKey: 'sidebar.eduResources', path: '/dashboard/resources' },
  { icon: Award, labelKey: 'sidebar.training', path: '/dashboard/training' },
];

const communityNav: NavItem[] = [
  { icon: LayoutDashboard, labelKey: 'sidebar.dashboard', path: '/dashboard' },
  { icon: Users, labelKey: 'sidebar.families', path: '/dashboard/families' },
  { icon: Baby, labelKey: 'sidebar.identifiedChildren', path: '/dashboard/children' },
  { icon: ClipboardList, labelKey: 'sidebar.screeningForms', path: '/dashboard/screening' },
  { icon: ArrowRightLeft, labelKey: 'sidebar.orientations', path: '/dashboard/orientation' },
  { icon: MapPin, labelKey: 'sidebar.fieldActivities', path: '/dashboard/activities' },
  { icon: Heart, labelKey: 'sidebar.communityResources', path: '/dashboard/resources' },
  { icon: Award, labelKey: 'sidebar.training', path: '/dashboard/training' },
];

const orgAdminNav: NavItem[] = [
  { icon: LayoutDashboard, labelKey: 'sidebar.dashboard', path: '/dashboard' },
  { icon: Users, labelKey: 'sidebar.users', path: '/dashboard/users' },
  { icon: Baby, labelKey: 'sidebar.childRecords', path: '/dashboard/children' },
  { icon: Activity, labelKey: 'sidebar.activities', path: '/dashboard/activities' },
  { icon: Calendar, labelKey: 'sidebar.appointments', path: '/dashboard/appointments' },
  { icon: BarChart3, labelKey: 'sidebar.orgStats', path: '/dashboard/reporting' },
  { icon: Settings, labelKey: 'sidebar.orgSettings', path: '/dashboard/settings' },
  { icon: FileText, labelKey: 'sidebar.documents', path: '/dashboard/documents' },
];

const programNav: NavItem[] = [
  { icon: LayoutDashboard, labelKey: 'sidebar.dashboard', path: '/dashboard' },
  { icon: TrendingUp, labelKey: 'sidebar.nationalIndicators', path: '/dashboard/indicators' },
  { icon: Map, labelKey: 'sidebar.mapping', path: '/dashboard/mapping' },
  { icon: Building, labelKey: 'sidebar.structures', path: '/dashboard/structures' },
  { icon: Activity, labelKey: 'sidebar.activities', path: '/dashboard/activities' },
  { icon: ArrowRightLeft, labelKey: 'sidebar.referrals', path: '/dashboard/orientation' },
  { icon: BarChart3, labelKey: 'sidebar.reports', path: '/dashboard/reporting' },
  { icon: FileText, labelKey: 'sidebar.export', path: '/dashboard/export' },
  { icon: Settings, labelKey: 'sidebar.programSettings', path: '/dashboard/settings' },
];

const ministryNav: NavItem[] = [
  { icon: LayoutDashboard, labelKey: 'sidebar.dashboard', path: '/dashboard' },
  { icon: Flag, labelKey: 'sidebar.strategicIndicators', path: '/dashboard/indicators' },
  { icon: Map, labelKey: 'sidebar.nationalMap', path: '/dashboard/mapping' },
  { icon: BarChart3, labelKey: 'sidebar.reports', path: '/dashboard/reporting' },
  { icon: TrendingUp, labelKey: 'sidebar.trends', path: '/dashboard/trends' },
  { icon: Activity, labelKey: 'sidebar.comparativeAnalysis', path: '/dashboard/analysis' },
  { icon: FileText, labelKey: 'sidebar.decisionExport', path: '/dashboard/export' },
];

const superAdminNav: NavItem[] = [
  { icon: LayoutDashboard, labelKey: 'sidebar.dashboard', path: '/dashboard' },
  { icon: Globe, labelKey: 'sidebar.countries', path: '/dashboard/countries' },
  { icon: Building, labelKey: 'sidebar.organizations', path: '/dashboard/organizations' },
  { icon: Users, labelKey: 'sidebar.users', path: '/dashboard/users' },
  { icon: Shield, labelKey: 'sidebar.rolesPermissions', path: '/dashboard/roles' },
  { icon: Layers, labelKey: 'sidebar.modules', path: '/dashboard/modules' },
  { icon: Settings, labelKey: 'sidebar.globalSettings', path: '/dashboard/settings' },
  { icon: Globe, labelKey: 'sidebar.languages', path: '/dashboard/languages' },
  { icon: Database, labelKey: 'sidebar.logsAudit', path: '/dashboard/logs' },
  { icon: BarChart3, labelKey: 'sidebar.globalReporting', path: '/dashboard/reporting' },
  { icon: Monitor, labelKey: 'sidebar.support', path: '/dashboard/support' },
];

export const roleNavigation: Record<UserRole, NavItem[]> = {
  parent: parentNav,
  professional: professionalNav,
  teacher: teacherNav,
  community: communityNav,
  orgAdmin: orgAdminNav,
  program: programNav,
  ministry: ministryNav,
  superAdmin: superAdminNav,
};
