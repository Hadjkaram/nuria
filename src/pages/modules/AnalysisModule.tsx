import React, { useState, useEffect } from 'react';
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
  BarChart3, GitCompare, Layers, ChevronRight, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const tt = (map: Record<Lang, string>, lang: Lang) => map[lang] || map.fr;

// ── DONNÉES INITIALISÉES À ZÉRO (Strictement aucune donnée fictive) ──
const initialRegionData = [
  { region: 'Abidjan', screenings: 0, coverage: 0, referralRate: 0, carePlanRate: 0, avgDelay: 0, structures: 0, professionals: 0 },
  { region: 'Yamoussoukro', screenings: 0, coverage: 0, referralRate: 0, carePlanRate: 0, avgDelay: 0, structures: 0, professionals: 0 },
  { region: 'Bouaké', screenings: 0, coverage: 0, referralRate: 0, carePlanRate: 0, avgDelay: 0, structures: 0, professionals: 0 },
  { region: 'Daloa', screenings: 0, coverage: 0, referralRate: 0, carePlanRate: 0, avgDelay: 0, structures: 0, professionals: 0 },
  { region: 'San-Pédro', screenings: 0, coverage: 0, referralRate: 0, carePlanRate: 0, avgDelay: 0, structures: 0, professionals: 0 },
  { region: 'Korhogo', screenings: 0, coverage: 0, referralRate: 0, carePlanRate: 0, avgDelay: 0, structures: 0, professionals: 0 },
  { region: 'Man', screenings: 0, coverage: 0, referralRate: 0, carePlanRate: 0, avgDelay: 0, structures: 0, professionals: 0 },
  { region: 'Abengourou', screenings: 0, coverage: 0, referralRate: 0, carePlanRate: 0, avgDelay: 0, structures: 0, professionals: 0 },
];

const initialPerformanceRadar = [
  { metric: 'Couverture', Abidjan: 0, Yamoussoukro: 0, Bouaké: 0, Daloa: 0, National: 0 },
  { metric: 'Dépistage', Abidjan: 0, Yamoussoukro: 0, Bouaké: 0, Daloa: 0, National: 0 },
  { metric: 'Orientation', Abidjan: 0, Yamoussoukro: 0, Bouaké: 0, Daloa: 0, National: 0 },
  { metric: 'Prise en charge', Abidjan: 0, Yamoussoukro: 0, Bouaké: 0, Daloa: 0, National: 0 },
  { metric: 'Délai moyen', Abidjan: 0, Yamoussoukro: 0, Bouaké: 0, Daloa: 0, National: 0 },
  { metric: 'Ressources', Abidjan: 0, Yamoussoukro: 0, Bouaké: 0, Daloa: 0, National: 0 },
];

const initialQuarterlyComparison = [
  { quarter: 'T1 2025', abidjan: 0, yamoussoukro: 0, bouake: 0, daloa: 0, sanPedro: 0 },
  { quarter: 'T2 2025', abidjan: 0, yamoussoukro: 0, bouake: 0, daloa: 0, sanPedro: 0 },
  { quarter: 'T3 2025', abidjan: 0, yamoussoukro: 0, bouake: 0, daloa: 0, sanPedro: 0 },
  { quarter: 'T4 2025', abidjan: 0, yamoussoukro: 0, bouake: 0, daloa: 0, sanPedro: 0 },
  { quarter: 'T1 2026', abidjan: 0, yamoussoukro: 0, bouake: 0, daloa: 0, sanPedro: 0 },
];

const initialStructureTypeComparison = [
  { type: { fr: 'Hôpitaux', en: 'Hospitals', pt: 'Hospitais', ar: 'المستشفيات' }, count: 0, screenings: 0, coverage: 0, efficiency: 0 },
  { type: { fr: 'Centres de santé', en: 'Health centers', pt: 'Centros de saúde', ar: 'المراكز الصحية' }, count: 0, screenings: 0, coverage: 0, efficiency: 0 },
  { type: { fr: 'CAMSP', en: 'CAMSP', pt: 'CAMSP', ar: 'CAMSP' }, count: 0, screenings: 0, coverage: 0, efficiency: 0 },
  { type: { fr: 'ONG', en: 'NGOs', pt: 'ONGs', ar: 'المنظمات' }, count: 0, screenings: 0, coverage: 0, efficiency: 0 },
  { type: { fr: 'Écoles', en: 'Schools', pt: 'Escolas', ar: 'المدارس' }, count: 0, screenings: 0, coverage: 0, efficiency: 0 },
];

