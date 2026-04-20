import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Lang } from '@/i18n/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import {
  Globe, Plus, Search, MapPin, Users, Building, Activity, Settings,
  MoreVertical, Eye, Edit, Trash2, CheckCircle, Clock, XCircle,
  TrendingUp, Baby, Stethoscope, Flag, ArrowUpRight, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase'; // <-- AJOUT : Supabase

const tt = (map: Record<Lang, string>, lang: Lang) => map[lang] || map.fr;

interface Country {
  id: string;
  name: Record<Lang, string>;
  code: string;
  flag: string;
  status: 'active' | 'pilot' | 'pending' | 'inactive';
  regions: number;
  structures: number;
  professionals: number;
  children: number;
  coverage: number;
  launchDate: string;
  language: string;
  currency: string;
  contact: string;
}

const statusConfig = {
  active: { label: { fr: 'Actif', en: 'Active', pt: 'Ativo', ar: 'نشط' }, variant: 'default' as const, icon: CheckCircle },
  pilot: { label: { fr: 'Pilote', en: 'Pilot', pt: 'Piloto', ar: 'تجريبي' }, variant: 'secondary' as const, icon: Activity },
  pending: { label: { fr: 'En attente', en: 'Pending', pt: 'Pendente', ar: 'قيد الانتظار' }, variant: 'outline' as const, icon: Clock },
  inactive: { label: { fr: 'Inactif', en: 'Inactive', pt: 'Inativo', ar: 'غير نشط' }, variant: 'destructive' as const, icon: XCircle },
};

