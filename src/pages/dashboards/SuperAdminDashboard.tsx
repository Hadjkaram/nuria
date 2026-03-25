import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, Building, Globe, Activity, Shield, Layers, Database, Monitor, Plus, Settings, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const activityData = [
  { day: 'Lun', logins: 145, actions: 520 },
  { day: 'Mar', logins: 162, actions: 480 },
  { day: 'Mer', logins: 178, actions: 600 },
  { day: 'Jeu', logins: 155, actions: 540 },
  { day: 'Ven', logins: 190, actions: 650 },
  { day: 'Sam', logins: 80, actions: 220 },
  { day: 'Dim', logins: 45, actions: 120 },
];

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  if (!user) return null;

  const kpis = [
    { icon: Users, label: t('sa.totalUsers'), value: '1,248', color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { icon: Globe, label: t('sa.activeCountries'), value: 8, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Building, label: t('sa.activeOrgs'), value: 32, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: Activity, label: t('sa.activityVolume'), value: '3,130', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: Bell, label: t('sa.systemAlerts'), value: 2, color: 'text-red-500', bg: 'bg-red-500/10' },
    { icon: Layers, label: t('sa.activeModules'), value: 12, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  ];

  const recentLogs = [
    { action: 'Nouveau pays ajouté: Sénégal', user: 'System', time: 'Il y a 2h', type: 'info' },
    { action: 'Organisation créée: CHU Dakar', user: 'Admin', time: 'Il y a 4h', type: 'info' },
    { action: 'Tentative de connexion échouée x5', user: 'unknown@test.com', time: 'Il y a 6h', type: 'warning' },
    { action: 'Module Formation activé pour Côte d\'Ivoire', user: 'Admin', time: 'Hier', type: 'info' },
    { action: 'Base de données backup complété', user: 'System', time: 'Hier', type: 'success' },
  ];

  const countryStats = [
    { country: '🇨🇮 Côte d\'Ivoire', users: 520, orgs: 12, status: 'Active' },
    { country: '🇸🇳 Sénégal', users: 280, orgs: 8, status: 'Active' },
    { country: '🇲🇱 Mali', users: 150, orgs: 4, status: 'Active' },
    { country: '🇧🇫 Burkina Faso', users: 120, orgs: 3, status: 'Pilote' },
    { country: '🇩🇯 Djibouti', users: 85, orgs: 2, status: 'Pilote' },
  ];

  const quickActions = [
    { icon: Globe, label: t('sa.addCountry'), path: '/dashboard/countries', color: 'bg-rose-500' },
    { icon: Building, label: t('sa.addOrg'), path: '/dashboard/organizations', color: 'bg-blue-500' },
    { icon: Shield, label: t('sa.createRole'), path: '/dashboard/roles', color: 'bg-emerald-500' },
    { icon: Settings, label: t('sa.managePermissions'), path: '/dashboard/roles', color: 'bg-violet-500' },
    { icon: Database, label: t('sa.viewLogs'), path: '/dashboard/logs', color: 'bg-amber-500' },
    { icon: Layers, label: t('sa.toggleModule'), path: '/dashboard/modules', color: 'bg-teal-500' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard.welcome')}, {user.firstName} 👋</h1>
        <p className="text-muted-foreground">{t('sa.subtitle')}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-card rounded-xl p-4 border border-border">
            <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center mb-2`}>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </div>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <div className="text-xs text-muted-foreground">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">{t('pd.quickActions')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, i) => (
            <Link key={i} to={action.path} className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow text-center">
              <div className={`w-10 h-10 rounded-full ${action.color} text-white flex items-center justify-center`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Activity */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t('sa.weeklyActivity')}</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="logins" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Connexions" />
              <Bar dataKey="actions" fill="#6366f1" radius={[4, 4, 0, 0]} name="Actions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Country Stats */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t('sa.countryStats')}</h2>
          <div className="space-y-2">
            {countryStats.map((c, i) => (
              <div key={i} className="flex items-center justify-between border border-border rounded-lg p-3">
                <div>
                  <div className="font-medium text-sm">{c.country}</div>
                  <div className="text-xs text-muted-foreground">{c.users} utilisateurs • {c.orgs} organisations</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${c.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Logs */}
        <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">{t('sa.recentLogs')}</h2>
          <div className="space-y-2">
            {recentLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 border border-border rounded-lg p-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.type === 'warning' ? 'bg-red-500' : log.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                <div className="flex-1">
                  <div className="font-medium text-sm">{log.action}</div>
                  <div className="text-xs text-muted-foreground">{log.user} • {log.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
