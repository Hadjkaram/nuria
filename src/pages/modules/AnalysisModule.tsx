import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Lang } from '@/i18n/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import {
  Activity, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  MapPin, Building, Users, Calendar, Download, Filter, Award, Target,
  BarChart3, GitCompare, Layers, ChevronRight,
} from 'lucide-react';

const tt = (map: Record<Lang, string>, lang: Lang) => map[lang] || map.fr;

// ── Regional comparison data ──
const regionData = [
  { region: 'Abidjan', screenings: 4250, coverage: 78, referralRate: 32, carePlanRate: 68, avgDelay: 12, structures: 45, professionals: 128 },
  { region: 'Yamoussoukro', screenings: 1850, coverage: 65, referralRate: 28, carePlanRate: 62, avgDelay: 18, structures: 18, professionals: 42 },
  { region: 'Bouaké', screenings: 1620, coverage: 58, referralRate: 26, carePlanRate: 55, avgDelay: 22, structures: 15, professionals: 35 },
  { region: 'Daloa', screenings: 1280, coverage: 52, referralRate: 30, carePlanRate: 48, avgDelay: 25, structures: 12, professionals: 28 },
  { region: 'San-Pédro', screenings: 980, coverage: 45, referralRate: 24, carePlanRate: 42, avgDelay: 28, structures: 10, professionals: 22 },
  { region: 'Korhogo', screenings: 870, coverage: 42, referralRate: 22, carePlanRate: 38, avgDelay: 30, structures: 8, professionals: 18 },
  { region: 'Man', screenings: 720, coverage: 38, referralRate: 20, carePlanRate: 35, avgDelay: 32, structures: 7, professionals: 15 },
  { region: 'Abengourou', screenings: 650, coverage: 35, referralRate: 18, carePlanRate: 32, avgDelay: 35, structures: 6, professionals: 12 },
];

const performanceRadar = [
  { metric: 'Couverture', Abidjan: 78, Yamoussoukro: 65, Bouaké: 58, Daloa: 52, National: 62 },
  { metric: 'Dépistage', Abidjan: 85, Yamoussoukro: 68, Bouaké: 60, Daloa: 55, National: 65 },
  { metric: 'Orientation', Abidjan: 72, Yamoussoukro: 62, Bouaké: 55, Daloa: 48, National: 58 },
  { metric: 'Prise en charge', Abidjan: 68, Yamoussoukro: 62, Bouaké: 55, Daloa: 48, National: 55 },
  { metric: 'Délai moyen', Abidjan: 88, Yamoussoukro: 72, Bouaké: 62, Daloa: 55, National: 68 },
  { metric: 'Ressources', Abidjan: 82, Yamoussoukro: 65, Bouaké: 58, Daloa: 50, National: 60 },
];

const quarterlyComparison = [
  { quarter: 'T1 2025', abidjan: 820, yamoussoukro: 340, bouake: 290, daloa: 220, sanPedro: 170 },
  { quarter: 'T2 2025', abidjan: 920, yamoussoukro: 385, bouake: 330, daloa: 260, sanPedro: 195 },
  { quarter: 'T3 2025', abidjan: 1050, yamoussoukro: 430, bouake: 380, daloa: 300, sanPedro: 230 },
  { quarter: 'T4 2025', abidjan: 1100, yamoussoukro: 470, bouake: 410, daloa: 330, sanPedro: 250 },
  { quarter: 'T1 2026', abidjan: 1180, yamoussoukro: 520, bouake: 450, daloa: 370, sanPedro: 285 },
];

const structureTypeComparison = [
  { type: { fr: 'Hôpitaux', en: 'Hospitals', pt: 'Hospitais', ar: 'المستشفيات' }, count: 28, screenings: 3200, coverage: 72, efficiency: 85 },
  { type: { fr: 'Centres de santé', en: 'Health centers', pt: 'Centros de saúde', ar: 'المراكز الصحية' }, count: 45, screenings: 4800, coverage: 65, efficiency: 78 },
  { type: { fr: 'CAMSP', en: 'CAMSP', pt: 'CAMSP', ar: 'CAMSP' }, count: 12, screenings: 1500, coverage: 82, efficiency: 90 },
  { type: { fr: 'ONG', en: 'NGOs', pt: 'ONGs', ar: 'المنظمات' }, count: 18, screenings: 2100, coverage: 58, efficiency: 72 },
  { type: { fr: 'Écoles', en: 'Schools', pt: 'Escolas', ar: 'المدارس' }, count: 35, screenings: 1800, coverage: 48, efficiency: 65 },
];

