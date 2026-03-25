import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Lang } from '@/i18n/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar, ArrowUpRight, ArrowDownRight, Activity, Users, Eye, Brain, Download } from 'lucide-react';

const tt = (map: Record<Lang, string>, lang: Lang) => map[lang] || map.fr;

// ── Mock data ──────────────────────────────────────────────
const monthlyEvolution = [
  { month: 'Jan', screenings: 320, referrals: 85, carePlans: 62, coverage: 45 },
  { month: 'Fév', screenings: 380, referrals: 102, carePlans: 78, coverage: 48 },
  { month: 'Mar', screenings: 450, referrals: 118, carePlans: 91, coverage: 52 },
  { month: 'Avr', screenings: 410, referrals: 95, carePlans: 84, coverage: 54 },
  { month: 'Mai', screenings: 520, referrals: 140, carePlans: 105, coverage: 58 },
  { month: 'Jun', screenings: 490, referrals: 128, carePlans: 98, coverage: 61 },
  { month: 'Jul', screenings: 540, referrals: 152, carePlans: 118, coverage: 63 },
  { month: 'Aoû', screenings: 460, referrals: 115, carePlans: 92, coverage: 65 },
  { month: 'Sep', screenings: 580, referrals: 165, carePlans: 130, coverage: 68 },
  { month: 'Oct', screenings: 620, referrals: 178, carePlans: 142, coverage: 71 },
  { month: 'Nov', screenings: 670, referrals: 190, carePlans: 155, coverage: 74 },
  { month: 'Déc', screenings: 710, referrals: 205, carePlans: 168, coverage: 76 },
];

const disorderTrends = [
  { month: 'Jan', autism: 28, adhd: 22, language: 18, motor: 12, learning: 8 },
  { month: 'Fév', autism: 32, adhd: 25, language: 20, motor: 14, learning: 10 },
  { month: 'Mar', autism: 35, adhd: 28, language: 24, motor: 15, learning: 12 },
  { month: 'Avr', autism: 30, adhd: 24, language: 22, motor: 13, learning: 11 },
  { month: 'Mai', autism: 42, adhd: 32, language: 28, motor: 18, learning: 15 },
  { month: 'Jun', autism: 38, adhd: 30, language: 26, motor: 16, learning: 14 },
  { month: 'Jul', autism: 45, adhd: 35, language: 30, motor: 20, learning: 16 },
  { month: 'Aoû', autism: 40, adhd: 28, language: 25, motor: 17, learning: 13 },
  { month: 'Sep', autism: 50, adhd: 38, language: 32, motor: 22, learning: 18 },
  { month: 'Oct', autism: 55, adhd: 42, language: 35, motor: 24, learning: 20 },
  { month: 'Nov', autism: 58, adhd: 45, language: 38, motor: 26, learning: 22 },
  { month: 'Déc', autism: 62, adhd: 48, language: 40, motor: 28, learning: 24 },
];

const regionalTrends = [
  { month: 'Jan', abidjan: 180, yamoussoukro: 45, bouake: 38, daloa: 28, sanPedro: 22 },
  { month: 'Fév', abidjan: 210, yamoussoukro: 52, bouake: 42, daloa: 32, sanPedro: 26 },
  { month: 'Mar', abidjan: 245, yamoussoukro: 58, bouake: 48, daloa: 38, sanPedro: 30 },
  { month: 'Avr', abidjan: 225, yamoussoukro: 55, bouake: 45, daloa: 35, sanPedro: 28 },
  { month: 'Mai', abidjan: 280, yamoussoukro: 68, bouake: 56, daloa: 45, sanPedro: 35 },
  { month: 'Jun', abidjan: 265, yamoussoukro: 62, bouake: 52, daloa: 42, sanPedro: 32 },
  { month: 'Jul', abidjan: 295, yamoussoukro: 72, bouake: 58, daloa: 48, sanPedro: 38 },
  { month: 'Aoû', abidjan: 250, yamoussoukro: 60, bouake: 50, daloa: 40, sanPedro: 30 },
  { month: 'Sep', abidjan: 320, yamoussoukro: 78, bouake: 65, daloa: 52, sanPedro: 42 },
  { month: 'Oct', abidjan: 345, yamoussoukro: 85, bouake: 70, daloa: 58, sanPedro: 45 },
  { month: 'Nov', abidjan: 370, yamoussoukro: 90, bouake: 75, daloa: 62, sanPedro: 48 },
  { month: 'Déc', abidjan: 395, yamoussoukro: 95, bouake: 80, daloa: 68, sanPedro: 52 },
];

