import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, Baby, Activity, Calendar, BarChart3, UserPlus, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Jan', screenings: 12, appointments: 8 },
  { month: 'Fév', screenings: 18, appointments: 14 },
  { month: 'Mar', screenings: 25, appointments: 20 },
  { month: 'Avr', screenings: 15, appointments: 13 },
  { month: 'Mai', screenings: 30, appointments: 22 },
  { month: 'Jun', screenings: 28, appointments: 25 },
];

const OrgAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  if (!user) return null;

  const kpis = [
    { icon: Users, label: t('org.activeUsers'), value: 18, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { icon: Baby, label: t('org.childrenFollowed'), value: 52, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Calendar, label: t('org.monthlyAppts'), value: 34, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: Activity, label: t('org.monthlyActivity'), value: '↑ 12%', color: 'text-teal-500', bg: 'bg-teal-500/10' },
    { icon: BarChart3, label: t('org.topModule'), value: 'Dépistage', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  const teamMembers = [
    { name: 'Dr. Jean Mbeki', role: 'Professionnel', active: true, lastActivity: 'Il y a 1h' },
    { name: 'Fatou Diallo', role: 'Enseignant', active: true, lastActivity: 'Il y a 3h' },
    { name: 'Moussa Traoré', role: 'Agent communautaire', active: false, lastActivity: 'Hier' },
  ];

  const quickActions = [
    { icon: UserPlus, label: t('org.addUser'), path: '/dashboard/users', color: 'bg-violet-500' },
    { icon: Settings, label: t('org.assignRole'), path: '/dashboard/settings', color: 'bg-blue-500' },
    { icon: Activity, label: t('org.viewActivity'), path: '/dashboard/activities', color: 'bg-emerald-500' },
    { icon: FileText, label: t('org.exportReport'), path: '/dashboard/reporting', color: 'bg-amber-500' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard.welcome')}, {user.firstName} 👋</h1>
        <p className="text-muted-foreground">{t('org.subtitle')}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
        {/* Monthly Activity Chart */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t('org.monthlyActivityChart')}</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="screenings" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Dépistages" />
              <Bar dataKey="appointments" fill="#10b981" radius={[4, 4, 0, 0]} name="Rendez-vous" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Team Members */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t('org.team')}</h2>
          <div className="space-y-3">
            {teamMembers.map((m, i) => (
              <div key={i} className="flex items-center justify-between border border-border rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${m.active ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                  <div>
                    <div className="font-medium text-sm">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.role}</div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{m.lastActivity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrgAdminDashboard;
