import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext'; // <-- AJOUT
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
  Users, Search, Plus, Phone, MapPin, Baby, Calendar, ArrowRightLeft,
  Home, AlertTriangle, CheckCircle2, Clock, Eye, Edit, MessageSquare,
  UserPlus, ChevronRight, Activity, FileText, Heart, Loader2 // <-- AJOUT Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase'; // <-- AJOUT
import { useToast } from '@/hooks/use-toast'; // <-- AJOUT

type FamilyStatus = 'all' | 'active' | 'pending' | 'urgent' | 'referred' | 'closed';

interface Child {
  id: string;
  name: string;
  age: string;
  concern: string;
  status: 'identified' | 'referred' | 'in_care' | 'follow_up';
  referredTo?: string;
}

interface Visit {
  id: string;
  date: string;
  type: string;
  notes: string;
  outcome: string;
}

interface Family {
  id: string;
  name: string;
  parentName: string;
  phone: string;
  area: string;
  address: string;
  status: FamilyStatus;
  childrenCount: number;
  children: Child[];
  visits: Visit[];
  lastVisit: string;
  nextVisit?: string;
  notes: string;
  createdAt: string;
  priority: boolean;
  db_id?: string; // <-- AJOUT ID Supabase
}

const statusConfig: Record<string, { label: Record<string, string>; style: string; icon: React.ElementType }> = {
  active: { label: { fr: 'Actif', en: 'Active', pt: 'Ativo', ar: 'نشط' }, style: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  pending: { label: { fr: 'En attente', en: 'Pending', pt: 'Pendente', ar: 'معلق' }, style: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  urgent: { label: { fr: 'Urgent', en: 'Urgent', pt: 'Urgente', ar: 'عاجل' }, style: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle },
  referred: { label: { fr: 'Orientée', en: 'Referred', pt: 'Encaminhada', ar: 'محالة' }, style: 'bg-blue-100 text-blue-800 border-blue-200', icon: ArrowRightLeft },
  closed: { label: { fr: 'Clôturée', en: 'Closed', pt: 'Encerrada', ar: 'مغلقة' }, style: 'bg-muted text-muted-foreground border-border', icon: CheckCircle2 },
};

const childStatusConfig: Record<string, { label: Record<string, string>; style: string }> = {
  identified: { label: { fr: 'Repéré', en: 'Identified', pt: 'Identificado', ar: 'محدد' }, style: 'bg-amber-100 text-amber-800' },
  referred: { label: { fr: 'Orienté', en: 'Referred', pt: 'Encaminhado', ar: 'محال' }, style: 'bg-blue-100 text-blue-800' },
  in_care: { label: { fr: 'En PEC', en: 'In care', pt: 'Em tratamento', ar: 'في الرعاية' }, style: 'bg-emerald-100 text-emerald-800' },
  follow_up: { label: { fr: 'Suivi', en: 'Follow-up', pt: 'Acompanhamento', ar: 'متابعة' }, style: 'bg-muted text-muted-foreground' },
};

const FamiliesModule: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [families, setFamilies] = useState<Family[]>([]); // <-- INITIALISATION VIDE
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FamilyStatus>('all');
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewFamily, setShowNewFamily] = useState(false);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [newFamily, setNewFamily] = useState({ name: '', parentName: '', phone: '', area: '', address: '', notes: '' });
  const [newVisit, setNewVisit] = useState({ type: 'Visite à domicile', notes: '', outcome: '' });

  // --- 1. LECTURE DEPUIS SUPABASE ---
  const fetchFamilies = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('families').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      if (data) {
        const formattedFamilies: Family[] = data.map(d => ({
          id: d.id, // ID local
          db_id: d.id, // ID Supabase
          name: d.name,
          parentName: d.parent_name || '',
          phone: d.phone || '',
          area: d.location || '',
          address: d.address || '',
          status: d.status as FamilyStatus,
          childrenCount: d.children_count || 0,
          children: d.children_data || [],
          visits: d.visits_data || [],
          lastVisit: d.last_visit || '-',
          nextVisit: d.next_visit || undefined,
          notes: d.notes || '',
          createdAt: new Date(d.created_at).toISOString().split('T')[0],
          priority: d.priority || false
        }));
        setFamilies(formattedFamilies);
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: "Impossible de charger les familles.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, [user]);

  const filtered = families.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.parentName.toLowerCase().includes(search.toLowerCase()) ||
      f.area.toLowerCase().includes(search.toLowerCase()) ||
      f.children.some(c => c.name.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: families.length,
    active: families.filter(f => f.status === 'active').length,
    urgent: families.filter(f => f.status === 'urgent').length,
    children: families.reduce((sum, f) => sum + f.childrenCount, 0),
  };

  // --- 2. CRÉATION D'UNE FAMILLE ---
  const handleCreateFamily = async () => {
    if (!newFamily.name.trim() || !newFamily.parentName.trim()) return;
    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const payload = {
        user_id: user?.id,
        name: newFamily.name,
        parent_name: newFamily.parentName,
        phone: newFamily.phone,
        location: newFamily.area,
        address: newFamily.address,
        notes: newFamily.notes,
        status: 'pending',
        children_count: 0,
        priority: false,
        last_visit: today,
        children_data: [],
        visits_data: []
      };

      const { error } = await supabase.from('families').insert([payload]);
      if (error) throw error;

      toast({ title: "Succès", description: "Famille ajoutée." });
      setNewFamily({ name: '', parentName: '', phone: '', area: '', address: '', notes: '' });
      setShowNewFamily(false);
      fetchFamilies(); // Rafraîchir
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. AJOUT D'UNE VISITE ---
  const handleAddVisit = async () => {
    if (!selectedFamily || !selectedFamily.db_id || !newVisit.notes.trim()) return;
    setIsSubmitting(true);

    try {
      const visitDate = new Date().toISOString().split('T')[0];
      const visit: Visit = {
        id: Date.now().toString(),
        date: visitDate,
        type: newVisit.type,
        notes: newVisit.notes,
        outcome: newVisit.outcome,
      };

      const updatedVisits = [visit, ...selectedFamily.visits];

      // Mise à jour DB
      const { error } = await supabase.from('families').update({
        visits_data: updatedVisits,
        last_visit: visitDate
      }).eq('id', selectedFamily.db_id);

      if (error) throw error;

      // Mise à jour locale
      setFamilies(prev => prev.map(f => f.id === selectedFamily.id
        ? { ...f, visits: updatedVisits, lastVisit: visitDate }
        : f
      ));
      setSelectedFamily(prev => prev ? { ...prev, visits: updatedVisits, lastVisit: visitDate } : null);
      
      setNewVisit({ type: 'Visite à domicile', notes: '', outcome: '' });
      setShowAddVisit(false);
      toast({ title: "Visite ajoutée", description: "La note de visite a été enregistrée." });

    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 4. MODIFIER LA PRIORITÉ ---
  const togglePriority = async (id: string) => {
    const familyToUpdate = families.find(f => f.id === id);
    if (!familyToUpdate || !familyToUpdate.db_id) return;
    
    const newPriority = !familyToUpdate.priority;

    // Mise à jour locale (optimiste)
    setFamilies(prev => prev.map(f => f.id === id ? { ...f, priority: newPriority } : f));
    if (selectedFamily?.id === id) setSelectedFamily(prev => prev ? { ...prev, priority: newPriority } : null);

    // Mise à jour DB
    try {
      const { error } = await supabase.from('families').update({ priority: newPriority }).eq('id', familyToUpdate.db_id);
      if (error) throw error;
    } catch (err: any) {
      toast({ title: "Erreur de synchro", description: "Impossible de mettre à jour la priorité.", variant: "destructive" });
    }
  };

  const l = {
    fr: { title: 'Familles suivies', search: 'Rechercher une famille...', newFamily: 'Nouvelle famille', total: 'Total', active: 'Actives', urgent: 'Urgentes', children: 'Enfants suivis', overview: 'Aperçu', childrenTab: 'Enfants', visits: 'Visites', notes: 'Notes', parent: 'Référent', phone: 'Téléphone', area: 'Zone', address: 'Adresse', since: 'Suivie depuis', lastVisit: 'Dernière visite', nextVisit: 'Prochaine visite', concern: 'Motif', referredTo: 'Orienté vers', addVisit: 'Ajouter visite', visitType: 'Type de visite', visitNotes: 'Notes de visite', outcome: 'Issue/Décision', save: 'Enregistrer', cancel: 'Annuler', familyName: 'Nom de famille', parentNameLabel: 'Nom du référent', create: 'Créer', noResults: 'Aucune famille trouvée', selectFamily: 'Sélectionnez une famille', priority: 'Prioritaire', all: 'Toutes' },
    en: { title: 'Followed families', search: 'Search families...', newFamily: 'New family', total: 'Total', active: 'Active', urgent: 'Urgent', children: 'Children followed', overview: 'Overview', childrenTab: 'Children', visits: 'Visits', notes: 'Notes', parent: 'Contact', phone: 'Phone', area: 'Area', address: 'Address', since: 'Followed since', lastVisit: 'Last visit', nextVisit: 'Next visit', concern: 'Concern', referredTo: 'Referred to', addVisit: 'Add visit', visitType: 'Visit type', visitNotes: 'Visit notes', outcome: 'Outcome', save: 'Save', cancel: 'Cancel', familyName: 'Family name', parentNameLabel: 'Contact name', create: 'Create', noResults: 'No families found', selectFamily: 'Select a family', priority: 'Priority', all: 'All' },
    pt: { title: 'Famílias acompanhadas', search: 'Pesquisar famílias...', newFamily: 'Nova família', total: 'Total', active: 'Ativas', urgent: 'Urgentes', children: 'Crianças seguidas', overview: 'Visão geral', childrenTab: 'Crianças', visits: 'Visitas', notes: 'Notas', parent: 'Referente', phone: 'Telefone', area: 'Zona', address: 'Endereço', since: 'Acompanhada desde', lastVisit: 'Última visita', nextVisit: 'Próxima visita', concern: 'Motivo', referredTo: 'Encaminhado para', addVisit: 'Adicionar visita', visitType: 'Tipo de visita', visitNotes: 'Notas da visita', outcome: 'Resultado', save: 'Salvar', cancel: 'Cancelar', familyName: 'Nome da família', parentNameLabel: 'Nome do referente', create: 'Criar', noResults: 'Nenhuma família encontrada', selectFamily: 'Selecione uma família', priority: 'Prioritária', all: 'Todas' },
    ar: { title: 'العائلات المتابعة', search: 'البحث عن عائلة...', newFamily: 'عائلة جديدة', total: 'الإجمالي', active: 'نشطة', urgent: 'عاجلة', children: 'الأطفال المتابعون', overview: 'نظرة عامة', childrenTab: 'الأطفال', visits: 'الزيارات', notes: 'الملاحظات', parent: 'المرجع', phone: 'الهاتف', area: 'المنطقة', address: 'العنوان', since: 'متابعة منذ', lastVisit: 'آخر زيارة', nextVisit: 'الزيارة القادمة', concern: 'السبب', referredTo: 'محال إلى', addVisit: 'إضافة زيارة', visitType: 'نوع الزيارة', visitNotes: 'ملاحظات الزيارة', outcome: 'النتيجة', save: 'حفظ', cancel: 'إلغاء', familyName: 'اسم العائلة', parentNameLabel: 'اسم المرجع', create: 'إنشاء', noResults: 'لم يتم العثور على عائلات', selectFamily: 'اختر عائلة', priority: 'أولوية', all: 'الكل' },
  }[lang] || {
    title: 'Familles suivies', search: 'Rechercher...', newFamily: 'Nouvelle famille', total: 'Total', active: 'Actives', urgent: 'Urgentes', children: 'Enfants', overview: 'Aperçu', childrenTab: 'Enfants', visits: 'Visites', notes: 'Notes', parent: 'Référent', phone: 'Tél', area: 'Zone', address: 'Adresse', since: 'Depuis', lastVisit: 'Dernière visite', nextVisit: 'Prochaine', concern: 'Motif', referredTo: 'Orienté vers', addVisit: 'Ajouter', visitType: 'Type', visitNotes: 'Notes', outcome: 'Issue', save: 'Enregistrer', cancel: 'Annuler', familyName: 'Nom', parentNameLabel: 'Référent', create: 'Créer', noResults: 'Aucune', selectFamily: 'Sélectionner', priority: 'Prioritaire', all: 'Toutes'
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{l.title}</h1>
            <p className="text-muted-foreground text-sm">{stats.total} {l.title.toLowerCase()}</p>
          </div>
          <Dialog open={showNewFamily} onOpenChange={setShowNewFamily}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />{l.newFamily}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />{l.newFamily}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{l.familyName} *</Label>
                    <Input value={newFamily.name} onChange={e => setNewFamily(p => ({ ...p, name: e.target.value }))} placeholder="Famille..." className="mt-1" />
                  </div>
                  <div>
                    <Label>{l.parentNameLabel} *</Label>
                    <Input value={newFamily.parentName} onChange={e => setNewFamily(p => ({ ...p, parentName: e.target.value }))} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{l.phone}</Label>
                    <Input value={newFamily.phone} onChange={e => setNewFamily(p => ({ ...p, phone: e.target.value }))} placeholder="+225..." className="mt-1" />
                  </div>
                  <div>
                    <Label>{l.area}</Label>
                    <Input value={newFamily.area} onChange={e => setNewFamily(p => ({ ...p, area: e.target.value }))} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label>{l.address}</Label>
                  <Input value={newFamily.address} onChange={e => setNewFamily(p => ({ ...p, address: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>{l.notes}</Label>
                  <Textarea value={newFamily.notes} onChange={e => setNewFamily(p => ({ ...p, notes: e.target.value }))} className="mt-1" rows={3} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewFamily(false)}>{l.cancel}</Button>
                  <Button onClick={handleCreateFamily} disabled={isSubmitting}>
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
            { label: l.total, value: stats.total, icon: Users, color: 'text-primary' },
            { label: l.active, value: stats.active, icon: CheckCircle2, color: 'text-emerald-500' },
            { label: l.urgent, value: stats.urgent, icon: AlertTriangle, color: 'text-red-500' },
            { label: l.children, value: stats.children, icon: Baby, color: 'text-blue-500' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${s.color}`}><s.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
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
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as FamilyStatus)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{l.all}</SelectItem>
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label[lang]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Family list */}
          <div className="lg:col-span-1 space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {isLoading ? (
               <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground"><Users className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>{l.noResults}</p></CardContent></Card>
            ) : filtered.map(family => (
              <Card
                key={family.id}
                className={`cursor-pointer transition-all hover:shadow-md ${selectedFamily?.id === family.id ? 'ring-2 ring-primary' : ''} ${family.priority ? 'border-l-4 border-l-red-500' : ''}`}
                onClick={() => { setSelectedFamily(family); setActiveTab('overview'); }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        {family.name}
                        {family.priority && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                      </p>
                      <p className="text-xs text-muted-foreground">{family.parentName}</p>
                    </div>
                    <Badge className={`text-xs ${statusConfig[family.status]?.style || ''}`}>
                      {statusConfig[family.status]?.label[lang]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{family.area}</span>
                    <span className="flex items-center gap-1"><Baby className="h-3 w-3" />{family.childrenCount}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{family.lastVisit}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2">
            {selectedFamily ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {selectedFamily.name}
                        {selectedFamily.priority && <Badge className="bg-red-100 text-red-800 text-xs">{l.priority}</Badge>}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{selectedFamily.parentName} • {selectedFamily.area}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant={selectedFamily.priority ? 'destructive' : 'outline'} onClick={() => togglePriority(selectedFamily.id)}>
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                      <Badge className={`${statusConfig[selectedFamily.status]?.style}`}>
                        {statusConfig[selectedFamily.status]?.label[lang]}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-4 w-full">
                      <TabsTrigger value="overview">{l.overview}</TabsTrigger>
                      <TabsTrigger value="children">{l.childrenTab} ({selectedFamily.children.length})</TabsTrigger>
                      <TabsTrigger value="visits">{l.visits} ({selectedFamily.visits.length})</TabsTrigger>
                      <TabsTrigger value="notes">{l.notes}</TabsTrigger>
                    </TabsList>

                    {/* Overview */}
                    <TabsContent value="overview" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{l.parent}:</span><span className="font-medium text-foreground">{selectedFamily.parentName}</span></div>
                          <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{l.phone}:</span><span className="font-medium text-foreground">{selectedFamily.phone}</span></div>
                          <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{l.area}:</span><span className="font-medium text-foreground">{selectedFamily.area}</span></div>
                          <div className="flex items-center gap-2 text-sm"><Home className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{l.address}:</span><span className="font-medium text-foreground">{selectedFamily.address}</span></div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{l.since}:</span><span className="font-medium text-foreground">{selectedFamily.createdAt}</span></div>
                          <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{l.lastVisit}:</span><span className="font-medium text-foreground">{selectedFamily.lastVisit}</span></div>
                          {selectedFamily.nextVisit && <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-emerald-500" /><span className="text-muted-foreground">{l.nextVisit}:</span><span className="font-medium text-emerald-600">{selectedFamily.nextVisit}</span></div>}
                          <div className="flex items-center gap-2 text-sm"><Baby className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{l.children}:</span><span className="font-medium text-foreground">{selectedFamily.childrenCount}</span></div>
                        </div>
                      </div>
                      {/* Quick action buttons */}
                      <div className="flex gap-2 pt-2 border-t border-border">
                        <Button size="sm" variant="outline" onClick={() => setShowAddVisit(true)}><Plus className="h-4 w-4 mr-1" />{l.addVisit}</Button>
                        <Button size="sm" variant="outline"><Phone className="h-4 w-4 mr-1" />{l.phone}</Button>
                        <Button size="sm" variant="outline"><ArrowRightLeft className="h-4 w-4 mr-1" />Orienter</Button>
                      </div>
                    </TabsContent>

                    {/* Children */}
                    <TabsContent value="children" className="space-y-3 mt-4">
                      {selectedFamily.children.length === 0 ? (
                        <p className="text-center text-muted-foreground py-6">Aucun enfant n'a encore été rattaché à ce dossier. Le ratachement est automatique lors des recensements.</p>
                      ) : selectedFamily.children.map(child => (
                        <Card key={child.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-foreground">{child.name}</p>
                                <p className="text-xs text-muted-foreground">{child.age}</p>
                              </div>
                              <Badge className={`text-xs ${childStatusConfig[child.status]?.style || ''}`}>
                                {childStatusConfig[child.status]?.label[lang]}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground/80">{l.concern}:</span> {child.concern}
                            </div>
                            {child.referredTo && (
                              <div className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                                <ArrowRightLeft className="h-3.5 w-3.5" />
                                {l.referredTo}: {child.referredTo}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    {/* Visits */}
                    <TabsContent value="visits" className="space-y-3 mt-4">
                      <div className="flex justify-end">
                        <Button size="sm" onClick={() => setShowAddVisit(true)}><Plus className="h-4 w-4 mr-1" />{l.addVisit}</Button>
                      </div>
                      {selectedFamily.visits.length === 0 ? (
                        <p className="text-center text-muted-foreground py-6">Aucune visite enregistrée pour le moment.</p>
                      ) : selectedFamily.visits.map(visit => (
                        <Card key={visit.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="font-medium text-sm text-foreground">{visit.type}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{visit.date}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{visit.notes}</p>
                            {visit.outcome && (
                              <div className="mt-2 text-xs bg-muted px-2 py-1 rounded inline-block text-foreground/80">
                                → {visit.outcome}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    {/* Notes */}
                    <TabsContent value="notes" className="mt-4">
                      <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground">
                        {selectedFamily.notes || <span className="text-muted-foreground italic">Aucune note</span>}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>{l.selectFamily}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Add Visit Dialog */}
        <Dialog open={showAddVisit} onOpenChange={setShowAddVisit}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Home className="h-5 w-5" />{l.addVisit}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>{l.visitType}</Label>
                <Select value={newVisit.type} onValueChange={v => setNewVisit(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Visite à domicile">Visite à domicile</SelectItem>
                    <SelectItem value="Suivi téléphonique">Suivi téléphonique</SelectItem>
                    <SelectItem value="Repérage communautaire">Repérage communautaire</SelectItem>
                    <SelectItem value="Visite de suivi">Visite de suivi</SelectItem>
                    <SelectItem value="Visite de clôture">Visite de clôture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{l.visitNotes} *</Label>
                <Textarea value={newVisit.notes} onChange={e => setNewVisit(p => ({ ...p, notes: e.target.value }))} className="mt-1" rows={4} />
              </div>
              <div>
                <Label>{l.outcome}</Label>
                <Input value={newVisit.outcome} onChange={e => setNewVisit(p => ({ ...p, outcome: e.target.value }))} className="mt-1" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddVisit(false)}>{l.cancel}</Button>
                <Button onClick={handleAddVisit} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {l.save}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default FamiliesModule;