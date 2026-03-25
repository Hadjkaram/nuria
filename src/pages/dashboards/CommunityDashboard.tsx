import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, Baby, ArrowRightLeft, MapPin, Calendar, Plus, ClipboardList, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CommunityDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  if (!user) return null;

  const kpis = [
    { icon: Users, label: t('comm.followedFamilies'), value: 24, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { icon: Baby, label: t('comm.identifiedChildren'), value: 11, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: ArrowRightLeft, label: t('comm.orientationsMade'), value: 8, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: Calendar, label: t('comm.plannedVisits'), value: 5, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { icon: MapPin, label: t('comm.casesToFollow'), value: 3, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  const priorityFamilies = [
    { name: 'Famille Traoré', children: 2, status: 'À relancer', area: 'Abobo' },
    { name: 'Famille Ouattara', children: 1, status: 'Orientée', area: 'Yopougon' },
    { name: 'Famille Diallo', children: 3, status: 'En attente', area: 'Cocody' },
  ];

  const recentChildren = [
    { name: 'Seydou T.', age: '2 ans 6 mois', concern: 'Retard de langage', date: '7 Mar 2026' },
    { name: 'Aya O.', age: '18 mois', concern: 'Pas de babillage', date: '5 Mar 2026' },
    { name: 'Mamadou D.', age: '3 ans', concern: 'Isolement', date: '3 Mar 2026' },
  ];

  const quickActions = [
    { icon: Plus, label: t('comm.addChild'), path: '/dashboard/children', color: 'bg-orange-500' },
    { icon: ClipboardList, label: t('comm.fillForm'), path: '/dashboard/screening', color: 'bg-blue-500' },
    { icon: ArrowRightLeft, label: t('comm.makeOrientation'), path: '/dashboard/orientation', color: 'bg-emerald-500' },
    { icon: Home, label: t('comm.addVisit'), path: '/dashboard/activities', color: 'bg-violet-500' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard.welcome')}, {user.firstName} 👋</h1>
        <p className="text-muted-foreground">{t('comm.subtitle')}</p>
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
        {/* Priority Families */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t('comm.priorityFamilies')}</h2>
          <div className="space-y-3">
            {priorityFamilies.map((f, i) => (
              <div key={i} className="border border-border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{f.children} enfant(s) • {f.area}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${f.status === 'À relancer' ? 'bg-red-100 text-red-700' : f.status === 'Orientée' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {f.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Identified Children */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t('comm.recentChildren')}</h2>
          <div className="space-y-3">
            {recentChildren.map((c, i) => (
              <div key={i} className="border border-border rounded-lg p-3">
                <div className="flex justify-between">
                  <div className="font-medium text-sm">{c.name} <span className="text-xs text-muted-foreground">({c.age})</span></div>
                  <span className="text-xs text-muted-foreground">{c.date}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{c.concern}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Orientations */}
        <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">{t('comm.pendingOrientations')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { child: 'Seydou T.', to: 'Centre de santé Abobo', status: 'En attente de RDV' },
              { child: 'Aya O.', to: 'Hôpital Cocody – Pédiatrie', status: 'Orientée' },
              { child: 'Mamadou D.', to: 'CAMSP Yopougon', status: 'En cours' },
            ].map((o, i) => (
              <div key={i} className="border border-border rounded-lg p-4 bg-orange-50/50 dark:bg-orange-950/20">
                <div className="font-medium text-sm">{o.child}</div>
                <div className="text-xs text-muted-foreground mt-1">→ {o.to}</div>
                <span className={`text-xs mt-2 inline-block px-2 py-0.5 rounded-full ${o.status === 'Orientée' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CommunityDashboard;