const gapAnalysis = [
  { indicator: { fr: 'Couverture nationale', en: 'National coverage', pt: 'Cobertura nacional', ar: 'التغطية الوطنية' }, current: 62, target: 85, gap: 23 },
  { indicator: { fr: 'Détection précoce', en: 'Early detection', pt: 'Detecção precoce', ar: 'الكشف المبكر' }, current: 68, target: 90, gap: 22 },
  { indicator: { fr: 'Délai orientation (j)', en: 'Referral delay (d)', pt: 'Prazo encaminhamento (d)', ar: 'تأخير الإحالة (يوم)' }, current: 22, target: 10, gap: -12 },
  { indicator: { fr: 'Taux de suivi', en: 'Follow-up rate', pt: 'Taxa de acompanhamento', ar: 'معدل المتابعة' }, current: 55, target: 80, gap: 25 },
  { indicator: { fr: 'Prof. formés', en: 'Trained prof.', pt: 'Prof. formados', ar: 'المهنيون المدربون' }, current: 72, target: 95, gap: 23 },
  { indicator: { fr: 'Structures actives', en: 'Active structures', pt: 'Estruturas ativas', ar: 'الهياكل النشطة' }, current: 78, target: 100, gap: 22 },
];

const colors = {
  abidjan: '#3b82f6', yamoussoukro: '#10b981', bouake: '#f59e0b',
  daloa: '#8b5cf6', sanPedro: '#ec4899', national: '#64748b',
};