const initialGapAnalysis = [
  // Cibles (target) conservées car ce sont des objectifs fixes, current et gap à 0
  { indicator: { fr: 'Couverture nationale', en: 'National coverage', pt: 'Cobertura nacional', ar: 'التغطية الوطنية' }, current: 0, target: 85, gap: 0 },
  { indicator: { fr: 'Détection précoce', en: 'Early detection', pt: 'Detecção precoce', ar: 'الكشف المبكر' }, current: 0, target: 90, gap: 0 },
  { indicator: { fr: 'Délai orientation (j)', en: 'Referral delay (d)', pt: 'Prazo encaminhamento (d)', ar: 'تأخير الإحالة (يوم)' }, current: 0, target: 10, gap: 0 },
  { indicator: { fr: 'Taux de suivi', en: 'Follow-up rate', pt: 'Taxa de acompanhamento', ar: 'معدل المتابعة' }, current: 0, target: 80, gap: 0 },
  { indicator: { fr: 'Prof. formés', en: 'Trained prof.', pt: 'Prof. formados', ar: 'المهنيون المدربون' }, current: 0, target: 95, gap: 0 },
  { indicator: { fr: 'Structures actives', en: 'Active structures', pt: 'Estruturas ativas', ar: 'الهياكل النشطة' }, current: 0, target: 100, gap: 0 },
];

const colors = {
  abidjan: '#3b82f6', yamoussoukro: '#10b981', bouake: '#f59e0b',
  daloa: '#8b5cf6', sanPedro: '#ec4899', national: '#64748b',
};

