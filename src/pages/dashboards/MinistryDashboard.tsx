import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Globe, TrendingUp, Activity, BarChart3, MapPin, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const nationalTrend = [
  { quarter: 'Q1 2025', coverage: 35, detection: 22 },
  { quarter: 'Q2 2025', coverage: 42, detection: 28 },
  { quarter: 'Q3 2025', coverage: 51, detection: 35 },
  { quarter: 'Q4 2025', coverage: 58, detection: 40 },
  { quarter: 'Q1 2026', coverage: 67, detection: 48 },
];

const regionalComparison = [
  { region: 'Abidjan', performance: 92 },
  { region: 'Bouaké', performance: 78 },
  { region: 'Daloa', performance: 65 },
  { region: 'San Pedro', performance: 58 },
  { region: 'Korhogo', performance: 45 },
  { region: 'Man', performance: 38 },
];

const sectorBreakdown = [
  { name: 'Santé', value: 45, color: '#3b82f6' },
  { name: 'Éducation', value: 30, color: '#f59e0b' },
  { name: 'Communautaire', value: 25, color: '#10b981' },
];

const MinistryDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  if (!user) return null;

  const kpis = [
    { icon: Globe, label: t('min.nationalCoverage'), value: '67%', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { icon: TrendingUp, label: t('min.caseEvolution'), value: '+23%', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: Activity, label: t('min.globalActivity'), value: '1,248', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: MapPin, label: t('min.activeRegions'), value: '12/22', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: BarChart3, label: t('min.performanceIndex'), value: '78/100', color: 'text-violet-500', bg: 'bg-violet-500/10' },
  ];

  const strategicPoints = [
    { title: 'Couverture Nord insuffisante', type: 'alert', desc: '3 régions sous 40% de couverture' },
    { title: 'Progression Sud-Ouest', type: 'positive', desc: '+35% de dépistages en 6 mois' },
    { title: 'Besoin de formation', type: 'info', desc: '45% des agents non formés au dépistage TND' },
  ];

  const quickActions = [
    { icon: FileText, label: t('min.exportNational'), path: '/dashboard/reporting', color: 'bg-indigo-500' },
    { icon: Download, label: t('min.downloadReport'), path: '/dashboard/export', color: 'bg-blue-500' },
    { icon: BarChart3, label: t('min.compareRegions'), path: '/dashboard/analysis', color: 'bg-emerald-500' },
    { icon: TrendingUp, label: t('min.consultTrends'), path: '/dashboard/trends', color: 'bg-amber-500' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard.welcome')}, {user.firstName} 👋</h1>
        <p className="text-muted-foreground">{t('min.subtitle')}</p>
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
        {/* National Trend */}
        <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">{t('min.nationalTrend')}</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={nationalTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="quarter" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="coverage" stroke="#6366f1" strokeWidth={2} name="Couverture %" />
              <Line type="monotone" dataKey="detection" stroke="#10b981" strokeWidth={2} name="Détection %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Regional Comparison */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t('min.regionalComparison')}</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={regionalComparison} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" fontSize={12} domain={[0, 100]} />
              <YAxis dataKey="region" type="category" fontSize={11} width={80} />
              <Tooltip />
              <Bar dataKey="performance" fill="#6366f1" radius={[0, 4, 4, 0]} name="Performance %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sector Breakdown */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-lg font-semibold mb-4">{t('min.sectorBreakdown')}</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={sectorBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} fontSize={11}>
                {sectorBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Strategic Points */}
        <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">{t('min.strategicPoints')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {strategicPoints.map((point, i) => (
              <div key={i} className={`border-l-4 rounded-lg p-4 ${point.type === 'alert' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : point.type === 'positive' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'}`}>
                <div className="font-medium text-sm">{point.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{point.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MinistryDashboard;
