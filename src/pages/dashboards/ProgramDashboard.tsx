import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Baby, ClipboardList, ArrowRightLeft, Stethoscope, Building, TrendingUp, MapPin, BarChart3, FileText, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const regionData = [
  { region: 'Abidjan', children: 450, screened: 320 },
  { region: 'Bouaké', children: 180, screened: 120 },
  { region: 'Daloa', children: 95, screened: 65 },
  { region: 'San Pedro', children: 72, screened: 40 },
  { region: 'Korhogo', children: 60, screened: 35 },
];

const evolutionData = [
  { month: 'Jan', registered: 120, screened: 80, oriented: 45 },
  { month: 'Fév', registered: 180, screened: 140, oriented: 65 },
  { month: 'Mar', registered: 250, screened: 200, oriented: 90 },
  { month: 'Avr', registered: 210, screened: 175, oriented: 78 },
  { month: 'Mai', registered: 310, screened: 260, oriented: 110 },
  { month: 'Jun', registered: 290, screened: 240, oriented: 105 },
];

const disorderBreakdown = [
  { name: 'Autisme', value: 28, color: '#3b82f6' },
  { name: 'TDAH', value: 22, color: '#f59e0b' },
  { name: 'Langage', value: 25, color: '#10b981' },
  { name: 'Apprentissage', value: 15, color: '#8b5cf6' },
  { name: 'Retard', value: 10, color: '#ef4444' },
];

const ProgramDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  if (!user) return null;

  const kpis = [
    { icon: Baby, label: t('prog.registeredChildren'), value: '1,360', color: 'text-teal-500', bg: 'bg-teal-500/10' },
    { icon: ClipboardList, label: t('prog.screenedChildren'), value: '1,015', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: ArrowRightLeft, label: t('prog.orientedCases'), value: 493, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: Stethoscope, label: t('prog.followedCases'), value: 312, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { icon: Building, label: t('prog.activeStructures'), value: 32, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: TrendingUp, label: t('prog.avgOrientDelay'), value: '4.2j', color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  const topStructures = [
    { name: 'CHU Cocody', cases: 145, rate: '92%' },
    { name: 'CSU Abobo', cases: 98, rate: '87%' },
    { name: 'CAMSP Yopougon', cases: 76, rate: '95%' },
    { name: 'Hôpital Bouaké', cases: 54, rate: '81%' },
  ];

  const quickActions = [
    { icon: FileText, label: t('prog.exportReport'), path: '/dashboard/reporting', color: 'bg-teal-500' },
    { icon: Filter, label: t('prog.filterByRegion'), path: '/dashboard/mapping', color: 'bg-blue-500' },
    { icon: TrendingUp, label: t('prog.detailedIndicators'), path: '/dashboard/indicators', color: 'bg-emerald-500' },
    { icon: Building, label: t('prog.mostActiveStructures'), path: '/dashboard/structures', color: 'bg-amber-500' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard.welcome')}, {user.firstName} 👋</h1>
        <p className="text-muted-foreground">{t('prog.subtitle')}</p>
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
        {/* Evolution Chart */}
        <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">{t('prog.evolutionChart')}</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="registered" stroke="#14b8a6" strokeWidth={2} name="Enregistrés" />
              <Line type="monotone" dataKey="screened" stroke="#3b82f6" strokeWidth={2} name="Dépistés" />
              <Line type="monotone" dataKey="oriented" stroke="#10b981" strokeWidth={2} name="Orientés" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Regional Breakdown */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t('prog.byRegion')}</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={regionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" fontSize={12} />
              <YAxis dataKey="region" type="category" fontSize={11} width={80} />
              <Tooltip />
              <Bar dataKey="children" fill="#14b8a6" radius={[0, 4, 4, 0]} name="Enregistrés" />
              <Bar dataKey="screened" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Dépistés" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Disorder Breakdown */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t('prog.disorderBreakdown')}</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={disorderBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} fontSize={10}>
                {disorderBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Structures */}
        <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">{t('prog.topStructures')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {topStructures.map((s, i) => (
              <div key={i} className="border border-border rounded-lg p-4 bg-teal-50/50 dark:bg-teal-950/20">
                <div className="font-medium text-sm">{s.name}</div>
                <div className="text-2xl font-bold mt-1">{s.cases}</div>
                <div className="text-xs text-muted-foreground">cas traités • {s.rate} complétude</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProgramDashboard;