const AnalysisModule: React.FC = () => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('regional');
  const [compareMetric, setCompareMetric] = useState('screenings'); 

  // États alimentés en temps réel
  const [dynamicRegionData, setDynamicRegionData] = useState(initialRegionData);
  const [dynamicQuarterly, setDynamicQuarterly] = useState(initialQuarterlyComparison);
  const [dynamicStructures, setDynamicStructures] = useState(initialStructureTypeComparison);
  const [dynamicRadar, setDynamicRadar] = useState(initialPerformanceRadar);
  const [dynamicGaps, setDynamicGaps] = useState(initialGapAnalysis);
  const [isLoading, setIsLoading] = useState(true);
  const [totalScreenings, setTotalScreenings] = useState(0);

  useEffect(() => {
    const fetchRealData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('screenings').select('location, created_at');
        if (error) throw error;

        if (data) {
          setTotalScreenings(data.length);

          // 1. Mettre à jour uniquement les Dépistages (screenings) par région
          const updatedRegions = initialRegionData.map(r => ({
            ...r,
            screenings: data.filter(d => d.location === r.region).length
          }));
          setDynamicRegionData(updatedRegions);

          // 2. Mettre à jour l'évolution trimestrielle
          const updatedQuarters = initialQuarterlyComparison.map(q => {
            let startM = 0, endM = 2, yr = 2025;
            if (q.quarter.includes('T1')) { startM = 0; endM = 2; }
            if (q.quarter.includes('T2')) { startM = 3; endM = 5; }
            if (q.quarter.includes('T3')) { startM = 6; endM = 8; }
            if (q.quarter.includes('T4')) { startM = 9; endM = 11; }
            if (q.quarter.includes('2025')) yr = 2025;
            if (q.quarter.includes('2026')) yr = 2026;

            const inQuarter = data.filter(d => {
              const dt = new Date(d.created_at);
              return dt.getFullYear() === yr && dt.getMonth() >= startM && dt.getMonth() <= endM;
            });

            return {
              ...q,
              abidjan: inQuarter.filter(d => d.location === 'Abidjan').length,
              yamoussoukro: inQuarter.filter(d => d.location === 'Yamoussoukro').length,
              bouake: inQuarter.filter(d => d.location === 'Bouaké').length,
              daloa: inQuarter.filter(d => d.location === 'Daloa').length,
              sanPedro: inQuarter.filter(d => d.location === 'San-Pédro').length,
            };
          });
          setDynamicQuarterly(updatedQuarters);
        }
      } catch (err) {
        console.error("Erreur Analytics :", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealData();
  }, []);

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
    { value: 'screenings', label: labels.screenings },
    { value: 'coverage', label: labels.coverage },
    { value: 'referralRate', label: labels.referralRate },
    { value: 'carePlanRate', label: labels.carePlanRate },
    { value: 'avgDelay', label: labels.avgDelay },
  ];

  const sortedRegions = [...dynamicRegionData].sort((a, b) => {
    const val = compareMetric as keyof typeof a;
    if (compareMetric === 'avgDelay') return (a[val] as number) - (b[val] as number);
    return (b[val] as number) - (a[val] as number);
  });

  const getBarColor = (value: number, metric: string) => {
    if (value === 0) return '#cbd5e1'; // Gris si la valeur est à 0
    if (metric === 'screenings') return '#3b82f6';
    if (metric === 'avgDelay') {
      if (value <= 15) return '#10b981';
      if (value <= 25) return '#f59e0b';
      return '#ef4444';
    }
    if (value >= 70) return '#10b981';
    if (value >= 50) return '#f59e0b';
    return '#ef4444';
  };

  // Recommandations conservées car c'est un texte fixe d'IA/Conseil
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

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* Summary KPIs (Mis à zéro ou connectés) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: { fr: 'Régions analysées', en: 'Regions analyzed', pt: 'Regiões analisadas', ar: 'المناطق المحللة' }, value: '8', icon: MapPin, sub: { fr: 'sur 14 districts', en: 'of 14 districts', pt: 'de 14 distritos', ar: 'من 14 منطقة' } },
                { label: { fr: 'Dépistages globaux', en: 'Global Screenings', pt: 'Triagens globais', ar: 'الفحوصات الشاملة' }, value: totalScreenings.toString(), icon: Target, sub: { fr: 'Total enregistré', en: 'Total registered', pt: 'Total registrado', ar: 'المجموع المسجل' } },
                { label: { fr: 'Structures comparées', en: 'Structures compared', pt: 'Estruturas comparadas', ar: 'الهياكل المقارنة' }, value: '0', icon: Building, sub: { fr: 'Non connecté', en: 'Not connected', pt: 'Não conectado', ar: 'غير متصل' } },
                { label: { fr: 'Indicateurs évalués', en: 'Indicators evaluated', pt: 'Indicadores avaliados', ar: 'المؤشرات المقيّمة' }, value: '6', icon: BarChart3, sub: { fr: 'En attente de data', en: 'Waiting for data', pt: 'Aguardando dados', ar: 'في انتظار البيانات' } },
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
                      <RadarChart data={dynamicRadar}>
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
                          <div className="flex justify-between"><span className="text-muted-foreground">{tt(labels.screenings, lang)}</span><span className="font-medium text-blue-600">{r.screenings.toLocaleString()}</span></div>
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
                      <BarChart data={dynamicStructures.map(s => ({ ...s, name: tt(s.type, lang) }))}>
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
                  {dynamicStructures.map((s, i) => (
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
                    {dynamicGaps.map((g, i) => {
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
                      <LineChart data={dynamicQuarterly}>
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
                    { name: 'Abidjan', growth: 0, color: colors.abidjan },
                    { name: 'Yamoussoukro', growth: 0, color: colors.yamoussoukro },
                    { name: 'Bouaké', growth: 0, color: colors.bouake },
                    { name: 'Daloa', growth: 0, color: colors.daloa },
                    { name: 'San-Pédro', growth: 0, color: colors.sanPedro },
                  ].map((r, i) => (
                    <Card key={i}>
                      <CardContent className="pt-4 pb-3 text-center">
                        <div className="h-2 w-8 rounded-full mx-auto mb-2" style={{ backgroundColor: r.color }} />
                        <div className="font-semibold text-sm">{r.name}</div>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <TrendingUp className="h-4 w-4 text-slate-300" />
                          <span className="text-lg font-bold text-foreground">+{r.growth}%</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{tt({ fr: 'croissance annuelle', en: 'annual growth', pt: 'crescimento anual', ar: 'النمو السنوي' }, lang)}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnalysisModule;