import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Building, Search, Plus, MapPin, Users, Baby, Activity, CheckCircle2,
  Clock, AlertTriangle, Filter, Edit, Trash2, Phone, Mail, Globe,
  BarChart3, UserCheck, Calendar, Star, Settings, Eye, TrendingUp, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase'; // <-- AJOUT
import { useToast } from '@/hooks/use-toast'; // <-- AJOUT

type StructureType = 'all' | 'health_center' | 'hospital' | 'camsp' | 'school' | 'community_center' | 'ngo';
type StructureStatus = 'all' | 'active' | 'inactive' | 'pending' | 'suspended';

interface TeamMember {
  name: string;
  role: string;
  status: 'active' | 'inactive';
}

interface StructureItem {
  id: string;
  name: string;
  type: StructureType;
  status: StructureStatus;
  region: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  director: string;
  childrenFollowed: number;
  screened: number;
  professionals: number;
  coverage: number;
  createdAt: string;
  lastActivity: string;
  description: string;
  team: TeamMember[];
  monthlyStats: { month: string; screened: number; referred: number }[];
  db_id?: string; // ID Supabase
}

const typeConfig: Record<string, { label: Record<string, string>; color: string; bg: string }> = {
  health_center: { label: { fr: 'Centre de santé', en: 'Health center', pt: 'Centro de saúde', ar: 'مركز صحي' }, color: 'text-blue-600', bg: 'bg-blue-100' },
  hospital: { label: { fr: 'Hôpital', en: 'Hospital', pt: 'Hospital', ar: 'مستشفى' }, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  camsp: { label: { fr: 'CAMSP', en: 'CAMSP', pt: 'CAMSP', ar: 'CAMSP' }, color: 'text-violet-600', bg: 'bg-violet-100' },
  school: { label: { fr: 'École', en: 'School', pt: 'Escola', ar: 'مدرسة' }, color: 'text-amber-600', bg: 'bg-amber-100' },
  community_center: { label: { fr: 'Centre communautaire', en: 'Community center', pt: 'Centro comunitário', ar: 'مركز مجتمعي' }, color: 'text-orange-600', bg: 'bg-orange-100' },
  ngo: { label: { fr: 'ONG', en: 'NGO', pt: 'ONG', ar: 'منظمة' }, color: 'text-teal-600', bg: 'bg-teal-100' },
};

const statusConfig: Record<string, { label: Record<string, string>; style: string }> = {
  active: { label: { fr: 'Active', en: 'Active', pt: 'Ativa', ar: 'نشطة' }, style: 'bg-emerald-100 text-emerald-800' },
  inactive: { label: { fr: 'Inactive', en: 'Inactive', pt: 'Inativa', ar: 'غير نشطة' }, style: 'bg-muted text-muted-foreground' },
  pending: { label: { fr: 'En cours', en: 'Pending', pt: 'Pendente', ar: 'قيد الانتظار' }, style: 'bg-amber-100 text-amber-800' },
  suspended: { label: { fr: 'Suspendue', en: 'Suspended', pt: 'Suspensa', ar: 'معلقة' }, style: 'bg-red-100 text-red-800' },
};

const StructuresModule: React.FC = () => {
  const { lang } = useLanguage();
  const { toast } = useToast();

  const [structures, setStructures] = useState<StructureItem[]>([]); // <-- INITIALISATION VIDE
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<StructureType>('all');
  const [statusFilter, setStatusFilter] = useState<StructureStatus>('all');
  const [selected, setSelected] = useState<StructureItem | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreate, setShowCreate] = useState(false);
  const [newStructure, setNewStructure] = useState({ name: '', type: 'health_center' as StructureType, region: '', district: '', address: '', phone: '', email: '', director: '', description: '' });

  // --- 1. LECTURE DEPUIS SUPABASE ---
  const fetchStructures = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('structures').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      if (data) {
        const formatted: StructureItem[] = data.map((s: any) => ({
          id: s.id, // ID local (même que DB)
          db_id: s.id,
          name: s.name,
          type: s.type as StructureType,
          status: s.status as StructureStatus,
          region: s.region,
          district: s.district,
          address: s.address || '',
          phone: s.phone || '',
          email: s.email || '',
          director: s.director || '',
          childrenFollowed: s.children_followed || 0,
          screened: s.screened || 0,
          professionals: s.professionals || 0,
          coverage: s.coverage || 0,
          createdAt: new Date(s.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-US' : 'fr-FR'),
          lastActivity: s.last_activity ? new Date(s.last_activity).toLocaleDateString(lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-US' : 'fr-FR') : '-',
          description: s.description || '',
          team: s.team || [],
          monthlyStats: s.monthly_stats || []
        }));
        setStructures(formatted);
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: "Impossible de charger les structures.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, [lang]);

  const filtered = structures.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.region.toLowerCase().includes(search.toLowerCase()) || s.director.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || s.type === typeFilter;
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const stats = {
    total: structures.length,
    active: structures.filter(s => s.status === 'active').length,
    children: structures.reduce((sum, s) => sum + s.childrenFollowed, 0),
    professionals: structures.reduce((sum, s) => sum + s.professionals, 0),
  };

  // --- 2. CRÉATION EN BASE DE DONNÉES ---
  const handleCreate = async () => {
    if (!newStructure.name.trim()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        name: newStructure.name,
        type: newStructure.type,
        status: 'pending',
        region: newStructure.region,
        district: newStructure.district,
        address: newStructure.address,
        phone: newStructure.phone,
        email: newStructure.email,
        director: newStructure.director,
        description: newStructure.description,
      };

      const { error } = await supabase.from('structures').insert([payload]);
      if (error) throw error;

      toast({ title: "Succès", description: "La structure a été enregistrée." });
      setNewStructure({ name: '', type: 'health_center', region: '', district: '', address: '', phone: '', email: '', director: '', description: '' });
      setShowCreate(false);
      fetchStructures(); // Rafraîchir
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. MODIFICATION DU STATUT ---
  const updateStatus = async (id: string, status: StructureStatus) => {
    const structureToUpdate = structures.find(s => s.id === id);
    if (!structureToUpdate || !structureToUpdate.db_id) return;

    try {
      const { error } = await supabase.from('structures').update({ status }).eq('id', structureToUpdate.db_id);
      if (error) throw error;

      setStructures(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
      toast({ title: "Succès", description: "Statut mis à jour." });
    } catch (err: any) {
      toast({ title: "Erreur", description: "Échec de la mise à jour.", variant: "destructive" });
    }
  };

  // --- 4. SUPPRESSION ---
  const deleteStructure = async (id: string) => {
    const structureToDelete = structures.find(s => s.id === id);
    if (!structureToDelete || !structureToDelete.db_id) return;

    try {
      const { error } = await supabase.from('structures').delete().eq('id', structureToDelete.db_id);
      if (error) throw error;

      setStructures(prev => prev.filter(s => s.id !== id));
      if (selected?.id === id) setSelected(null);
      toast({ title: "Succès", description: "Structure supprimée." });
    } catch (err: any) {
      toast({ title: "Erreur", description: "Échec de la suppression.", variant: "destructive" });
    }
  };

  const l = {
    fr: { title: 'Structures', search: 'Rechercher une structure...', newStructure: 'Nouvelle structure', total: 'Total', active: 'Actives', children: 'Enfants suivis', professionals: 'Professionnels', all: 'Tous', allTypes: 'Tous les types', overview: 'Aperçu', team: 'Équipe', stats: 'Statistiques', region: 'Région', district: 'District', address: 'Adresse', phone: 'Téléphone', email: 'Email', director: 'Directeur', coverage: 'Couverture', screened: 'Dépistés', lastActivity: 'Dernière activité', since: 'Depuis', type: 'Type', name: 'Nom', description: 'Description', create: 'Créer', cancel: 'Annuler', activate: 'Activer', suspend: 'Suspendre', delete: 'Supprimer', actions: 'Actions', noResults: 'Aucune structure', selectStructure: 'Sélectionnez une structure', monthlyActivity: 'Activité mensuelle', referred: 'Orientés' },
    en: { title: 'Structures', search: 'Search structures...', newStructure: 'New structure', total: 'Total', active: 'Active', children: 'Children followed', professionals: 'Professionals', all: 'All', allTypes: 'All types', overview: 'Overview', team: 'Team', stats: 'Statistics', region: 'Region', district: 'District', address: 'Address', phone: 'Phone', email: 'Email', director: 'Director', coverage: 'Coverage', screened: 'Screened', lastActivity: 'Last activity', since: 'Since', type: 'Type', name: 'Name', description: 'Description', create: 'Create', cancel: 'Cancel', activate: 'Activate', suspend: 'Suspend', delete: 'Delete', actions: 'Actions', noResults: 'No structures', selectStructure: 'Select a structure', monthlyActivity: 'Monthly activity', referred: 'Referred' },
    pt: { title: 'Estruturas', search: 'Pesquisar estruturas...', newStructure: 'Nova estrutura', total: 'Total', active: 'Ativas', children: 'Crianças seguidas', professionals: 'Profissionais', all: 'Todos', allTypes: 'Todos os tipos', overview: 'Visão geral', team: 'Equipe', stats: 'Estatísticas', region: 'Região', district: 'Distrito', address: 'Endereço', phone: 'Telefone', email: 'Email', director: 'Diretor', coverage: 'Cobertura', screened: 'Triados', lastActivity: 'Última atividade', since: 'Desde', type: 'Tipo', name: 'Nome', description: 'Descrição', create: 'Criar', cancel: 'Cancelar', activate: 'Ativar', suspend: 'Suspender', delete: 'Excluir', actions: 'Ações', noResults: 'Nenhuma estrutura', selectStructure: 'Selecione uma estrutura', monthlyActivity: 'Atividade mensal', referred: 'Encaminhados' },
    ar: { title: 'الهياكل', search: 'البحث عن هيكل...', newStructure: 'هيكل جديد', total: 'الإجمالي', active: 'نشطة', children: 'أطفال متابعون', professionals: 'مهنيون', all: 'الكل', allTypes: 'جميع الأنواع', overview: 'نظرة عامة', team: 'الفريق', stats: 'الإحصائيات', region: 'المنطقة', district: 'المقاطعة', address: 'العنوان', phone: 'الهاتف', email: 'البريد', director: 'المدير', coverage: 'التغطية', screened: 'مفحوصون', lastActivity: 'آخر نشاط', since: 'منذ', type: 'النوع', name: 'الاسم', description: 'الوصف', create: 'إنشاء', cancel: 'إلغاء', activate: 'تفعيل', suspend: 'تعليق', delete: 'حذف', actions: 'إجراءات', noResults: 'لا توجد هياكل', selectStructure: 'اختر هيكلاً', monthlyActivity: 'النشاط الشهري', referred: 'محالون' },
  }[lang] || { title: 'Structures', search: 'Rechercher...', newStructure: 'Nouvelle', total: 'Total', active: 'Actives', children: 'Enfants', professionals: 'Pros', all: 'Tous', allTypes: 'Types', overview: 'Aperçu', team: 'Équipe', stats: 'Stats', region: 'Région', district: 'District', address: 'Adresse', phone: 'Tél', email: 'Email', director: 'Directeur', coverage: 'Couverture', screened: 'Dépistés', lastActivity: 'Activité', since: 'Depuis', type: 'Type', name: 'Nom', description: 'Description', create: 'Créer', cancel: 'Annuler', activate: 'Activer', suspend: 'Suspendre', delete: 'Supprimer', actions: 'Actions', noResults: 'Aucune', selectStructure: 'Sélectionner', monthlyActivity: 'Mensuel', referred: 'Orientés' };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{l.title}</h1>
            <p className="text-muted-foreground text-sm">{stats.total} structures</p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />{l.newStructure}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle className="flex items-center gap-2"><Building className="h-5 w-5" />{l.newStructure}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>{l.name} *</Label><Input value={newStructure.name} onChange={e => setNewStructure(p => ({ ...p, name: e.target.value }))} className="mt-1" /></div>
                  <div>
                    <Label>{l.type}</Label>
                    <Select value={newStructure.type} onValueChange={v => setNewStructure(p => ({ ...p, type: v as StructureType }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeConfig).map(([key, cfg]) => <SelectItem key={key} value={key}>{cfg.label[lang]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>{l.region}</Label><Input value={newStructure.region} onChange={e => setNewStructure(p => ({ ...p, region: e.target.value }))} className="mt-1" /></div>
                  <div><Label>{l.district}</Label><Input value={newStructure.district} onChange={e => setNewStructure(p => ({ ...p, district: e.target.value }))} className="mt-1" /></div>
                </div>
                <div><Label>{l.address}</Label><Input value={newStructure.address} onChange={e => setNewStructure(p => ({ ...p, address: e.target.value }))} className="mt-1" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>{l.phone}</Label><Input value={newStructure.phone} onChange={e => setNewStructure(p => ({ ...p, phone: e.target.value }))} className="mt-1" /></div>
                  <div><Label>{l.email}</Label><Input type="email" value={newStructure.email} onChange={e => setNewStructure(p => ({ ...p, email: e.target.value }))} className="mt-1" /></div>
                </div>
                <div><Label>{l.director}</Label><Input value={newStructure.director} onChange={e => setNewStructure(p => ({ ...p, director: e.target.value }))} className="mt-1" /></div>
                <div><Label>{l.description}</Label><Textarea value={newStructure.description} onChange={e => setNewStructure(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={2} /></div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreate(false)}>{l.cancel}</Button>
                  <Button onClick={handleCreate} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {l.create}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: l.total, value: stats.total, icon: Building, color: 'text-primary' },
            { label: l.active, value: stats.active, icon: CheckCircle2, color: 'text-emerald-500' },
            { label: l.children, value: stats.children, icon: Baby, color: 'text-blue-500' },
            { label: l.professionals, value: stats.professionals, icon: Users, color: 'text-violet-500' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${s.color}`}><s.icon className="h-5 w-5" /></div>
                <div><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={l.search} className="pl-10" />
          </div>
          <Select value={typeFilter} onValueChange={v => setTypeFilter(v as StructureType)}>
            <SelectTrigger className="w-full sm:w-48"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{l.allTypes}</SelectItem>
              {Object.entries(typeConfig).map(([key, cfg]) => <SelectItem key={key} value={key}>{cfg.label[lang]}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as StructureStatus)}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{l.all}</SelectItem>
              {Object.entries(statusConfig).map(([key, cfg]) => <SelectItem key={key} value={key}>{cfg.label[lang]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {isLoading ? (
           <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="lg:col-span-1 space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {filtered.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground"><Building className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>{l.noResults}</p></CardContent></Card>
              ) : filtered.map(s => (
                <Card key={s.id} className={`cursor-pointer transition-all hover:shadow-md ${selected?.id === s.id ? 'ring-2 ring-primary' : ''}`} onClick={() => { setSelected(s); setActiveTab('overview'); }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${typeConfig[s.type]?.bg} ${typeConfig[s.type]?.color}`}><Building className="h-4 w-4" /></div>
                        <div>
                          <p className="font-medium text-sm text-foreground leading-tight">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.region} • {s.district}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Baby className="h-3 w-3" />{s.childrenFollowed}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{s.professionals}</span>
                      </div>
                      <Badge className={`text-xs ${statusConfig[s.status]?.style}`}>{statusConfig[s.status]?.label[lang]}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detail */}
            <div className="lg:col-span-2">
              {selected ? (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${typeConfig[selected.type]?.bg} ${typeConfig[selected.type]?.color}`}>{typeConfig[selected.type]?.label[lang]}</Badge>
                          <Badge className={`text-xs ${statusConfig[selected.status]?.style}`}>{statusConfig[selected.status]?.label[lang]}</Badge>
                        </div>
                        <CardTitle className="text-xl">{selected.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{selected.region} • {selected.district}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="overview">{l.overview}</TabsTrigger>
                        <TabsTrigger value="team">{l.team} ({selected.team.length})</TabsTrigger>
                        <TabsTrigger value="stats">{l.stats}</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4 mt-4">
                        {/* Metrics */}
                        <div className="grid grid-cols-4 gap-3">
                          {[
                            { label: l.children, value: selected.childrenFollowed, icon: Baby },
                            { label: l.screened, value: selected.screened, icon: Activity },
                            { label: l.professionals, value: selected.professionals, icon: Users },
                            { label: l.coverage, value: `${selected.coverage}%`, icon: TrendingUp },
                          ].map(m => (
                            <div key={m.label} className="bg-muted/50 rounded-lg p-3 text-center">
                              <m.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-lg font-bold text-foreground">{m.value}</p>
                              <p className="text-xs text-muted-foreground">{m.label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2"><UserCheck className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{l.director}:</span><span className="font-medium text-foreground">{selected.director}</span></div>
                            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">{selected.phone}</span></div>
                            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">{selected.email}</span></div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">{selected.address}</span></div>
                            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{l.since}:</span><span className="text-foreground">{selected.createdAt}</span></div>
                            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{l.lastActivity}:</span><span className="text-foreground">{selected.lastActivity}</span></div>
                          </div>
                        </div>

                        {selected.description && <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">{selected.description}</p>}

                        {/* Actions */}
                        <div className="border-t border-border pt-4 flex flex-wrap gap-2">
                          {selected.status !== 'active' && <Button size="sm" onClick={() => updateStatus(selected.id, 'active')}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />{l.activate}</Button>}
                          {selected.status === 'active' && <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, 'suspended')}><AlertTriangle className="h-3.5 w-3.5 mr-1" />{l.suspend}</Button>}
                          <Button size="sm" variant="destructive" onClick={() => deleteStructure(selected.id)}><Trash2 className="h-3.5 w-3.5 mr-1" />{l.delete}</Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="team" className="space-y-3 mt-4">
                        {selected.team.length === 0 ? (
                          <p className="text-center text-muted-foreground py-6">{l.noResults}</p>
                        ) : selected.team.map((member, i) => (
                          <Card key={i}>
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground">
                                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-foreground">{member.name}</p>
                                  <p className="text-xs text-muted-foreground">{member.role}</p>
                                </div>
                              </div>
                              <Badge className={`text-xs ${member.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-muted text-muted-foreground'}`}>
                                {member.status === 'active' ? (lang === 'fr' ? 'Actif' : 'Active') : (lang === 'fr' ? 'Inactif' : 'Inactive')}
                              </Badge>
                            </CardContent>
                          </Card>
                        ))}
                      </TabsContent>

                      <TabsContent value="stats" className="mt-4">
                        <div className="space-y-4">
                          <h3 className="font-medium text-foreground">{l.monthlyActivity}</h3>
                          {selected.monthlyStats.length === 0 ? (
                            <p className="text-center text-muted-foreground py-6">{l.noResults}</p>
                          ) : (
                            <div className="space-y-2">
                              {selected.monthlyStats.map((ms, i) => {
                                const maxVal = Math.max(...selected.monthlyStats.map(s => s.screened));
                                return (
                                  <div key={i} className="flex items-center gap-3">
                                    <span className="w-10 text-xs text-muted-foreground">{ms.month}</span>
                                    <div className="flex-1 flex items-center gap-2">
                                      <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden relative">
                                        <div className="h-full bg-primary/70 rounded-full transition-all" style={{ width: `${(ms.screened / maxVal) * 100}%` }} />
                                        <span className="absolute inset-0 flex items-center pl-2 text-xs font-medium text-foreground">{ms.screened} {l.screened.toLowerCase()}</span>
                                      </div>
                                      <Badge variant="outline" className="text-xs whitespace-nowrap">{ms.referred} {l.referred.toLowerCase()}</Badge>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Coverage progress */}
                          <div className="bg-muted/50 rounded-lg p-4 mt-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">{l.coverage}</span>
                              <span className="font-bold text-foreground">{selected.coverage}%</span>
                            </div>
                            <div className="h-3 bg-background rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${selected.coverage}%` }} />
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    <Building className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>{l.selectStructure}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StructuresModule;