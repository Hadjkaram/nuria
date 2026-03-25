import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp, TrendingDown, BarChart3, Activity, Users, Baby, Brain,
  ClipboardList, ArrowRightLeft, MapPin, Building, Calendar, Target,
  AlertTriangle, CheckCircle2, Clock, Download, Filter, Eye,
  Minus, ChevronUp, ChevronDown, Percent, Hash
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Oct', screened: 320, referred: 45, inCare: 28 },
  { month: 'Nov', screened: 410, referred: 58, inCare: 35 },
  { month: 'Dec', screened: 380, referred: 52, inCare: 40 },
  { month: 'Jan', screened: 450, referred: 63, inCare: 48 },
  { month: 'Fév', screened: 520, referred: 71, inCare: 55 },
  { month: 'Mar', screened: 490, referred: 68, inCare: 62 },
];

const regionalData = [
  { region: 'Abidjan', screened: 1250, referred: 180, coverage: 78, structures: 12 },
  { region: 'Bouaké', screened: 680, referred: 95, coverage: 55, structures: 6 },
  { region: 'San-Pédro', screened: 420, referred: 58, coverage: 42, structures: 4 },
  { region: 'Korhogo', screened: 350, referred: 48, coverage: 38, structures: 3 },
  { region: 'Daloa', screened: 310, referred: 42, coverage: 35, structures: 3 },
  { region: 'Man', screened: 260, referred: 35, coverage: 30, structures: 2 },
];

const disorderData = [
  { name: 'Retard de langage', value: 35, color: '#3b82f6' },
  { name: 'TDAH', value: 22, color: '#f59e0b' },
  { name: 'TSA', value: 18, color: '#8b5cf6' },
  { name: 'Retard moteur', value: 12, color: '#10b981' },
  { name: 'Troubles apprentissage', value: 8, color: '#ef4444' },
  { name: 'Autres', value: 5, color: '#6b7280' },
];

const ageGroupData = [
  { group: '0-6m', count: 180 },
  { group: '6-12m', count: 320 },
  { group: '12-24m', count: 580 },
  { group: '2-3a', count: 720 },
  { group: '3-5a', count: 650 },
  { group: '5-8a', count: 420 },
];

const coverageTrend = [
  { month: 'Oct', coverage: 32 },
  { month: 'Nov', coverage: 38 },
  { month: 'Dec', coverage: 41 },
  { month: 'Jan', coverage: 47 },
  { month: 'Fév', coverage: 52 },
  { month: 'Mar', coverage: 56 },
];

