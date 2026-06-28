import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Building, Plus, Search, Users, MapPin, Activity, Settings,
  CheckCircle, Clock, XCircle, Trash2, Edit, Eye, Baby,
  Stethoscope, Globe, TrendingUp, Mail, Phone, Shield, Layers, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const tt = (map: Record<string, string> | undefined | null, lang: string) => {
  if (!map) return '---';
  return map[lang] || map.fr || '---';
};

interface Organization {
  id: string;
  name: string;
  type: string;
  country: string;
  countryFlag: string;
  status: string;
  regions: number;
  structures: number;
  professionals: number;
  children: number;
  coverage: number;
  email: string;
  phone: string;
  director: string;
  createdAt: string;
  plan: string;
  modules: string[];
}

const orgTypes: Record<string, Record<string, string>> = {
  hospital: { fr: 'Hôpital', en: 'Hospital', pt: 'Hospital', ar: 'مستشفى' },
  ngo: { fr: 'ONG', en: 'NGO', pt: 'ONG', ar: 'منظمة غير حكومية' },
  ministry: { fr: 'Ministère', en: 'Ministry', pt: 'Ministério', ar: 'وزارة' },
  university: { fr: 'Université', en: 'University', pt: 'Universidade', ar: 'جامعة' },
  clinic: { fr: 'Clinique', en: 'Clinic', pt: 'Clínica', ar: 'عيادة' },
  association: { fr: 'Association', en: 'Association', pt: 'Associação', ar: 'جمعية' },
};

const planConfig: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: '#94a3b8' },
  standard: { label: 'Standard', color: '#3b82f6' },
  premium: { label: 'Premium', color: '#f59e0b' },
  enterprise: { label: 'Enterprise', color: '#8b5cf6' },
};

const statusConfig: Record<string, { label: Record<string, string>; variant: "default" | "destructive" | "outline"; icon: React.ElementType }> = {
  active: { label: { fr: 'Actif', en: 'Active', pt: 'Ativo', ar: 'نشط' }, variant: 'default', icon: CheckCircle },
  suspended: { label: { fr: 'Suspendu', en: 'Suspended', pt: 'Suspenso', ar: 'موقوف' }, variant: 'destructive', icon: XCircle },
  pending: { label: { fr: 'En attente', en: 'Pending', pt: 'Pendente', ar: 'قيد الانتظار' }, variant: 'outline', icon: Clock },
};

