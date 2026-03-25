import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { GraduationCap, Eye, BookOpen, FileText, Bell, UserPlus, ClipboardList, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  if (!user) return null;

  const kpis = [
    { icon: GraduationCap, label: t('teacher.reportedStudents'), value: 7, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: Eye, label: t('teacher.pendingObs'), value: 4, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: BookOpen, label: t('teacher.receivedRecs'), value: 10, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: FileText, label: t('teacher.activePlans'), value: 5, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { icon: Bell, label: t('teacher.toUpdate'), value: 3, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  const studentsNeedingAttention = [
    { name: 'Koffi A.', class: 'CP1', concern: 'Difficultés de concentration', status: 'urgent' },
    { name: 'Mariam D.', class: 'CE1', concern: 'Retard de langage', status: 'monitoring' },
    { name: 'Oumar B.', class: 'CP2', concern: 'Isolement social', status: 'new' },
    { name: 'Aïcha T.', class: 'CE2', concern: 'Difficultés d\'apprentissage', status: 'monitoring' },
  ];

  const recentObservations = [
    { student: 'Koffi A.', obs: 'Ne peut rester assis plus de 5 min, agitation constante', date: '8 Mar 2026' },
    { student: 'Mariam D.', obs: 'Progrès en langage oral avec support visuel', date: '6 Mar 2026' },
    { student: 'Oumar B.', obs: 'Évite les interactions avec les pairs', date: '5 Mar 2026' },
  ];

  const quickActions = [
    { icon: UserPlus, label: t('teacher.reportStudent'), path: '/dashboard/children', color: 'bg-amber-500' },
    { icon: Eye, label: t('teacher.addObservation'), path: '/dashboard/observations', color: 'bg-blue-500' },
    { icon: BookOpen, label: t('teacher.viewRecs'), path: '/dashboard/education', color: 'bg-emerald-500' },
    { icon: Heart, label: t('teacher.openResources'), path: '/dashboard/resources', color: 'bg-rose-500' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard.welcome')}, {user.firstName} 👋</h1>
        <p className="text-muted-foreground">{t('teacher.subtitle')}</p>
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
        {/* Students Needing Attention */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t('teacher.studentsAttention')}</h2>
          <div className="space-y-3">
            {studentsNeedingAttention.map((s, i) => (
              <div key={i} className="border border-border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{s.name} <span className="text-xs text-muted-foreground">({s.class})</span></div>
                  <div className="text-xs text-muted-foreground">{s.concern}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${s.status === 'urgent' ? 'bg-red-100 text-red-700' : s.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                  {s.status === 'urgent' ? 'Urgent' : s.status === 'new' ? 'Nouveau' : 'Suivi'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Observations */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t('teacher.recentObs')}</h2>
          <div className="space-y-3">
            {recentObservations.map((obs, i) => (
              <div key={i} className="border border-border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="font-medium text-sm">{obs.student}</div>
                  <span className="text-xs text-muted-foreground">{obs.date}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{obs.obs}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pedagogical Recommendations */}
        <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">{t('teacher.pedResources')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { title: 'Adapter l\'environnement de classe pour le TDAH', cat: 'TDAH' },
              { title: 'Supports visuels pour les troubles du langage', cat: 'Langage' },
              { title: 'Gérer les comportements répétitifs en classe', cat: 'Autisme' },
            ].map((res, i) => (
              <div key={i} className="border border-border rounded-lg p-4 bg-amber-50/50 dark:bg-amber-950/20">
                <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">{res.cat}</span>
                <div className="text-sm font-medium mt-2">{res.title}</div>
                <Button variant="link" size="sm" className="px-0 mt-1 text-amber-600">{t('pd.viewAll')}</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