const AnalysisModule: React.FC = () => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('regional');
  const [compareMetric, setCompareMetric] = useState('coverage');
  const [selectedRegions, setSelectedRegions] = useState(['Abidjan', 'Yamoussoukro', 'Bouaké', 'Daloa']);

  const labels = {
    title: { fr: 'Analyse comparative', en: 'Comparative Analysis', pt: 'Análise comparativa', ar: 'التحليل المقارن' },
    subtitle: { fr: 'Comparaison inter-régionale et analyse des écarts', en: 'Inter-regional comparison and gap analysis', pt: 'Comparação inter-regional e análise de lacunas', ar: 'المقارنة بين المناطق وتحليل الفجوات' },
    regional: { fr: 'Par région', en: 'By region', pt: 'Por região', ar: 'حسب المنطقة' },
    structures: { fr: 'Par structure', en: 'By structure', pt: 'Por estrutura', ar: 'حسب الهيكل' },
    gaps: { fr: 'Écarts', en: 'Gaps', pt: 'Lacunas', ar: 'الفجوات' },
    evolution: { fr: 'Évolution', en: 'Evolution', pt: 'Evolução', ar: 'التطور' },
    coverage: { fr: 'Couverture', en: 'Coverage', pt: 'Cobertura', ar: 'التغطية' },
    screenings: { fr: 'Dépistages', en: 'Screenings', pt: 'Triagens', ar: 'الفحوصات' },
    referralRate: { fr: 'Taux orientation', en: 'Referral rate', pt: 'Taxa encaminhamento', ar: 'معدل الإحالة' },
    carePlanRate: { fr: 'Prise en charge', en: 'Care plan rate', pt: 'Taxa de cuidado', ar: 'معدل الرعاية' },
    avgDelay: { fr: 'Délai moyen (j)', en: 'Avg delay (d)', pt: 'Prazo médio (d)', ar: 'متوسط التأخير (يوم)' },
    ranking: { fr: 'Classement régional', en: 'Regional ranking', pt: 'Classificação regional', ar: 'الترتيب الإقليمي' },
    radarTitle: { fr: 'Profil de performance', en: 'Performance profile', pt: 'Perfil de desempenho', ar: 'ملف الأداء' },
    quarterlyTitle: { fr: 'Évolution trimestrielle', en: 'Quarterly evolution', pt: 'Evolução trimestral', ar: 'التطور الفصلي' },
    structureComparison: { fr: 'Comparaison par type de structure', en: 'Comparison by structure type', pt: 'Comparação por tipo de estrutura', ar: 'مقارنة حسب نوع الهيكل' },
    gapAnalysis: { fr: 'Analyse des écarts', en: 'Gap analysis', pt: 'Análise de lacunas', ar: 'تحليل الفجوات' },
    current: { fr: 'Actuel', en: 'Current', pt: 'Atual', ar: 'الحالي' },
    target: { fr: 'Objectif', en: 'Target', pt: 'Meta', ar: 'الهدف' },
    gap: { fr: 'Écart', en: 'Gap', pt: 'Lacuna', ar: 'الفجوة' },
    export: { fr: 'Exporter', en: 'Export', pt: 'Exportar', ar: 'تصدير' },
    metric: { fr: 'Métrique', en: 'Metric', pt: 'Métrica', ar: 'المقياس' },
    efficiency: { fr: 'Efficacité', en: 'Efficiency', pt: 'Eficiência', ar: 'الكفاءة' },
    count: { fr: 'Nombre', en: 'Count', pt: 'Quantidade', ar: 'العدد' },
    recommendations: { fr: 'Recommandations prioritaires', en: 'Priority recommendations', pt: 'Recomendações prioritárias', ar: 'التوصيات ذات الأولوية' },
  };

  const metricOptions = [
    { value: 'coverage', label: labels.coverage },
    { value: 'screenings', label: labels.screenings },
    { value: 'referralRate', label: labels.referralRate },
    { value: 'carePlanRate', label: labels.carePlanRate },
    { value: 'avgDelay', label: labels.avgDelay },
  ];

  const sortedRegions = [...regionData].sort((a, b) => {
    const val = compareMetric as keyof typeof a;
    if (compareMetric === 'avgDelay') return (a[val] as number) - (b[val] as number);
    return (b[val] as number) - (a[val] as number);
  });

  const getBarColor = (value: number, metric: string) => {
    if (metric === 'avgDelay') {
      if (value <= 15) return '#10b981';
      if (value <= 25) return '#f59e0b';
      return '#ef4444';
    }
    if (value >= 70) return '#10b981';
    if (value >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const recommendations = [
    { priority: 'high', text: { fr: 'Renforcer les structures dans les régions Man et Abengourou (couverture < 40%)', en: 'Strengthen structures in Man and Abengourou regions (coverage < 40%)', pt: 'Reforçar estruturas nas regiões de Man e Abengourou (cobertura < 40%)', ar: 'تعزيز الهياكل في منطقتي مان وأبنغورو (التغطية < 40%)' } },
    { priority: 'high', text: { fr: 'Réduire le délai d\'orientation moyen de 22 à 10 jours (objectif national)', en: 'Reduce average referral delay from 22 to 10 days (national target)', pt: 'Reduzir o prazo médio de encaminhamento de 22 para 10 dias (meta nacional)', ar: 'تقليل متوسط تأخير الإحالة من 22 إلى 10 أيام (الهدف الوطني)' } },
    { priority: 'medium', text: { fr: 'Former 23% de professionnels supplémentaires pour atteindre l\'objectif de 95%', en: 'Train 23% more professionals to reach the 95% target', pt: 'Formar 23% mais profissionais para atingir a meta de 95%', ar: 'تدريب 23% إضافية من المهنيين للوصول إلى هدف 95%' } },
    { priority: 'medium', text: { fr: 'Améliorer le taux de suivi post-orientation (55% → 80%)', en: 'Improve post-referral follow-up rate (55% → 80%)', pt: 'Melhorar a taxa de acompanhamento pós-encaminhamento (55% → 80%)', ar: 'تحسين معدل المتابعة بعد الإحالة (55% → 80%)' } },
    { priority: 'low', text: { fr: 'Étendre le modèle CAMSP (efficacité 90%) aux autres régions', en: 'Extend CAMSP model (90% efficiency) to other regions', pt: 'Expandir o modelo CAMSP (eficiência 90%) para outras regiões', ar: 'توسيع نموذج CAMSP (كفاءة 90%) إلى مناطق أخرى' } },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{tt(labels.title, lang)}</h1>
            <p className="text-sm text-muted-foreground mt-1">{tt(labels.subtitle, lang)}</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />{tt(labels.export, lang)}
          </Button>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: { fr: 'Régions analysées', en: 'Regions analyzed', pt: 'Regiões analisadas', ar: 'المناطق المحللة' }, value: '8', icon: MapPin, sub: { fr: 'sur 14 districts', en: 'of 14 districts', pt: 'de 14 distritos', ar: 'من 14 منطقة' } },
            { label: { fr: 'Écart max couverture', en: 'Max coverage gap', pt: 'Lacuna máx. cobertura', ar: 'أقصى فجوة تغطية' }, value: '43%', icon: Target, sub: { fr: 'Abidjan vs Man', en: 'Abidjan vs Man', pt: 'Abidjan vs Man', ar: 'أبيدجان مقابل مان' } },
            { label: { fr: 'Structures comparées', en: 'Structures compared', pt: 'Estruturas comparadas', ar: 'الهياكل المقارنة' }, value: '138', icon: Building, sub: { fr: '5 types', en: '5 types', pt: '5 tipos', ar: '5 أنواع' } },
            { label: { fr: 'Indicateurs évalués', en: 'Indicators evaluated', pt: 'Indicadores avaliados', ar: 'المؤشرات المقيّمة' }, value: '6', icon: BarChart3, sub: { fr: '4 critiques', en: '4 critical', pt: '4 críticos', ar: '4 حرجة' } },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <Card key={i}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground">{kpi.value}</div>
                      <div className="text-xs text-muted-foreground">{tt(kpi.label, lang)}</div>
                      <div className="text-[10px] text-muted-foreground/70">{tt(kpi.sub, lang)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="regional" className="gap-1.5"><MapPin className="h-4 w-4" />{tt(labels.regional, lang)}</TabsTrigger>
            <TabsTrigger value="structures" className="gap-1.5"><Building className="h-4 w-4" />{tt(labels.structures, lang)}</TabsTrigger>
            <TabsTrigger value="gaps" className="gap-1.5"><Target className="h-4 w-4" />{tt(labels.gaps, lang)}</TabsTrigger>
            <TabsTrigger value="evolution" className="gap-1.5"><TrendingUp className="h-4 w-4" />{tt(labels.evolution, lang)}</TabsTrigger>
          </TabsList>

          {/* REGIONAL */}
          <TabsContent value="regional" className="space-y-6 mt-4">
            {/* Metric selector + ranking */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-medium text-muted-foreground">{tt(labels.metric, lang)} :</span>
              <Select value={compareMetric} onValueChange={setCompareMetric}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {metricOptions.map(m => <SelectItem key={m.value} value={m.value}>{tt(m.label, lang)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{tt(labels.ranking, lang)} — {tt(metricOptions.find(m => m.value === compareMetric)?.label || labels.coverage, lang)}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={sortedRegions} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" fontSize={12} />
                    <YAxis dataKey="region" type="category" fontSize={12} width={100} />
                    <Tooltip />
                    <Bar dataKey={compareMetric} radius={[0, 4, 4, 0]}>
                      {sortedRegions.map((entry, i) => (
                        <Cell key={i} fill={getBarColor(entry[compareMetric as keyof typeof entry] as number, compareMetric)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Radar */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{tt(labels.radarTitle, lang)}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={performanceRadar}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" fontSize={11} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} />
                    <Radar name="Abidjan" dataKey="Abidjan" stroke={colors.abidjan} fill={colors.abidjan} fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="Yamoussoukro" dataKey="Yamoussoukro" stroke={colors.yamoussoukro} fill={colors.yamoussoukro} fillOpacity={0.1} strokeWidth={2} />
                    <Radar name="Bouaké" dataKey="Bouaké" stroke={colors.bouake} fill={colors.bouake} fillOpacity={0.1} strokeWidth={2} />
                    <Radar name="National" dataKey="National" stroke={colors.national} fill="none" strokeWidth={2} strokeDasharray="6 3" />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Region detail cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedRegions.slice(0, 4).map((r, i) => (
                <Card key={i}>
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full`} style={{ backgroundColor: Object.values(colors)[i] }} />
                        <span className="font-semibold text-sm">{r.region}</span>
                      </div>
                      <Badge variant={r.coverage >= 60 ? 'default' : r.coverage >= 45 ? 'secondary' : 'destructive'}>
                        {r.coverage}% {tt(labels.coverage, lang)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">{tt(labels.screenings, lang)}</span><span className="font-medium">{r.screenings.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{tt(labels.referralRate, lang)}</span><span className="font-medium">{r.referralRate}%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{tt(labels.carePlanRate, lang)}</span><span className="font-medium">{r.carePlanRate}%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{tt(labels.avgDelay, lang)}</span><span className="font-medium">{r.avgDelay}j</span></div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{tt(labels.coverage, lang)}</span><span>{r.coverage}%</span>
                      </div>
                      <Progress value={r.coverage} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* STRUCTURES */}
          <TabsContent value="structures" className="space-y-6 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{tt(labels.structureComparison, lang)}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={structureTypeComparison.map(s => ({ ...s, name: tt(s.type, lang) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="coverage" name={tt(labels.coverage, lang)} fill={colors.abidjan} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="efficiency" name={tt(labels.efficiency, lang)} fill={colors.yamoussoukro} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {structureTypeComparison.map((s, i) => (
                <Card key={i}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{tt(s.type, lang)}</div>
                          <div className="text-xs text-muted-foreground">{s.count} {tt({ fr: 'structures', en: 'structures', pt: 'estruturas', ar: 'هياكل' }, lang)} • {s.screenings.toLocaleString()} {tt(labels.screenings, lang)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{s.coverage}%</div>
                          <div className="text-[10px] text-muted-foreground">{tt(labels.coverage, lang)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{s.efficiency}%</div>
                          <div className="text-[10px] text-muted-foreground">{tt(labels.efficiency, lang)}</div>
                        </div>
                        <div className="w-24">
                          <Progress value={s.efficiency} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* GAPS */}
          <TabsContent value="gaps" className="space-y-6 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{tt(labels.gapAnalysis, lang)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {gapAnalysis.map((g, i) => {
                  const isDelay = g.indicator.fr.includes('Délai');
                  const progressCurrent = isDelay ? Math.max(0, 100 - (g.current / 40 * 100)) : g.current;
                  const progressTarget = isDelay ? Math.max(0, 100 - (g.target / 40 * 100)) : g.target;

                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{tt(g.indicator, lang)}</span>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-muted-foreground">{tt(labels.current, lang)}: <span className="font-semibold text-foreground">{g.current}{isDelay ? 'j' : '%'}</span></span>
                          <span className="text-muted-foreground">{tt(labels.target, lang)}: <span className="font-semibold text-foreground">{g.target}{isDelay ? 'j' : '%'}</span></span>
                          <Badge variant={Math.abs(g.gap) <= 15 ? 'secondary' : 'destructive'} className="gap-0.5">
                            {g.gap > 0 ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                            {isDelay ? `+${Math.abs(g.gap)}j` : `-${Math.abs(g.gap)}%`}
                          </Badge>
                        </div>
                      </div>
                      <div className="relative">
                        <Progress value={progressCurrent} className="h-3" />
                        <div className="absolute top-0 h-3 border-r-2 border-dashed border-foreground/50" style={{ left: `${progressTarget}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  {tt(labels.recommendations, lang)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <Badge variant={r.priority === 'high' ? 'destructive' : r.priority === 'medium' ? 'secondary' : 'outline'} className="mt-0.5 shrink-0 text-[10px]">
                      {r.priority === 'high' ? '🔴' : r.priority === 'medium' ? '🟡' : '🟢'}
                    </Badge>
                    <span className="text-sm">{tt(r.text, lang)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* EVOLUTION */}
          <TabsContent value="evolution" className="space-y-6 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{tt(labels.quarterlyTitle, lang)}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={quarterlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="quarter" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="abidjan" name="Abidjan" stroke={colors.abidjan} strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="yamoussoukro" name="Yamoussoukro" stroke={colors.yamoussoukro} strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="bouake" name="Bouaké" stroke={colors.bouake} strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="daloa" name="Daloa" stroke={colors.daloa} strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="sanPedro" name="San-Pédro" stroke={colors.sanPedro} strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Growth cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { name: 'Abidjan', growth: 43.9, color: colors.abidjan },
                { name: 'Yamoussoukro', growth: 52.9, color: colors.yamoussoukro },
                { name: 'Bouaké', growth: 55.2, color: colors.bouake },
                { name: 'Daloa', growth: 68.2, color: colors.daloa },
                { name: 'San-Pédro', growth: 67.6, color: colors.sanPedro },
              ].map((r, i) => (
                <Card key={i}>
                  <CardContent className="pt-4 pb-3 text-center">
                    <div className="h-2 w-8 rounded-full mx-auto mb-2" style={{ backgroundColor: r.color }} />
                    <div className="font-semibold text-sm">{r.name}</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      <span className="text-lg font-bold text-foreground">+{r.growth}%</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{tt({ fr: 'croissance annuelle', en: 'annual growth', pt: 'crescimento anual', ar: 'النمو السنوي' }, lang)}</div>
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

export default AnalysisModule;