const OrganizationsModule: React.FC = () => {
  const { lang } = useLanguage() as { lang: string };
  const { toast } = useToast();
  
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [detailTab, setDetailTab] = useState('overview');
  const [newOrg, setNewOrg] = useState({ name: '', type: 'clinic', email: '', phone: '', director: '', country: '', plan: 'standard' });

  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      // 🚨 SUPPRESSION DÉFINITIVE DE L'ORDER ICI
      const [orgsRes, profilesRes, screeningsRes] = await Promise.all([
        supabase.from('organizations').select('*'),
        supabase.from('profiles').select('id, assigned_structure, organization'),
        supabase.from('screenings').select('id, structure, created_at, child_name')
      ]);
      
      const formalOrgs = orgsRes.data || [];
      const profiles = profilesRes.data || [];
      const rawScreenings = screeningsRes.data || [];

      const uniqueScreenings: any[] = [];
      const seenNames = new Set();
      rawScreenings.forEach(item => {
        const name = (item.child_name || 'inconnu').trim().toLowerCase();
        if (!seenNames.has(name)) {
          seenNames.add(name);
          uniqueScreenings.push(item);
        }
      });

      const mergedOrgsMap = new Map();

      formalOrgs.forEach(o => mergedOrgsMap.set((o.name || '').toLowerCase().trim(), o));

      profiles.forEach(p => {
        const orgName = p.assigned_structure || p.organization;
        if (orgName && orgName !== '-' && orgName.trim() !== '') {
          const key = orgName.toLowerCase().trim();
          if (!mergedOrgsMap.has(key)) {
            mergedOrgsMap.set(key, {
              id: `virtual-${key}`,
              name: orgName,
              type: 'clinic',
              country: "Côte d'Ivoire",
              country_flag: '🇨🇮',
              status: 'active',
              regions: 1,
              structures: 1,
              coverage: 0,
              plan: 'standard',
              modules: ['screening']
            });
          }
        }
      });

      const allOrgsData = Array.from(mergedOrgsMap.values());
      
      const formatted: Organization[] = allOrgsData.map((o: any) => {
        const realProfessionalsCount = profiles.filter(p => 
          (p.assigned_structure && p.assigned_structure.toLowerCase() === o.name.toLowerCase()) ||
          (p.organization && p.organization.toLowerCase() === o.name.toLowerCase())
        ).length;

        const realChildrenCount = uniqueScreenings.filter(s => {
          let expectedOrg = s.structure;
          if (s.created_at?.includes('2026-04-02')) {
              expectedOrg = "Centre de santé HKB d'Abobo";
          } else if (s.created_at?.includes('2026-04-11')) {
              expectedOrg = "CSU Djoulabougou à Yamoussoukro";
          } else if (s.created_at?.includes('2026-04-23')) {
              expectedOrg = "FSU-COM WASSAKARA";
          }
          return expectedOrg?.toLowerCase().trim() === o.name.toLowerCase().trim();
        }).length;

        return {
          id: o.id,
          name: o.name || 'Organisation Inconnue',
          type: o.type || 'hospital',
          country: o.country || '-',
          countryFlag: o.country_flag || '🏳️',
          status: o.status || 'pending',
          regions: o.regions || 1,
          structures: o.structures || 1,
          professionals: realProfessionalsCount, 
          children: realChildrenCount, 
          coverage: o.coverage || 0,
          email: o.email || '',
          phone: o.phone || '',
          director: o.director || '',
          createdAt: o.created_at ? new Date(o.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-US' : 'fr-FR') : 'Historique',
          plan: o.plan || 'standard',
          modules: Array.isArray(o.modules) ? o.modules : []
        };
      });
      setOrgs(formatted);
    } catch (err: any) {
      console.error("Crash évité dans fetchOrganizations:", err);
      toast({ title: "Info", description: "Le module d'organisations charge partiellement les données.", variant: "default" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [lang]);

  const labels = {
    title: { fr: 'Gestion des organisations', en: 'Organization Management', pt: 'Gestão de organizações', ar: 'إدارة المنظمات' },
    subtitle: { fr: 'Supervision des entités partenaires', en: 'Partner entity supervision', pt: 'Supervisão de entidades parceiras', ar: 'إشراف الجهات الشريكة' },
    list: { fr: 'Liste', en: 'List', pt: 'Lista', ar: 'القائمة' },
    analytics: { fr: 'Analytique', en: 'Analytics', pt: 'Análise', ar: 'التحليلات' },
    addOrg: { fr: 'Ajouter une organisation', en: 'Add organization', pt: 'Adicionar organização', ar: 'إضافة منظمة' },
    search: { fr: 'Rechercher...', en: 'Search...', pt: 'Buscar...', ar: 'بحث...' },
    allTypes: { fr: 'Tous les types', en: 'All types', pt: 'Todos os tipos', ar: 'كل الأنواع' },
    allStatuses: { fr: 'Tous les statuts', en: 'All statuses', pt: 'Todos os status', ar: 'كل الحالات' },
    overview: { fr: 'Vue d\'ensemble', en: 'Overview', pt: 'Visão geral', ar: 'نظرة عامة' },
    modules: { fr: 'Modules', en: 'Modules', pt: 'Módulos', ar: 'الوحدات' },
    config: { fr: 'Configuration', en: 'Configuration', pt: 'Configuração', ar: 'الإعدادات' },
    name: { fr: 'Nom', en: 'Name', pt: 'Nome', ar: 'الاسم' },
    type: { fr: 'Type', en: 'Type', pt: 'Tipo', ar: 'النوع' },
    country: { fr: 'Pays', en: 'Country', pt: 'País', ar: 'الدولة' },
    director: { fr: 'Directeur', en: 'Director', pt: 'Diretor', ar: 'المدير' },
    email: { fr: 'Email', en: 'Email', pt: 'Email', ar: 'البريد' },
    phone: { fr: 'Téléphone', en: 'Phone', pt: 'Telefone', ar: 'الهاتف' },
    plan: { fr: 'Forfait', en: 'Plan', pt: 'Plano', ar: 'الخطة' },
    regions: { fr: 'Régions', en: 'Regions', pt: 'Regiões', ar: 'المناطق' },
    structures: { fr: 'Structures', en: 'Structures', pt: 'Estruturas', ar: 'الهياكل' },
    professionals: { fr: 'Professionnels', en: 'Professionals', pt: 'Profissionais', ar: 'المهنيون' },
    children: { fr: 'Enfants', en: 'Children', pt: 'Crianças', ar: 'الأطفال' },
    coverage: { fr: 'Couverture', en: 'Coverage', pt: 'Cobertura', ar: 'التغطية' },
    createdAt: { fr: 'Date de création', en: 'Created at', pt: 'Data de criação', ar: 'تاريخ الإنشاء' },
    save: { fr: 'Enregistrer', en: 'Save', pt: 'Salvar', ar: 'حفظ' },
    cancel: { fr: 'Annuler', en: 'Cancel', pt: 'Cancelar', ar: 'إلغاء' },
    activate: { fr: 'Activer', en: 'Activate', pt: 'Ativar', ar: 'تفعيل' },
    suspend: { fr: 'Suspendre', en: 'Suspend', pt: 'Suspender', ar: 'تعليق' },
    delete: { fr: 'Supprimer', en: 'Delete', pt: 'Excluir', ar: 'حذف' },
    activeModules: { fr: 'Modules actifs', en: 'Active modules', pt: 'Módulos ativos', ar: 'الوحدات النشطة' },
    byType: { fr: 'Par type', en: 'By type', pt: 'Por tipo', ar: 'حسب النوع' },
    byPlan: { fr: 'Par forfait', en: 'By plan', pt: 'Por plano', ar: 'حسب الخطة' },
    childrenByOrg: { fr: 'Enfants par organisation', en: 'Children by org', pt: 'Crianças por org', ar: 'الأطفال حسب المنظمة' },
  };

  const filtered = orgs.filter(o => {
    const matchSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.director.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'all' || o.type === filterType;
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const totals = {
    active: orgs.filter(o => o.status === 'active').length,
    children: orgs.reduce((a, o) => a + o.children, 0),
    professionals: orgs.reduce((a, o) => a + o.professionals, 0),
    structures: orgs.reduce((a, o) => a + o.structures, 0),
  };

  const typeDistribution = Object.entries(orgTypes).map(([key, label]) => ({
    name: tt(label, lang),
    value: orgs.filter(o => o.type === key).length,
    color: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'][Object.keys(orgTypes).indexOf(key)],
  })).filter(d => d.value > 0);

  const planDistribution = Object.entries(planConfig).map(([key, cfg]) => ({
    name: cfg.label,
    value: orgs.filter(o => o.plan === key).length,
    color: cfg.color,
  })).filter(d => d.value > 0);

  const childrenByOrg = orgs.filter(o => o.children > 0).map(o => ({ name: o.name.length > 20 ? o.name.slice(0, 20) + '…' : o.name, children: o.children })).sort((a, b) => b.children - a.children);

  const handleCreate = async () => {
    if (!newOrg.name) return;
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: newOrg.name,
        type: newOrg.type,
        country: newOrg.country || "Côte d'Ivoire",
        country_flag: '🏳️',
        status: 'pending',
        email: newOrg.email,
        phone: newOrg.phone,
        director: newOrg.director,
        plan: newOrg.plan
      };

      const { error } = await supabase.from('organizations').insert([payload]);
      
      if (error) {
         if (error.code === '42P01') {
            throw new Error("La table 'organizations' n'est pas encore créée en base de données.");
         }
         throw error;
      }

      setShowCreateDialog(false);
      setNewOrg({ name: '', type: 'clinic', email: '', phone: '', director: '', country: '', plan: 'standard' });
      toast({ title: "Succès", description: tt({ fr: 'Organisation ajoutée', en: 'Organization added', pt: 'Organização adicionada', ar: 'تمت إضافة المنظمة' }, lang) });
      fetchOrganizations();

    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      if (!id.startsWith('virtual-')) {
        const { error } = await supabase.from('organizations').update({ status }).eq('id', id);
        if (error) throw error;
      }

      setOrgs(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      if (selectedOrg?.id === id) setSelectedOrg(prev => prev ? { ...prev, status } : null);
      toast({ title: tt({ fr: 'Statut mis à jour', en: 'Status updated', pt: 'Status atualizado', ar: 'تم تحديث الحالة' }, lang) });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette organisation ?")) return;
    try {
      if (!id.startsWith('virtual-')) {
        const { error } = await supabase.from('organizations').delete().eq('id', id);
        if (error) throw error;
      }

      setOrgs(prev => prev.filter(o => o.id !== id));
      if (selectedOrg?.id === id) setSelectedOrg(null);
      toast({ title: tt({ fr: 'Organisation supprimée', en: 'Organization deleted', pt: 'Organização excluída', ar: 'تم حذف المنظمة' }, lang) });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{tt(labels.title, lang)}</h1>
            <p className="text-sm text-muted-foreground mt-1">{tt(labels.subtitle, lang)}</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />{tt(labels.addOrg, lang)}
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: { fr: 'Organisations actives', en: 'Active orgs', pt: 'Orgs ativas', ar: 'المنظمات النشطة' }, value: totals.active, icon: Building },
            { label: labels.children, value: totals.children.toLocaleString(), icon: Baby },
            { label: labels.professionals, value: totals.professionals, icon: Stethoscope },
            { label: labels.structures, value: totals.structures, icon: MapPin },
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
            <TabsTrigger value="list" className="gap-1.5"><Building className="h-4 w-4" />{tt(labels.list, lang)}</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5"><Activity className="h-4 w-4" />{tt(labels.analytics, lang)}</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={tt(labels.search, lang)} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tt(labels.allTypes, lang)}</SelectItem>
                  {Object.entries(orgTypes).map(([k, v]) => <SelectItem key={k} value={k}>{tt(v, lang)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tt(labels.allStatuses, lang)}</SelectItem>
                  {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{tt(v, lang)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
               <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <div className="flex gap-6">
                <div className={`space-y-3 transition-all ${selectedOrg ? 'w-1/2' : 'w-full'}`}>
                  {filtered.length === 0 ? (
                    <Card><CardContent className="p-8 text-center text-muted-foreground"><Building className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>Aucune organisation trouvée.</p></CardContent></Card>
                  ) : filtered.map(org => {
                    const cfg = statusConfig[org.status] || statusConfig.pending;
                    const StatusIcon = cfg.icon;
                    const isSelected = selectedOrg?.id === org.id;
                    return (
                      <Card key={org.id} className={`cursor-pointer transition-all hover:border-primary/30 ${isSelected ? 'border-primary ring-1 ring-primary/20' : ''}`} onClick={() => { setSelectedOrg(org); setDetailTab('overview'); }}>
                        <CardContent className="py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <Building className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-semibold text-sm truncate">{org.name}</span>
                                <Badge variant="outline" className="text-[10px]">{tt(orgTypes[org.type], lang)}</Badge>
                                <Badge variant={cfg.variant} className="gap-1 text-[10px]"><StatusIcon className="h-3 w-3" />{tt(cfg.label, lang)}</Badge>
                                <span className="text-xs text-muted-foreground">{org.countryFlag} {org.country}</span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{org.professionals}</span>
                                <span className="flex items-center gap-1"><Baby className="h-3 w-3" />{org.children.toLocaleString()}</span>
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{org.structures}</span>
                                <Badge variant="outline" className="text-[9px] h-4" style={{ borderColor: planConfig[org.plan]?.color || '#000', color: planConfig[org.plan]?.color || '#000' }}>{planConfig[org.plan]?.label || org.plan}</Badge>
                              </div>
                            </div>
                            {org.coverage > 0 && (
                              <div className="w-14 shrink-0 text-right">
                                <div className="text-xs font-medium text-muted-foreground mb-1">{org.coverage}%</div>
                                <Progress value={org.coverage} className="h-1.5" />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {selectedOrg && (
                  <div className="w-1/2 space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><Building className="h-6 w-6 text-primary" /></div>
                            <div>
                              <CardTitle className="text-lg">{selectedOrg.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{tt(orgTypes[selectedOrg.type], lang)}</Badge>
                                <Badge variant={statusConfig[selectedOrg.status]?.variant || 'outline'}>{tt(statusConfig[selectedOrg.status]?.label, lang)}</Badge>
                                <Badge variant="outline" style={{ borderColor: planConfig[selectedOrg.plan]?.color, color: planConfig[selectedOrg.plan]?.color }}>{planConfig[selectedOrg.plan]?.label || selectedOrg.plan}</Badge>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedOrg(null)}><XCircle className="h-4 w-4" /></Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Tabs value={detailTab} onValueChange={setDetailTab}>
                          <TabsList className="w-full">
                            <TabsTrigger value="overview" className="flex-1 text-xs">{tt(labels.overview, lang)}</TabsTrigger>
                            <TabsTrigger value="modules" className="flex-1 text-xs">{tt(labels.modules, lang)}</TabsTrigger>
                            <TabsTrigger value="config" className="flex-1 text-xs">{tt(labels.config, lang)}</TabsTrigger>
                          </TabsList>

                          <TabsContent value="overview" className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              {[
                                { label: labels.director, value: selectedOrg.director, icon: Users },
                                { label: labels.country, value: `${selectedOrg.countryFlag} ${selectedOrg.country}`, icon: Globe },
                                { label: labels.email, value: selectedOrg.email, icon: Mail },
                                { label: labels.phone, value: selectedOrg.phone, icon: Phone },
                              ].map((field, i) => {
                                const Icon = field.icon;
                                return (
                                  <div key={i} className="bg-muted/30 rounded-lg p-3">
                                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-0.5"><Icon className="h-3 w-3" />{tt(field.label, lang)}</div>
                                    <div className="font-medium text-xs truncate">{field.value || '—'}</div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { label: labels.regions, value: selectedOrg.regions, icon: MapPin },
                                { label: labels.structures, value: selectedOrg.structures, icon: Building },
                                { label: labels.professionals, value: selectedOrg.professionals, icon: Stethoscope },
                                { label: labels.children, value: selectedOrg.children.toLocaleString(), icon: Baby },
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

                            {selectedOrg.coverage > 0 && (
                              <div>
                                <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{tt(labels.coverage, lang)}</span><span className="font-medium">{selectedOrg.coverage}%</span></div>
                                <Progress value={selectedOrg.coverage} className="h-2.5" />
                              </div>
                            )}
                          </TabsContent>

                          <TabsContent value="modules" className="mt-4">
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground mb-3">{tt(labels.activeModules, lang)} ({selectedOrg.modules.length})</p>
                              {selectedOrg.modules.length > 0 ? selectedOrg.modules.map((mod, i) => (
                                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30">
                                  <Layers className="h-4 w-4 text-primary" />
                                  <span className="text-sm font-medium capitalize">{mod.replace('-', ' ')}</span>
                                  <Badge variant="default" className="ml-auto text-[10px]">{tt({ fr: 'Actif', en: 'Active', pt: 'Ativo', ar: 'نشط' }, lang)}</Badge>
                                </div>
                              )) : (
                                <p className="text-sm text-muted-foreground text-center py-4">{tt({ fr: 'Aucun module activé', en: 'No active modules', pt: 'Nenhum módulo ativo', ar: 'لا توجد وحدات نشطة' }, lang)}</p>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="config" className="mt-4 space-y-3">
                            <div className="bg-muted/30 rounded-lg p-3 text-sm">
                              <div className="text-muted-foreground text-xs">{tt(labels.createdAt, lang)}</div>
                              <div className="font-medium mt-0.5">{selectedOrg.createdAt}</div>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-3 text-sm">
                              <div className="text-muted-foreground text-xs">{tt(labels.plan, lang)}</div>
                              <div className="font-medium mt-0.5" style={{ color: planConfig[selectedOrg.plan]?.color }}>{planConfig[selectedOrg.plan]?.label || selectedOrg.plan}</div>
                            </div>
                            <div className="flex gap-2 pt-2">
                              {selectedOrg.status !== 'active' && (
                                <Button size="sm" onClick={() => handleStatusChange(selectedOrg.id, 'active')} className="gap-1"><CheckCircle className="h-3.5 w-3.5" />{tt(labels.activate, lang)}</Button>
                              )}
                              {selectedOrg.status === 'active' && (
                                <Button size="sm" variant="outline" onClick={() => handleStatusChange(selectedOrg.id, 'suspended')} className="gap-1"><XCircle className="h-3.5 w-3.5" />{tt(labels.suspend, lang)}</Button>
                              )}
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(selectedOrg.id)} className="text-destructive gap-1"><Trash2 className="h-3.5 w-3.5" />{tt(labels.delete, lang)}</Button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-4 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">{tt(labels.byType, lang)}</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`} fontSize={10} labelLine={false}>
                        {typeDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">{tt(labels.byPlan, lang)}</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`} fontSize={10} labelLine={false}>
                        {planDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">{tt(labels.childrenByOrg, lang)}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={childrenByOrg} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" fontSize={12} />
                    <YAxis dataKey="name" type="category" fontSize={10} width={150} />
                    <Tooltip />
                    <Bar dataKey="children" name={tt(labels.children, lang)} fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{tt(labels.addOrg, lang)}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>{tt(labels.name, lang)} *</Label><Input value={newOrg.name} onChange={e => setNewOrg(p => ({ ...p, name: e.target.value }))} className="mt-1" /></div>
            <div>
              <Label>{tt(labels.type, lang)}</Label>
              <Select value={newOrg.type} onValueChange={v => setNewOrg(p => ({ ...p, type: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(orgTypes).map(([k, v]) => <SelectItem key={k} value={k}>{tt(v, lang)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>{tt(labels.country, lang)}</Label><Input value={newOrg.country} onChange={e => setNewOrg(p => ({ ...p, country: e.target.value }))} className="mt-1" /></div>
            <div><Label>{tt(labels.director, lang)}</Label><Input value={newOrg.director} onChange={e => setNewOrg(p => ({ ...p, director: e.target.value }))} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{tt(labels.email, lang)}</Label><Input value={newOrg.email} onChange={e => setNewOrg(p => ({ ...p, email: e.target.value }))} className="mt-1" /></div>
              <div><Label>{tt(labels.phone, lang)}</Label><Input value={newOrg.phone} onChange={e => setNewOrg(p => ({ ...p, phone: e.target.value }))} className="mt-1" /></div>
            </div>
            <div>
              <Label>{tt(labels.plan, lang)}</Label>
              <Select value={newOrg.plan} onValueChange={v => setNewOrg(p => ({ ...p, plan: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(planConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
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

export default OrganizationsModule;