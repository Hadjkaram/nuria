import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Baby, Bell, ClipboardList, Calendar, BookOpen, Heart, Plus, Play, Eye, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  if (!user) return null;

  const kpis = [
    { icon: Baby, label: t('dashboard.children'), value: 2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: ClipboardList, label: t('sidebar.questionnaires'), value: 3, color: 'text-amber-500', bg: 'bg-amber-500/10', suffix: t('pd.pending') },
    { icon: Calendar, label: t('sidebar.appointments'), value: 1, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: Bell, label: t('dashboard.alerts'), value: 2, color: 'text-red-500', bg: 'bg-red-500/10' },
    { icon: BookOpen, label: t('dashboard.recommendations'), value: 5, color: 'text-violet-500', bg: 'bg-violet-500/10', suffix: t('pd.unread') },
  ];

  const children = [
    { name: 'Amara Koné', age: '3 ans 2 mois', status: 'ok', lastScreening: '12 Jan 2026', nextAppt: '15 Mar 2026' },
    { name: 'Moussa Koné', age: '14 mois', status: 'alert', lastScreening: '5 Fév 2026', nextAppt: '20 Mar 2026' },
  ];

  const quickActions = [
    { icon: Plus, label: t('pd.addChild'), path: '/dashboard/children', color: 'bg-blue-500' },
    { icon: Play, label: t('pd.startQuestionnaire'), path: '/dashboard/screening', color: 'bg-amber-500' },
    { icon: Eye, label: t('pd.viewResults'), path: '/dashboard/results', color: 'bg-emerald-500' },
    { icon: Calendar, label: t('pd.bookAppointment'), path: '/dashboard/appointments', color: 'bg-violet-500' },
    { icon: Video, label: t('sidebar.teleconsultation'), path: '/dashboard/teleconsultation', color: 'bg-teal-500' },
    { icon: Heart, label: t('sidebar.guidance'), path: '/dashboard/guidance', color: 'bg-rose-500' },
  ];

  const recommendations = [
    { title: 'Stimulation du langage – 12-18 mois', type: 'Guidance', date: '10 Mar 2026' },
    { title: 'Activités motrices pour Amara', type: 'Exercice', date: '8 Mar 2026' },
    { title: 'Résultat dépistage Moussa – À revoir', type: 'Alerte', date: '5 Mar 2026' },
  ];

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('dashboard.welcome')}, {user.firstName} 👋</h1>
        <p className="text-muted-foreground">{t('pd.subtitle')}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-card rounded-xl p-4 border border-border">
            <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center mb-2`}>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </div>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <div className="text-xs text-muted-foreground">{kpi.label} {kpi.suffix && <span className="text-orange-500">• {kpi.suffix}</span>}</div>
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
        {/* Children Summary */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('sidebar.myChildren')}</h2>
            <Link to="/dashboard/children">
              <Button variant="outline" size="sm">{t('pd.viewAll')}</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {children.map((child, i) => (
              <div key={i} className="border border-border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{child.name}</div>
                  <div className="text-xs text-muted-foreground">{child.age}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t('pd.lastScreening')}: {child.lastScreening}</div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-full ${child.status === 'ok' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {child.status === 'ok' ? '✓ Normal' : '⚠ À surveiller'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{t('pd.nextAppt')}: {child.nextAppt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t('pd.recentRecommendations')}</h2>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="border border-border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{rec.title}</div>
                  <div className="text-xs text-muted-foreground">{rec.date}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${rec.type === 'Alerte' ? 'bg-red-100 text-red-700' : rec.type === 'Guidance' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {rec.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Activities */}
        <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">{t('pd.suggestedActivities')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['Jeux de langage pour Moussa', 'Exercices de motricité fine – Amara', 'Lecture interactive – 15 min/jour'].map((act, i) => (
              <div key={i} className="border border-border rounded-lg p-4 bg-blue-50/50 dark:bg-blue-950/20">
                <Heart className="h-5 w-5 text-blue-500 mb-2" />
                <div className="text-sm font-medium">{act}</div>
                <Button variant="link" size="sm" className="px-0 mt-1 text-blue-600">{t('pd.start')}</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