const CountriesModule: React.FC = () => {
  const { lang } = useLanguage();
  const { toast } = useToast();
  
  const [countries, setCountries] = useState<Country[]>([]); // <-- INITIALISATION VIDE
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [newCountry, setNewCountry] = useState({ name: '', code: '', language: '', currency: '', contact: '' });

  // --- 1. LECTURE DEPUIS SUPABASE ---
  const fetchCountries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formatted: Country[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          code: d.code,
          flag: d.flag || '🏳️',
          status: d.status,
          regions: d.regions || 0,
          structures: d.structures || 0,
          professionals: d.professionals || 0,
          children: d.children || 0,
          coverage: d.coverage || 0,
          launchDate: d.launch_date || '',
          language: d.language || '',
          currency: d.currency || '',
          contact: d.contact || ''
        }));
        setCountries(formatted);
      }
    } catch (error: any) {
      toast({ title: "Erreur", description: "Impossible de charger les pays", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const labels = {
    title: { fr: 'Gestion des pays', en: 'Country Management', pt: 'Gestão de países', ar: 'إدارة الدول' },
    subtitle: { fr: 'Déploiement international de la plateforme', en: 'International platform deployment', pt: 'Implantação internacional da plataforma', ar: 'النشر الدولي للمنصة' },
    list: { fr: 'Liste', en: 'List', pt: 'Lista', ar: 'القائمة' },
    analytics: { fr: 'Analytique', en: 'Analytics', pt: 'Análise', ar: 'التحليلات' },
    addCountry: { fr: 'Ajouter un pays', en: 'Add country', pt: 'Adicionar país', ar: 'إضافة دولة' },
    search: { fr: 'Rechercher un pays...', en: 'Search country...', pt: 'Buscar país...', ar: 'البحث عن دولة...' },
    allStatuses: { fr: 'Tous les statuts', en: 'All statuses', pt: 'Todos os status', ar: 'كل الحالات' },
    regions: { fr: 'Régions', en: 'Regions', pt: 'Regiões', ar: 'المناطق' },
    structures: { fr: 'Structures', en: 'Structures', pt: 'Estruturas', ar: 'الهياكل' },
    professionals: { fr: 'Professionnels', en: 'Professionals', pt: 'Profissionais', ar: 'المهنيون' },
    children: { fr: 'Enfants suivis', en: 'Children followed', pt: 'Crianças acompanhadas', ar: 'الأطفال المتابعون' },
    coverage: { fr: 'Couverture', en: 'Coverage', pt: 'Cobertura', ar: 'التغطية' },
    launchDate: { fr: 'Date de lancement', en: 'Launch date', pt: 'Data de lançamento', ar: 'تاريخ الإطلاق' },
    language: { fr: 'Langue', en: 'Language', pt: 'Idioma', ar: 'اللغة' },
    currency: { fr: 'Devise', en: 'Currency', pt: 'Moeda', ar: 'العملة' },
    contact: { fr: 'Contact principal', en: 'Main contact', pt: 'Contato principal', ar: 'جهة الاتصال الرئيسية' },
    details: { fr: 'Détails du pays', en: 'Country details', pt: 'Detalhes do país', ar: 'تفاصيل الدولة' },
    overview: { fr: 'Vue d\'ensemble', en: 'Overview', pt: 'Visão geral', ar: 'نظرة عامة' },
    config: { fr: 'Configuration', en: 'Configuration', pt: 'Configuração', ar: 'الإعدادات' },
    name: { fr: 'Nom du pays', en: 'Country name', pt: 'Nome do país', ar: 'اسم الدولة' },
    code: { fr: 'Code ISO', en: 'ISO code', pt: 'Código ISO', ar: 'رمز ISO' },
    save: { fr: 'Enregistrer', en: 'Save', pt: 'Salvar', ar: 'حفظ' },
    cancel: { fr: 'Annuler', en: 'Cancel', pt: 'Cancelar', ar: 'إلغاء' },
    activate: { fr: 'Activer', en: 'Activate', pt: 'Ativar', ar: 'تفعيل' },
    deactivate: { fr: 'Désactiver', en: 'Deactivate', pt: 'Desativar', ar: 'إلغاء التفعيل' },
    delete: { fr: 'Supprimer', en: 'Delete', pt: 'Excluir', ar: 'حذف' },
    childrenByCountry: { fr: 'Enfants par pays', en: 'Children by country', pt: 'Crianças por país', ar: 'الأطفال حسب الدولة' },
    coverageByCountry: { fr: 'Couverture par pays', en: 'Coverage by country', pt: 'Cobertura por país', ar: 'التغطية حسب الدولة' },
    statusDistribution: { fr: 'Répartition par statut', en: 'Status distribution', pt: 'Distribuição por status', ar: 'التوزيع حسب الحالة' },
    notLaunched: { fr: 'Non lancé', en: 'Not launched', pt: 'Não lançado', ar: 'لم يتم الإطلاق' },
  };

  const filtered = countries.filter(c => {
    const matchSearch = tt(c.name, lang).toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totals = {
    countries: countries.filter(c => c.status === 'active' || c.status === 'pilot').length,
    children: countries.reduce((a, c) => a + c.children, 0),
    structures: countries.reduce((a, c) => a + c.structures, 0),
    professionals: countries.reduce((a, c) => a + c.professionals, 0),
  };

  const statusCounts = [
    { name: tt(statusConfig.active.label, lang), value: countries.filter(c => c.status === 'active').length, color: '#10b981' },
    { name: tt(statusConfig.pilot.label, lang), value: countries.filter(c => c.status === 'pilot').length, color: '#3b82f6' },
    { name: tt(statusConfig.pending.label, lang), value: countries.filter(c => c.status === 'pending').length, color: '#f59e0b' },
    { name: tt(statusConfig.inactive.label, lang), value: countries.filter(c => c.status === 'inactive').length, color: '#ef4444' },
  ];

  const childrenChart = countries.filter(c => c.children > 0).map(c => ({ name: `${c.flag} ${tt(c.name, lang)}`, children: c.children })).sort((a, b) => b.children - a.children);
  const coverageChart = countries.filter(c => c.coverage > 0).map(c => ({ name: `${c.flag} ${tt(c.name, lang)}`, coverage: c.coverage })).sort((a, b) => b.coverage - a.coverage);

  // --- 2. CRÉATION ---
  const handleCreate = async () => {
    if (!newCountry.name || !newCountry.code) return;
    setIsSubmitting(true);
    
    try {
      const dbPayload = {
        name: { fr: newCountry.name, en: newCountry.name, pt: newCountry.name, ar: newCountry.name },
        code: newCountry.code.toUpperCase(),
        flag: '🏳️',
        status: 'pending',
        language: newCountry.language,
        currency: newCountry.currency,
        contact: newCountry.contact,
      };

      const { error } = await supabase.from('countries').insert([dbPayload]);
      if (error) throw error;

      setShowCreateDialog(false);
      setNewCountry({ name: '', code: '', language: '', currency: '', contact: '' });
      toast({ title: tt({ fr: 'Pays ajouté', en: 'Country added', pt: 'País adicionado', ar: 'تمت إضافة الدولة' }, lang) });
      fetchCountries();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. MISE À JOUR DU STATUT ---
  const handleStatusChange = async (id: string, newStatus: Country['status']) => {
    try {
      const { error } = await supabase.from('countries').update({ status: newStatus }).eq('id', id);
      if (error) throw error;

      setCountries(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      if (selectedCountry?.id === id) setSelectedCountry(prev => prev ? { ...prev, status: newStatus } : null);
      toast({ title: tt({ fr: 'Statut mis à jour', en: 'Status updated', pt: 'Status atualizado', ar: 'تم تحديث الحالة' }, lang) });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  // --- 4. SUPPRESSION ---
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('countries').delete().eq('id', id);
      if (error) throw error;

      setCountries(prev => prev.filter(c => c.id !== id));
      if (selectedCountry?.id === id) setSelectedCountry(null);
      toast({ title: tt({ fr: 'Pays supprimé', en: 'Country deleted', pt: 'País excluído', ar: 'تم حذف الدولة' }, lang) });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{tt(labels.title, lang)}</h1>
            <p className="text-sm text-muted-foreground mt-1">{tt(labels.subtitle, lang)}</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />{tt(labels.addCountry, lang)}
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: { fr: 'Pays déployés', en: 'Deployed countries', pt: 'Países implantados', ar: 'الدول المنشورة' }, value: totals.countries, icon: Globe },
            { label: labels.children, value: totals.children.toLocaleString(), icon: Baby },
            { label: labels.structures, value: totals.structures, icon: Building },
            { label: labels.professionals, value: totals.professionals, icon: Stethoscope },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <Card key={i}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="h-5 w-5 text-primary" /></div>
                    <div>
                      <div className="text-xl font-bold text-foreground">{kpi.value}</div>
                      <div className="text-xs text-muted-foreground">{tt(kpi.label, lang)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="list" className="gap-1.5"><Flag className="h-4 w-4" />{tt(labels.list, lang)}</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5"><Activity className="h-4 w-4" />{tt(labels.analytics, lang)}</TabsTrigger>
          </TabsList>

          {/* LIST */}
          <TabsContent value="list" className="mt-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={tt(labels.search, lang)} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tt(labels.allStatuses, lang)}</SelectItem>
                  {Object.entries(statusConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{tt(cfg.label, lang)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <div className="flex gap-6">
                {/* Country list */}
                <div className={`space-y-3 ${selectedCountry ? 'w-1/2' : 'w-full'} transition-all`}>
                  {filtered.length === 0 ? (
                    <div className="text-center py-10 bg-card border rounded-xl">
                      <Globe className="h-10 w-10 mx-auto text-muted-foreground opacity-20 mb-3" />
                      <p className="text-muted-foreground">Aucun pays trouvé.</p>
                    </div>
                  ) : filtered.map(country => {
                    const cfg = statusConfig[country.status];
                    const StatusIcon = cfg.icon;
                    const isSelected = selectedCountry?.id === country.id;
                    return (
                      <Card key={country.id} className={`cursor-pointer transition-all hover:border-primary/30 ${isSelected ? 'border-primary ring-1 ring-primary/20' : ''}`} onClick={() => setSelectedCountry(country)}>
                        <CardContent className="py-4">
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">{country.flag}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">{tt(country.name, lang)}</span>
                                <Badge variant="outline" className="text-[10px]">{country.code}</Badge>
                                <Badge variant={cfg.variant} className="gap-1 text-[10px]">
                                  <StatusIcon className="h-3 w-3" />{tt(cfg.label, lang)}
                                </Badge>
                              </div>
                              {country.status === 'active' || country.status === 'pilot' ? (
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{country.regions} {tt(labels.regions, lang)}</span>
                                  <span className="flex items-center gap-1"><Building className="h-3 w-3" />{country.structures}</span>
                                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{country.children.toLocaleString()}</span>
                                  <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{country.coverage}%</span>
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground">{country.contact || tt(labels.notLaunched, lang)}</div>
                              )}
                            </div>
                            {(country.status === 'active' || country.status === 'pilot') && (
                              <div className="w-16 shrink-0">
                                <div className="text-xs text-right text-muted-foreground mb-1">{country.coverage}%</div>
                                <Progress value={country.coverage} className="h-1.5" />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Detail panel */}
                {selectedCountry && (
                  <div className="w-1/2 space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-4xl">{selectedCountry.flag}</span>
                            <div>
                              <CardTitle className="text-lg">{tt(selectedCountry.name, lang)}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{selectedCountry.code}</Badge>
                                <Badge variant={statusConfig[selectedCountry.status].variant}>{tt(statusConfig[selectedCountry.status].label, lang)}</Badge>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedCountry(null)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-muted/30 rounded-lg p-3">
                            <div className="text-muted-foreground text-xs">{tt(labels.language, lang)}</div>
                            <div className="font-medium mt-0.5">{selectedCountry.language || '—'}</div>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-3">
                            <div className="text-muted-foreground text-xs">{tt(labels.currency, lang)}</div>
                            <div className="font-medium mt-0.5">{selectedCountry.currency || '—'}</div>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-3">
                            <div className="text-muted-foreground text-xs">{tt(labels.contact, lang)}</div>
                            <div className="font-medium mt-0.5">{selectedCountry.contact || '—'}</div>
                          </div>
                          <div className="bg-muted/30 rounded-lg p-3">
                            <div className="text-muted-foreground text-xs">{tt(labels.launchDate, lang)}</div>
                            <div className="font-medium mt-0.5">{selectedCountry.launchDate || '—'}</div>
                          </div>
                        </div>

                        {(selectedCountry.status === 'active' || selectedCountry.status === 'pilot') && (
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: labels.regions, value: selectedCountry.regions, icon: MapPin },
                              { label: labels.structures, value: selectedCountry.structures, icon: Building },
                              { label: labels.professionals, value: selectedCountry.professionals, icon: Users },
                              { label: labels.children, value: selectedCountry.children.toLocaleString(), icon: Baby },
                            ].map((stat, i) => {
                              const Icon = stat.icon;
                              return (
                                <div key={i} className="flex items-center gap-2 p-3 rounded-lg border border-border">
                                  <Icon className="h-4 w-4 text-primary" />
                                  <div>
                                    <div className="font-bold text-sm">{stat.value}</div>
                                    <div className="text-[10px] text-muted-foreground">{tt(stat.label, lang)}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {(selectedCountry.status === 'active' || selectedCountry.status === 'pilot') && (
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">{tt(labels.coverage, lang)}</span>
                              <span className="font-medium">{selectedCountry.coverage}%</span>
                            </div>
                            <Progress value={selectedCountry.coverage} className="h-2.5" />
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          {selectedCountry.status === 'pending' && (
                            <Button size="sm" onClick={() => handleStatusChange(selectedCountry.id, 'pilot')} className="gap-1">
                              <Activity className="h-3.5 w-3.5" />{tt({ fr: 'Lancer en pilote', en: 'Launch pilot', pt: 'Lançar piloto', ar: 'إطلاق تجريبي' }, lang)}
                            </Button>
                          )}
                          {selectedCountry.status === 'pilot' && (
                            <Button size="sm" onClick={() => handleStatusChange(selectedCountry.id, 'active')} className="gap-1">
                              <CheckCircle className="h-3.5 w-3.5" />{tt(labels.activate, lang)}
                            </Button>
                          )}
                          {(selectedCountry.status === 'active' || selectedCountry.status === 'pilot') && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(selectedCountry.id, 'inactive')} className="gap-1">
                              <XCircle className="h-3.5 w-3.5" />{tt(labels.deactivate, lang)}
                            </Button>
                          )}
                          {selectedCountry.status === 'inactive' && (
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(selectedCountry.id, 'pending')} className="gap-1">
                              <Clock className="h-3.5 w-3.5" />{tt({ fr: 'Réactiver', en: 'Reactivate', pt: 'Reativar', ar: 'إعادة التفعيل' }, lang)}
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(selectedCountry.id)} className="text-destructive gap-1">
                            <Trash2 className="h-3.5 w-3.5" />{tt(labels.delete, lang)}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ANALYTICS */}
          <TabsContent value="analytics" className="mt-4 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">{tt(labels.childrenByCountry, lang)}</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={childrenChart} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" fontSize={12} />
                      <YAxis dataKey="name" type="category" fontSize={11} width={130} />
                      <Tooltip />
                      <Bar dataKey="children" name={tt(labels.children, lang)} fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">{tt(labels.coverageByCountry, lang)}</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={coverageChart} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" fontSize={12} domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" fontSize={11} width={130} />
                      <Tooltip />
                      <Bar dataKey="coverage" name={tt(labels.coverage, lang)} fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">{tt(labels.statusDistribution, lang)}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-12">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                        {statusCounts.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {statusCounts.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-sm">{s.name}: <span className="font-bold">{s.value}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{tt(labels.addCountry, lang)}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>{tt(labels.name, lang)}</Label><Input value={newCountry.name} onChange={e => setNewCountry(p => ({ ...p, name: e.target.value }))} className="mt-1" /></div>
            <div><Label>{tt(labels.code, lang)}</Label><Input value={newCountry.code} onChange={e => setNewCountry(p => ({ ...p, code: e.target.value }))} placeholder="XX" maxLength={2} className="mt-1" /></div>
            <div><Label>{tt(labels.language, lang)}</Label><Input value={newCountry.language} onChange={e => setNewCountry(p => ({ ...p, language: e.target.value }))} className="mt-1" /></div>
            <div><Label>{tt(labels.currency, lang)}</Label><Input value={newCountry.currency} onChange={e => setNewCountry(p => ({ ...p, currency: e.target.value }))} className="mt-1" /></div>
            <div><Label>{tt(labels.contact, lang)}</Label><Input value={newCountry.contact} onChange={e => setNewCountry(p => ({ ...p, contact: e.target.value }))} className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>{tt(labels.cancel, lang)}</Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {tt(labels.save, lang)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CountriesModule;