const ageGroupTrends = [
  { month: 'T1', '0-2': 120, '3-5': 180, '6-8': 95, '9-12': 55 },
  { month: 'T2', '0-2': 145, '3-5': 210, '6-8': 115, '9-12': 65 },
  { month: 'T3', '0-2': 170, '3-5': 245, '6-8': 135, '9-12': 78 },
  { month: 'T4', '0-2': 195, '3-5': 280, '6-8': 155, '9-12': 88 },
];

const performanceRadar = [
  { metric: 'Dépistage', current: 76, previous: 62 },
  { metric: 'Orientation', current: 68, previous: 55 },
  { metric: 'Prise en charge', current: 72, previous: 58 },
  { metric: 'Suivi', current: 65, previous: 50 },
  { metric: 'Couverture', current: 74, previous: 60 },
  { metric: 'Formation', current: 82, previous: 70 },
];

const predictiveData = [
  { month: 'Jan 27', predicted: 750, lower: 700, upper: 800 },
  { month: 'Fév 27', predicted: 790, lower: 730, upper: 850 },
  { month: 'Mar 27', predicted: 840, lower: 770, upper: 910 },
  { month: 'Avr 27', predicted: 820, lower: 750, upper: 890 },
  { month: 'Mai 27', predicted: 880, lower: 800, upper: 960 },
  { month: 'Jun 27', predicted: 920, lower: 840, upper: 1000 },
];

interface KPI {
  label: Record<Lang, string>;
  value: string;
  change: number;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'stable';
}

const kpis: KPI[] = [
  { label: { fr: 'Dépistages totaux', en: 'Total screenings', pt: 'Triagens totais', ar: 'إجمالي الفحوصات' }, value: '6,150', change: 18.4, icon: Activity, trend: 'up' },
  { label: { fr: 'Taux de couverture', en: 'Coverage rate', pt: 'Taxa de cobertura', ar: 'معدل التغطية' }, value: '76%', change: 12.2, icon: Eye, trend: 'up' },
  { label: { fr: 'Enfants orientés', en: 'Referred children', pt: 'Crianças encaminhadas', ar: 'الأطفال المحالون' }, value: '1,673', change: 8.7, icon: Users, trend: 'up' },
  { label: { fr: 'Détection précoce', en: 'Early detection', pt: 'Detecção precoce', ar: 'الكشف المبكر' }, value: '68%', change: -2.1, icon: Brain, trend: 'down' },
];

