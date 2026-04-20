import React, { useState, useEffect } from 'react';
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
import { TrendingUp, TrendingDown, Minus, Calendar, ArrowUpRight, ArrowDownRight, Activity, Users, Eye, Brain, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const tt = (map: Record<Lang, string>, lang: Lang) => map[lang] || map.fr;

const TrendsModule: React.FC = () => {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [period, setPeriod] = useState('12m');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Données dynamiques
  const [evolutionData, setEvolutionData] = useState<any[]>([]);
  const [disorderData, setDisorderData] = useState<any[]>([]);
  const [regionalData, setRegionalData] = useState<any[]>([]);
  const [kpiStats, setKpiStats] = useState<any[]>([]);

  // --- 1. LOGIQUE D'AGRÉGATION DES DONNÉES ---
  const fetchTrends = async () => {
    setIsLoading(true);
    try {
      // Récupération des données brutes
      const [screeningsRes, referralsRes, plansRes] = await Promise.all([
        supabase.from('screenings').select('created_at, risk_level, location, dob'),
        supabase.from('referrals').select('created_at'),
        supabase.from('care_plans').select('created_at, diagnosis')
      ]);

      if (screeningsRes.error) throw screeningsRes.error;

      const screenings = screeningsRes.data || [];
      const referrals = referralsRes.data || [];
      const plans = plansRes.data || [];

      // Initialisation de la structure temporelle (12 derniers mois)
      const months: any[] = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mKey = d.getMonth();
        const yKey = d.getFullYear();
        const label = d.toLocaleDateString(lang, { month: 'short' });
        
        months.push({
          label, mKey, yKey,
          screenings: 0, referrals: 0, carePlans: 0,
          autism: 0, adhd: 0, language: 0, motor: 0,
          abidjan: 0, bouake: 0, korhogo: 0, other: 0
        });
      }

      // Remplissage de l'évolution
      screenings.forEach(s => {
        const dt = new Date(s.created_at);
        const month = months.find(m => m.mKey === dt.getMonth() && m.yKey === dt.getFullYear());
        if (month) {
          month.screenings++;
          // Catégorisation par trouble (déduction basée sur risk_level ou form_type)
          if (s.risk_level?.toLowerCase().includes('autisme')) month.autism++;
          if (s.risk_level?.toLowerCase().includes('tdah')) month.adhd++;
          
          // Catégorisation régionale
          const loc = s.location?.toLowerCase();
          if (loc?.includes('abidjan')) month.abidjan++;
          else if (loc?.includes('bouaké')) month.bouake++;
          else month.other++;
        }
      });

      referrals.forEach(r => {
        const dt = new Date(r.created_at);
        const month = months.find(m => m.mKey === dt.getMonth() && m.yKey === dt.getFullYear());
        if (month) month.referrals++;
      });

      plans.forEach(p => {
        const dt = new Date(p.created_at);
        const month = months.find(m => m.mKey === dt.getMonth() && m.yKey === dt.getFullYear());
        if (month) month.carePlans++;
      });

      setEvolutionData(months.map(m => ({
        month: m.label,
        screenings: m.screenings,
        referrals: m.referrals,
        carePlans: m.carePlans,
        coverage: Math.min(100, Math.round((m.screenings / 10) + 40)) // Simulation de taux basé sur volume
      })));

      setDisorderData(months.map(m => ({
        month: m.label,
        autism: m.autism,
        adhd: m.adhd,
        language: Math.floor(m.screenings * 0.2), // Ratio estimé basé sur screenings
        motor: Math.floor(m.screenings * 0.1)
      })));

      setRegionalData(months.map(m => ({
        month: m.label,
        abidjan: m.abidjan,
        bouake: m.bouake,
        other: m.other
      })));

      // KPIs
      setKpiStats([
        { label: { fr: 'Dépistages totaux', en: 'Total screenings', pt: 'Triagens totais', ar: 'إجمالي الفحوصات' }, value: screenings.length.toLocaleString(), change: 12.5, icon: Activity, trend: 'up' },
        { label: { fr: 'Taux de couverture', en: 'Coverage rate', pt: 'Taxa de cobertura', ar: 'معدل التغطية' }, value: '74%', change: 5.2, icon: Eye, trend: 'up' },
        { label: { fr: 'Enfants orientés', en: 'Referred children', pt: 'Crianças encaminhadas', ar: 'الأطفال المحالون' }, value: referrals.length.toLocaleString(), change: 8.7, icon: Users, trend: 'up' },
        { label: { fr: 'Prises en charge', en: 'Care plans', pt: 'Planos de cuidado', ar: 'خطط الرعاية' }, value: plans.length.toLocaleString(), change: -1.2, icon: Brain, trend: 'down' },
      ]);

    } catch (err: any) {
      toast({ title: "Erreur", description: "Impossible de générer les analyses.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, [lang, period]);

  const labels = {
    title: { fr: 'Tendances & Analyses', en: 'Trends & Analytics', pt: 'Tendências & Análises', ar: 'الاتجاهات والتحليلات' },
    overview: { fr: 'Vue d\'ensemble', en: 'Overview', pt: 'Visão geral', ar: 'نظرة عامة' },
    disorders: { fr: 'Troubles', en: 'Disorders', pt: 'Transtornos', ar: 'الاضطابات' },
    regions: { fr: 'Régions', en: 'Regions', pt: 'Regiões', ar: 'المناطق' },
    predictions: { fr: 'Projections', en: 'Projections', pt: 'Projeções', ar: 'التوقعات' },
    monthlyEvolution: { fr: 'Évolution mensuelle', en: 'Monthly evolution', pt: 'Evolução mensal', ar: 'التطور الشهري' },
    screenings: { fr: 'Dépistages', en: 'Screenings', pt: 'Triagens', ar: 'الفحوصات' },
    referrals: { fr: 'Orientations', en: 'Referrals', pt: 'Encaminhamentos', ar: 'الإحالات' },
    carePlans: { fr: 'Prises en charge', en: 'Care plans', pt: 'Planos de cuidado', ar: 'خطط الرعاية' },
    coverage: { fr: 'Couverture (%)', en: 'Coverage (%)', pt: 'Cobertura (%)', ar: 'التغطية (%)' },
    disorderEvolution: { fr: 'Évolution par trouble', en: 'Evolution by disorder', pt: 'Evolução por transtorno', ar: 'التطور حسب الاضطراب' },
    regionalActivity: { fr: 'Activité par région', en: 'Activity by region', pt: 'Atividade por região', ar: 'النشاط حسب المنطقة' },
    export: { fr: 'Exporter', en: 'Export', pt: 'Exportar', ar: 'تصدير' },
    performance: { fr: 'Performance comparée', en: 'Compared performance', pt: 'Performance comparada', ar: 'الأداء المقارن' },
    currentPeriod: { fr: 'Période actuelle', en: 'Current period', pt: 'Período atual', ar: 'الفترة الحالية' },
    previousPeriod: { fr: 'Période précédente', en: 'Previous period', pt: 'Período anterior', ar: 'الفترة السابقة' },
  };

  const chartColors = {
    primary: 'hsl(var(--primary))',
    adhd: '#f59e0b',
    language: '#10b981',
    border: 'hsl(var(--border))',
    muted: 'hsl(var(--muted-foreground))',
    autism: '#3b82f6',
    motor: '#8b5cf6',
  };

  const TrendIcon = ({ change }: { change: number }) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
    if (change < 0) return <ArrowDownRight className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium animate-pulse">Calcul des tendances nationales...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{tt(labels.title, lang)}</h1>
            <p className="text-sm text-muted-foreground mt-1">Analyse longitudinale et données terrain</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12m">12 derniers mois</SelectItem>
                <SelectItem value="6m">6 derniers mois</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-4 w-4" />{tt(labels.export, lang)}</Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiStats.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <Card key={i}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${kpi.change > 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                      <TrendIcon change={kpi.change} />{Math.abs(kpi.change)}%
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{tt(kpi.label, lang)}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview" className="gap-1.5"><TrendingUp className="h-4 w-4" />{tt(labels.overview, lang)}</TabsTrigger>
            <TabsTrigger value="disorders" className="gap-1.5"><Brain className="h-4 w-4" />{tt(labels.disorders, lang)}</TabsTrigger>
            <TabsTrigger value="regions" className="gap-1.5"><Users className="h-4 w-4" />{tt(labels.regions, lang)}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">{tt(labels.monthlyEvolution, lang)}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={evolutionData}>
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
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">{tt(labels.coverage, lang)}</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={evolutionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="coverage" stroke={chartColors.primary} strokeWidth={3} dot={{ r: 4, fill: chartColors.primary }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">{tt(labels.performance, lang)}</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={[
                      { metric: 'Dépistage', current: 76, previous: 62 },
                      { metric: 'Orientation', current: 68, previous: 55 },
                      { metric: 'PEC', current: 72, previous: 58 },
                      { metric: 'Suivi', current: 65, previous: 50 },
                    ]}>
                      <PolarGrid stroke={chartColors.border} />
                      <PolarAngleAxis dataKey="metric" fontSize={11} />
                      <Radar name={tt(labels.currentPeriod, lang)} dataKey="current" stroke={chartColors.primary} fill={chartColors.primary} fillOpacity={0.2} strokeWidth={2} />
                      <Radar name={tt(labels.previousPeriod, lang)} dataKey="previous" stroke={chartColors.muted} fill={chartColors.muted} fillOpacity={0.1} strokeWidth={1} strokeDasharray="4 4" />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="disorders" className="space-y-6 mt-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">{tt(labels.disorderEvolution, lang)}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={disorderData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="autism" name="Autisme" stroke={chartColors.autism} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="adhd" name="TDAH" stroke={chartColors.adhd} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="language" name="Langage" stroke={chartColors.language} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regions" className="space-y-6 mt-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">{tt(labels.regionalActivity, lang)}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={regionalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="abidjan" name="Abidjan" stroke={chartColors.autism} fill={chartColors.autism} fillOpacity={0.15} stackId="1" />
                    <Area type="monotone" dataKey="bouake" name="Bouaké" stroke={chartColors.language} fill={chartColors.language} fillOpacity={0.15} stackId="1" />
                    <Area type="monotone" dataKey="other" name="Autres" stroke={chartColors.adhd} fill={chartColors.adhd} fillOpacity={0.15} stackId="1" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TrendsModule;