const IndicatorsModule: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [period, setPeriod] = useState('6months');
  const [region, setRegion] = useState('all');

  const isMinistry = user?.role === 'ministry';

  const l = {
    fr: {
      title: isMinistry ? 'Indicateurs stratégiques' : 'Indicateurs nationaux',
      subtitle: isMinistry ? 'Vue stratégique du programme national' : 'Supervision opérationnelle nationale',
      overview: 'Vue d\'ensemble', byRegion: 'Par région', disorders: 'Troubles', trends: 'Tendances',
      period: 'Période', last3m: '3 derniers mois', last6m: '6 derniers mois', last12m: '12 derniers mois', year: 'Année en cours',
      allRegions: 'Toutes les régions',
      totalScreened: 'Enfants dépistés', totalReferred: 'Cas orientés', totalInCare: 'En prise en charge', coverage: 'Couverture nationale',
      activeStructures: 'Structures actives', avgDelay: 'Délai moyen orientation', activeProfessionals: 'Professionnels actifs', familiesFollowed: 'Familles suivies',
      evolution: 'Évolution mensuelle', screened: 'Dépistés', referred: 'Orientés', inCare: 'En PEC',
      regionalPerformance: 'Performance régionale', region: 'Région', structures: 'Structures',
      disorderBreakdown: 'Répartition par trouble', byAge: 'Par tranche d\'âge',
      coverageTrend: 'Évolution de la couverture (%)', keyMetrics: 'Métriques clés',
      screeningRate: 'Taux de dépistage', referralRate: 'Taux d\'orientation', careRate: 'Taux de PEC', completionRate: 'Taux de complétion',
      export: 'Exporter', vs: 'vs mois précédent',
    },
    en: {
      title: isMinistry ? 'Strategic indicators' : 'National indicators',
      subtitle: isMinistry ? 'Strategic view of the national program' : 'National operational supervision',
      overview: 'Overview', byRegion: 'By region', disorders: 'Disorders', trends: 'Trends',
      period: 'Period', last3m: 'Last 3 months', last6m: 'Last 6 months', last12m: 'Last 12 months', year: 'Current year',
      allRegions: 'All regions',
      totalScreened: 'Children screened', totalReferred: 'Cases referred', totalInCare: 'In care', coverage: 'National coverage',
      activeStructures: 'Active structures', avgDelay: 'Avg. referral delay', activeProfessionals: 'Active professionals', familiesFollowed: 'Families followed',
      evolution: 'Monthly evolution', screened: 'Screened', referred: 'Referred', inCare: 'In care',
      regionalPerformance: 'Regional performance', region: 'Region', structures: 'Structures',
      disorderBreakdown: 'Disorder breakdown', byAge: 'By age group',
      coverageTrend: 'Coverage trend (%)', keyMetrics: 'Key metrics',
      screeningRate: 'Screening rate', referralRate: 'Referral rate', careRate: 'Care rate', completionRate: 'Completion rate',
      export: 'Export', vs: 'vs previous month',
    },
    pt: {
      title: isMinistry ? 'Indicadores estratégicos' : 'Indicadores nacionais',
      subtitle: isMinistry ? 'Visão estratégica do programa nacional' : 'Supervisão operacional nacional',
      overview: 'Visão geral', byRegion: 'Por região', disorders: 'Transtornos', trends: 'Tendências',
      period: 'Período', last3m: 'Últimos 3 meses', last6m: 'Últimos 6 meses', last12m: 'Últimos 12 meses', year: 'Ano atual',
      allRegions: 'Todas as regiões',
      totalScreened: 'Crianças triadas', totalReferred: 'Casos encaminhados', totalInCare: 'Em tratamento', coverage: 'Cobertura nacional',
      activeStructures: 'Estruturas ativas', avgDelay: 'Prazo médio de encaminhamento', activeProfessionals: 'Profissionais ativos', familiesFollowed: 'Famílias acompanhadas',
      evolution: 'Evolução mensal', screened: 'Triados', referred: 'Encaminhados', inCare: 'Em tratamento',
      regionalPerformance: 'Desempenho regional', region: 'Região', structures: 'Estruturas',
      disorderBreakdown: 'Distribuição por transtorno', byAge: 'Por faixa etária',
      coverageTrend: 'Tendência de cobertura (%)', keyMetrics: 'Métricas chave',
      screeningRate: 'Taxa de triagem', referralRate: 'Taxa de encaminhamento', careRate: 'Taxa de tratamento', completionRate: 'Taxa de conclusão',
      export: 'Exportar', vs: 'vs mês anterior',
    },
    ar: {
      title: isMinistry ? 'المؤشرات الاستراتيجية' : 'المؤشرات الوطنية',
      subtitle: isMinistry ? 'رؤية استراتيجية للبرنامج الوطني' : 'الإشراف التشغيلي الوطني',
      overview: 'نظرة عامة', byRegion: 'حسب المنطقة', disorders: 'الاضطرابات', trends: 'الاتجاهات',
      period: 'الفترة', last3m: 'آخر 3 أشهر', last6m: 'آخر 6 أشهر', last12m: 'آخر 12 شهراً', year: 'السنة الحالية',
      allRegions: 'جميع المناطق',
      totalScreened: 'الأطفال المفحوصون', totalReferred: 'حالات محالة', totalInCare: 'في الرعاية', coverage: 'التغطية الوطنية',
      activeStructures: 'هياكل نشطة', avgDelay: 'متوسط تأخير الإحالة', activeProfessionals: 'مهنيون نشطون', familiesFollowed: 'عائلات متابعة',
      evolution: 'التطور الشهري', screened: 'مفحوصون', referred: 'محالون', inCare: 'في الرعاية',
      regionalPerformance: 'الأداء الإقليمي', region: 'المنطقة', structures: 'الهياكل',
      disorderBreakdown: 'توزيع الاضطرابات', byAge: 'حسب الفئة العمرية',
      coverageTrend: 'اتجاه التغطية (%)', keyMetrics: 'المقاييس الرئيسية',
      screeningRate: 'معدل الفحص', referralRate: 'معدل الإحالة', careRate: 'معدل الرعاية', completionRate: 'معدل الإنجاز',
      export: 'تصدير', vs: 'مقابل الشهر السابق',
    },
  }[lang] || {
    title: 'Indicateurs', subtitle: 'Vue nationale', overview: 'Vue', byRegion: 'Régions', disorders: 'Troubles', trends: 'Tendances',
    period: 'Période', last3m: '3 mois', last6m: '6 mois', last12m: '12 mois', year: 'Année',
    allRegions: 'Toutes', totalScreened: 'Dépistés', totalReferred: 'Orientés', totalInCare: 'En PEC', coverage: 'Couverture',
    activeStructures: 'Structures', avgDelay: 'Délai moyen', activeProfessionals: 'Professionnels', familiesFollowed: 'Familles',
    evolution: 'Évolution', screened: 'Dépistés', referred: 'Orientés', inCare: 'En PEC',
    regionalPerformance: 'Régions', region: 'Région', structures: 'Structures',
    disorderBreakdown: 'Troubles', byAge: 'Par âge', coverageTrend: 'Couverture', keyMetrics: 'Métriques',
    screeningRate: 'Taux dépistage', referralRate: 'Taux orientation', careRate: 'Taux PEC', completionRate: 'Complétion',
    export: 'Exporter', vs: 'vs précédent',
  };

  const kpis = [
    { label: l.totalScreened, value: '2 570', change: '+12%', trend: 'up' as const, icon: Baby, color: 'text-blue-500' },
    { label: l.totalReferred, value: '357', change: '+8%', trend: 'up' as const, icon: ArrowRightLeft, color: 'text-amber-500' },
    { label: l.totalInCare, value: '268', change: '+18%', trend: 'up' as const, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: l.coverage, value: '56%', change: '+4%', trend: 'up' as const, icon: Target, color: 'text-violet-500' },
    { label: l.activeStructures, value: '30', change: '+2', trend: 'up' as const, icon: Building, color: 'text-teal-500' },
    { label: l.avgDelay, value: '4.2j', change: '-1.3j', trend: 'down' as const, icon: Clock, color: 'text-orange-500' },
    { label: l.activeProfessionals, value: '142', change: '+15', trend: 'up' as const, icon: Users, color: 'text-indigo-500' },
    { label: l.familiesFollowed, value: '1 830', change: '+9%', trend: 'up' as const, icon: Users, color: 'text-rose-500' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{l.title}</h1>
            <p className="text-muted-foreground text-sm">{l.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40"><Calendar className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">{l.last3m}</SelectItem>
                <SelectItem value="6months">{l.last6m}</SelectItem>
                <SelectItem value="12months">{l.last12m}</SelectItem>
                <SelectItem value="year">{l.year}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />{l.export}</Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.slice(0, 8).map(kpi => (
            <Card key={kpi.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-muted ${kpi.color}`}><kpi.icon className="h-4 w-4" /></div>
                  <Badge variant="outline" className={`text-xs ${kpi.trend === 'up' && !kpi.label.includes('Délai') ? 'text-emerald-600 border-emerald-200' : kpi.trend === 'down' && kpi.label.includes('Délai') ? 'text-emerald-600 border-emerald-200' : 'text-red-600 border-red-200'}`}>
                    {kpi.trend === 'up' ? <ChevronUp className="h-3 w-3 mr-0.5" /> : <ChevronDown className="h-3 w-3 mr-0.5" />}
                    {kpi.change}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="overview">{l.overview}</TabsTrigger>
            <TabsTrigger value="regions">{l.byRegion}</TabsTrigger>
            <TabsTrigger value="disorders">{l.disorders}</TabsTrigger>
            <TabsTrigger value="trends">{l.trends}</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{l.evolution}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="screened" name={l.screened} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="referred" name={l.referred} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="inCare" name={l.inCare} fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key rates */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: l.screeningRate, value: 56, target: 80 },
                { label: l.referralRate, value: 14, target: 20 },
                { label: l.careRate, value: 75, target: 90 },
                { label: l.completionRate, value: 68, target: 85 },
              ].map(metric => (
                <Card key={metric.label}>
                  <CardContent className="p-4 text-center">
                    <div className="relative inline-flex items-center justify-center w-20 h-20 mb-2">
                      <svg className="w-20 h-20 -rotate-90">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                        <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
                          strokeDasharray={`${(metric.value / 100) * 213.6} 213.6`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-lg font-bold text-foreground">{metric.value}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">Cible: {metric.target}%</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* By Region */}
          <TabsContent value="regions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{l.regionalPerformance}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regionalData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="region" type="category" className="text-xs" width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="screened" name={l.screened} fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="referred" name={l.referred} fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-3">
              {regionalData.map(r => (
                <Card key={r.region}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted text-primary"><MapPin className="h-5 w-5" /></div>
                      <div>
                        <p className="font-semibold text-foreground">{r.region}</p>
                        <p className="text-xs text-muted-foreground">{r.structures} {l.structures.toLowerCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-foreground">{r.screened}</p>
                        <p className="text-xs text-muted-foreground">{l.screened}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-foreground">{r.referred}</p>
                        <p className="text-xs text-muted-foreground">{l.referred}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${r.coverage}%` }} />
                          </div>
                          <span className="text-xs font-bold text-foreground">{r.coverage}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{l.coverage}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Disorders */}
          <TabsContent value="disorders" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{l.disorderBreakdown}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={disorderData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {disorderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{l.byAge}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ageGroupData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="group" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Disorder detail cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {disorderData.map(d => (
                <Card key={d.name}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.value}% des cas</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trends */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{l.coverageTrend}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={coverageTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" domain={[0, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="coverage" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{l.evolution}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="screened" name={l.screened} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="referred" name={l.referred} stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="inCare" name={l.inCare} stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key metrics summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{l.keyMetrics}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: lang === 'fr' ? 'Ratio dépistage/pop.' : 'Screening/pop. ratio', value: '1:45', trend: '+5%' },
                    { label: lang === 'fr' ? 'Délai moyen PEC' : 'Avg. care delay', value: '12j', trend: '-3j' },
                    { label: lang === 'fr' ? 'Taux d\'abandon' : 'Dropout rate', value: '8%', trend: '-2%' },
                    { label: lang === 'fr' ? 'Satisfaction familles' : 'Family satisfaction', value: '4.2/5', trend: '+0.3' },
                  ].map(m => (
                    <div key={m.label} className="bg-muted/50 rounded-lg p-4 text-center">
                      <p className="text-xl font-bold text-foreground">{m.value}</p>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <Badge variant="outline" className="text-xs mt-1 text-emerald-600 border-emerald-200">{m.trend}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default IndicatorsModule;