const TrendsModule: React.FC = () => {
  const { lang } = useLanguage();
  const [period, setPeriod] = useState('12m');
  const [activeTab, setActiveTab] = useState('overview');

  const labels = {
    title: { fr: 'Tendances & Analyses', en: 'Trends & Analytics', pt: 'Tendências & Análises', ar: 'الاتجاهات والتحليلات' },
    overview: { fr: 'Vue d\'ensemble', en: 'Overview', pt: 'Visão geral', ar: 'نظرة عامة' },
    disorders: { fr: 'Troubles', en: 'Disorders', pt: 'Transtornos', ar: 'الاضطرابات' },
    regions: { fr: 'Régions', en: 'Regions', pt: 'Regiões', ar: 'المناطق' },
    predictions: { fr: 'Projections', en: 'Projections', pt: 'Projeções', ar: 'التوقعات' },
    monthlyEvolution: { fr: 'Évolution mensuelle', en: 'Monthly evolution', pt: 'Evolução mensal', ar: 'التطور الشهري' },
    screenings: { fr: 'Dépistages', en: 'Screenings', pt: 'Triagens', ar: 'الفحوصات' },
    referrals: { fr: 'Orientations', en: 'Referrals', pt: 'Encaminhamentos', ar: 'الإحالات' },
    carePlans: { fr: 'Prises en charge', en: 'Care plans', pt: 'Planos de cuidado', ar: 'خطط الرعاية' },
    coverage: { fr: 'Couverture (%)', en: 'Coverage (%)', pt: 'Cobertura (%)', ar: 'التغطية (%)' },
    disorderEvolution: { fr: 'Évolution par trouble', en: 'Evolution by disorder', pt: 'Evolução por transtorno', ar: 'التطور حسب الاضطراب' },
    autism: { fr: 'Autisme', en: 'Autism', pt: 'Autismo', ar: 'التوحد' },
    adhd: { fr: 'TDAH', en: 'ADHD', pt: 'TDAH', ar: 'فرط الحركة' },
    language: { fr: 'Langage', en: 'Language', pt: 'Linguagem', ar: 'اللغة' },
    motor: { fr: 'Motricité', en: 'Motor', pt: 'Motricidade', ar: 'الحركة' },
    learning: { fr: 'Apprentissage', en: 'Learning', pt: 'Aprendizagem', ar: 'التعلم' },
    regionalActivity: { fr: 'Activité par région', en: 'Activity by region', pt: 'Atividade por região', ar: 'النشاط حسب المنطقة' },
    ageGroups: { fr: 'Tranches d\'âge (trimestres)', en: 'Age groups (quarters)', pt: 'Faixas etárias (trimestres)', ar: 'الفئات العمرية (أرباع)' },
    performance: { fr: 'Performance comparée', en: 'Compared performance', pt: 'Performance comparada', ar: 'الأداء المقارن' },
    currentPeriod: { fr: 'Période actuelle', en: 'Current period', pt: 'Período atual', ar: 'الفترة الحالية' },
    previousPeriod: { fr: 'Période précédente', en: 'Previous period', pt: 'Período anterior', ar: 'الفترة السابقة' },
    predictedScreenings: { fr: 'Dépistages projetés', en: 'Projected screenings', pt: 'Triagens projetadas', ar: 'الفحوصات المتوقعة' },
    confidenceInterval: { fr: 'Intervalle de confiance', en: 'Confidence interval', pt: 'Intervalo de confiança', ar: 'فاصل الثقة' },
    vsLastYear: { fr: 'vs année précédente', en: 'vs last year', pt: 'vs ano anterior', ar: 'مقارنة بالعام الماضي' },
    export: { fr: 'Exporter', en: 'Export', pt: 'Exportar', ar: 'تصدير' },
  };

  const TrendIcon = ({ change }: { change: number }) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
    if (change < 0) return <ArrowDownRight className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const chartColors = {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    muted: 'hsl(var(--muted-foreground))',
    border: 'hsl(var(--border))',
    autism: '#3b82f6',
    adhd: '#f59e0b',
    language: '#10b981',
    motor: '#8b5cf6',
    learning: '#ef4444',
    abidjan: '#3b82f6',
    yamoussoukro: '#10b981',
    bouake: '#f59e0b',
    daloa: '#8b5cf6',
    sanPedro: '#ec4899',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{tt(labels.title, lang)}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {tt({ fr: 'Analyse longitudinale et projections nationales', en: 'Longitudinal analysis and national projections', pt: 'Análise longitudinal e projeções nacionais', ar: 'التحليل الطولي والتوقعات الوطنية' }, lang)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">{tt({ fr: '3 mois', en: '3 months', pt: '3 meses', ar: '3 أشهر' }, lang)}</SelectItem>
                <SelectItem value="6m">{tt({ fr: '6 mois', en: '6 months', pt: '6 meses', ar: '6 أشهر' }, lang)}</SelectItem>
                <SelectItem value="12m">{tt({ fr: '12 mois', en: '12 months', pt: '12 meses', ar: '12 أشهر' }, lang)}</SelectItem>
                <SelectItem value="24m">{tt({ fr: '24 mois', en: '24 months', pt: '24 meses', ar: '24 شهراً' }, lang)}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" />{tt(labels.export, lang)}
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <Card key={i}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${kpi.change > 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                      <TrendIcon change={kpi.change} />
                      {Math.abs(kpi.change)}%
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{tt(kpi.label, lang)}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview" className="gap-1.5"><TrendingUp className="h-4 w-4" />{tt(labels.overview, lang)}</TabsTrigger>
            <TabsTrigger value="disorders" className="gap-1.5"><Brain className="h-4 w-4" />{tt(labels.disorders, lang)}</TabsTrigger>
            <TabsTrigger value="regions" className="gap-1.5"><Users className="h-4 w-4" />{tt(labels.regions, lang)}</TabsTrigger>
            <TabsTrigger value="predictions" className="gap-1.5"><Activity className="h-4 w-4" />{tt(labels.predictions, lang)}</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{tt(labels.monthlyEvolution, lang)}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={monthlyEvolution}>
                    <defs>
                      <linearGradient id="gradScreenings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="screenings" name={tt(labels.screenings, lang)} stroke={chartColors.primary} fill="url(#gradScreenings)" strokeWidth={2} />
                    <Area type="monotone" dataKey="referrals" name={tt(labels.referrals, lang)} stroke={chartColors.adhd} fill={chartColors.adhd} fillOpacity={0.1} strokeWidth={2} />
                    <Area type="monotone" dataKey="carePlans" name={tt(labels.carePlans, lang)} stroke={chartColors.language} fill={chartColors.language} fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coverage trend */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{tt(labels.coverage, lang)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyEvolution}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} domain={[40, 80]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="coverage" name={tt(labels.coverage, lang)} stroke={chartColors.primary} strokeWidth={3} dot={{ r: 4, fill: chartColors.primary }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Performance radar */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{tt(labels.performance, lang)}</CardTitle>
                    <div className="flex gap-3 text-xs">
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary inline-block" />{tt(labels.currentPeriod, lang)}</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-muted-foreground inline-block" />{tt(labels.previousPeriod, lang)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={performanceRadar}>
                      <PolarGrid stroke={chartColors.border} />
                      <PolarAngleAxis dataKey="metric" fontSize={11} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} />
                      <Radar name={tt(labels.currentPeriod, lang)} dataKey="current" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.2} strokeWidth={2} />
                      <Radar name={tt(labels.previousPeriod, lang)} dataKey="previous" stroke={chartColors.muted} fill={chartColors.muted} fillOpacity={0.1} strokeWidth={1} strokeDasharray="4 4" />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DISORDERS */}
          <TabsContent value="disorders" className="space-y-6 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{tt(labels.disorderEvolution, lang)}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={disorderTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="autism" name={tt(labels.autism, lang)} stroke={chartColors.autism} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="adhd" name={tt(labels.adhd, lang)} stroke={chartColors.adhd} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="language" name={tt(labels.language, lang)} stroke={chartColors.language} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="motor" name={tt(labels.motor, lang)} stroke={chartColors.motor} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="learning" name={tt(labels.learning, lang)} stroke={chartColors.learning} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{tt(labels.ageGroups, lang)}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={ageGroupTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="0-2" name="0-2 ans" fill={chartColors.autism} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="3-5" name="3-5 ans" fill={chartColors.language} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="6-8" name="6-8 ans" fill={chartColors.adhd} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="9-12" name="9-12 ans" fill={chartColors.motor} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REGIONS */}
          <TabsContent value="regions" className="space-y-6 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{tt(labels.regionalActivity, lang)}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={regionalTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="abidjan" name="Abidjan" stroke={chartColors.abidjan} fill={chartColors.abidjan} fillOpacity={0.15} stackId="1" strokeWidth={2} />
                    <Area type="monotone" dataKey="yamoussoukro" name="Yamoussoukro" stroke={chartColors.yamoussoukro} fill={chartColors.yamoussoukro} fillOpacity={0.15} stackId="1" strokeWidth={2} />
                    <Area type="monotone" dataKey="bouake" name="Bouaké" stroke={chartColors.bouake} fill={chartColors.bouake} fillOpacity={0.15} stackId="1" strokeWidth={2} />
                    <Area type="monotone" dataKey="daloa" name="Daloa" stroke={chartColors.daloa} fill={chartColors.daloa} fillOpacity={0.15} stackId="1" strokeWidth={2} />
                    <Area type="monotone" dataKey="sanPedro" name="San-Pédro" stroke={chartColors.sanPedro} fill={chartColors.sanPedro} fillOpacity={0.15} stackId="1" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Regional summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { name: 'Abidjan', value: 395, change: 14.2, color: chartColors.abidjan },
                { name: 'Yamoussoukro', value: 95, change: 11.8, color: chartColors.yamoussoukro },
                { name: 'Bouaké', value: 80, change: 9.5, color: chartColors.bouake },
                { name: 'Daloa', value: 68, change: 15.1, color: chartColors.daloa },
                { name: 'San-Pédro', value: 52, change: 8.3, color: chartColors.sanPedro },
              ].map((r, i) => (
                <Card key={i}>
                  <CardContent className="pt-4 pb-3 text-center">
                    <div className="h-2 w-8 rounded-full mx-auto mb-2" style={{ backgroundColor: r.color }} />
                    <div className="font-semibold text-sm">{r.name}</div>
                    <div className="text-xl font-bold text-foreground mt-1">{r.value}</div>
                    <div className="text-xs text-emerald-600 flex items-center justify-center gap-0.5 mt-1">
                      <TrendingUp className="h-3 w-3" />+{r.change}%
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* PREDICTIONS */}
          <TabsContent value="predictions" className="space-y-6 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{tt(labels.predictedScreenings, lang)}</CardTitle>
                  <Badge variant="secondary" className="gap-1">
                    <Activity className="h-3 w-3" />
                    {tt({ fr: 'Modèle prédictif', en: 'Predictive model', pt: 'Modelo preditivo', ar: 'نموذج تنبؤي' }, lang)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={predictiveData}>
                    <defs>
                      <linearGradient id="gradConfidence" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="upper" name={tt(labels.confidenceInterval, lang)} stroke="none" fill="url(#gradConfidence)" />
                    <Area type="monotone" dataKey="lower" name="" stroke="none" fill="white" />
                    <Line type="monotone" dataKey="predicted" name={tt(labels.predictedScreenings, lang)} stroke={chartColors.primary} strokeWidth={3} strokeDasharray="8 4" dot={{ r: 5, fill: chartColors.primary }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Projection cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: { fr: 'Projection S1 2027', en: 'H1 2027 projection', pt: 'Projeção S1 2027', ar: 'توقعات النصف الأول 2027' }, value: '5,000', sub: { fr: '+15% vs S1 2026', en: '+15% vs H1 2026', pt: '+15% vs S1 2026', ar: '+15% مقارنة بالنصف الأول 2026' } },
                { label: { fr: 'Couverture projetée', en: 'Projected coverage', pt: 'Cobertura projetada', ar: 'التغطية المتوقعة' }, value: '82%', sub: { fr: 'Objectif national : 85%', en: 'National target: 85%', pt: 'Meta nacional: 85%', ar: 'الهدف الوطني: 85%' } },
                { label: { fr: 'Capacité nécessaire', en: 'Required capacity', pt: 'Capacidade necessária', ar: 'السعة المطلوبة' }, value: '+12', sub: { fr: 'Structures supplémentaires', en: 'Additional structures', pt: 'Estruturas adicionais', ar: 'هياكل إضافية' } },
              ].map((card, i) => (
                <Card key={i}>
                  <CardContent className="pt-5 pb-4">
                    <div className="text-sm text-muted-foreground mb-1">{tt(card.label, lang)}</div>
                    <div className="text-3xl font-bold text-foreground">{card.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{tt(card.sub, lang)}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TrendsModule;
