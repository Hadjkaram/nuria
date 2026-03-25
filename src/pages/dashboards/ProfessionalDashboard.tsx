import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Baby, Calendar, ClipboardList, Stethoscope, Video, FileText, FolderOpen, Bell, Brain, Plus, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ProfessionalDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  if (!user) return null;

  const kpis = [
    { icon: Baby, label: t('pro.activePatients'), value: 45, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: Bell, label: t('pro.newReferrals'), value: 4, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: Calendar, label: t('pro.todayAppts'), value: 8, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: FolderOpen, label: t('pro.toReview'), value: 6, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { icon: Stethoscope, label: t('pro.activePlans'), value: 15, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    { icon: Video, label: t('pro.plannedTeleconsult'), value: 3, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  const todayAgenda = [
    { time: '09:00', patient: 'Amara K.', type: 'Évaluation TDAH', status: 'confirmed' },
    { time: '10:30', patient: 'Ibrahim D.', type: 'Suivi autisme', status: 'confirmed' },
    { time: '11:30', patient: 'Fatou M.', type: 'Dépistage initial', status: 'pending' },
    { time: '14:00', patient: 'Moussa T.', type: 'Téléconsultation', status: 'confirmed' },
    { time: '15:30', patient: 'Awa N.', type: 'Plan de prise en charge', status: 'confirmed' },
  ];

  const recentAlerts = [
    { patient: 'Moussa Koné', alert: 'Score MCHAT élevé – évaluation recommandée', severity: 'high' },
    { patient: 'Amara B.', alert: 'Résultat dépistage langage anormal', severity: 'medium' },
    { patient: 'Ibrahim D.', alert: 'Suivi en retard – 2 semaines', severity: 'low' },
  ];

  const pendingEvaluations = [
    { patient: 'Fatou M.', type: 'Dépistage 0-5 ans', age: '2 ans 4 mois' },
    { patient: 'Aïcha K.', type: 'Évaluation autisme', age: '3 ans 8 mois' },
    { patient: 'Oumar S.', type: 'Évaluation TDAH', age: '5 ans 1 mois' },
  ];

  const quickActions = [
    { icon: FolderOpen, label: t('pro.openRecord'), path: '/dashboard/children', color: 'bg-emerald-500' },
    { icon: Play, label: t('pro.startEvaluation'), path: '/dashboard/screening', color: 'bg-blue-500' },
    { icon: Stethoscope, label: t('pro.createPlan'), path: '/dashboard/care-plans', color: 'bg-violet-500' },
    { icon: Video, label: t('pro.launchTeleconsult'), path: '/dashboard/teleconsultation', color: 'bg-teal-500' },
    { icon: FileText, label: t('pro.addNote'), path: '/dashboard/documents', color: 'bg-amber-500' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard.welcome')}, {user.firstName} 👋</h1>
        <p className="text-muted-foreground">{t('pro.subtitle')}</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Agenda */}
        <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">{t('pro.todayAgenda')}</h2>
          <div className="space-y-2">
            {todayAgenda.map((item, i) => (
              <div key={i} className="flex items-center gap-4 border border-border rounded-lg p-3">
                <div className="text-sm font-mono font-semibold text-emerald-600 w-12">{item.time}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.patient}</div>
                  <div className="text-xs text-muted-foreground">{item.type}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {item.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Alerts */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t('pro.clinicalAlerts')}</h2>
          <div className="space-y-3">
            {recentAlerts.map((alert, i) => (
              <div key={i} className={`border-l-4 rounded-lg p-3 ${alert.severity === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : alert.severity === 'medium' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' : 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'}`}>
                <div className="font-medium text-sm">{alert.patient}</div>
                <div className="text-xs text-muted-foreground mt-1">{alert.alert}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Evaluations */}
        <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">{t('pro.pendingEvaluations')}</h2>
          <div className="space-y-2">
            {pendingEvaluations.map((ev, i) => (
              <div key={i} className="flex items-center justify-between border border-border rounded-lg p-3">
                <div>
                  <div className="font-medium text-sm">{ev.patient}</div>
                  <div className="text-xs text-muted-foreground">{ev.type} • {ev.age}</div>
                </div>
                <Button size="sm" variant="outline">{t('pro.startEvaluation')}</Button>
              </div>
            ))}
          </div>
        </div>

        {/* Activity History */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t('pro.recentActivity')}</h2>
          <div className="space-y-3 text-sm">
            {[
              { action: 'Évaluation TDAH complétée – Amara K.', time: 'Il y a 2h' },
              { action: 'Note clinique ajoutée – Ibrahim D.', time: 'Il y a 4h' },
              { action: 'Plan de PEC mis à jour – Fatou M.', time: 'Hier' },
              { action: 'Téléconsultation – Awa N.', time: 'Hier' },
            ].map((act, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <div>
                  <div className="text-foreground">{act.action}</div>
                  <div className="text-xs text-muted-foreground">{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfessionalDashboard;
