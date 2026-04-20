import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext'; // <-- AJOUT
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Plus, Search, Calendar, User, AlertTriangle, CheckCircle, Clock, Filter, FileText, ArrowLeft, Trash2, Edit, Loader2 } from 'lucide-react'; // <-- AJOUT Loader2
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase'; // <-- AJOUT
import { useToast } from '@/hooks/use-toast'; // <-- AJOUT

interface Observation {
  id: string;
  studentName: string;
  studentClass: string;
  date: string;
  domain: 'behavior' | 'language' | 'motor' | 'social' | 'cognitive' | 'emotional';
  severity: 'low' | 'medium' | 'high';
  context: string;
  description: string;
  actions: string;
  status: 'draft' | 'submitted' | 'reviewed';
  db_id?: string; // <-- AJOUT ID Supabase
}

const domainLabels: Record<string, { fr: string; color: string; bg: string }> = {
  behavior: { fr: 'Comportement', color: 'text-red-700', bg: 'bg-red-100 dark:bg-red-950/30' },
  language: { fr: 'Langage', color: 'text-blue-700', bg: 'bg-blue-100 dark:bg-blue-950/30' },
  motor: { fr: 'Motricité', color: 'text-emerald-700', bg: 'bg-emerald-100 dark:bg-emerald-950/30' },
  social: { fr: 'Social', color: 'text-violet-700', bg: 'bg-violet-100 dark:bg-violet-950/30' },
  cognitive: { fr: 'Cognitif', color: 'text-amber-700', bg: 'bg-amber-100 dark:bg-amber-950/30' },
  emotional: { fr: 'Émotionnel', color: 'text-rose-700', bg: 'bg-rose-100 dark:bg-rose-950/30' },
};

const severityLabels: Record<string, { fr: string; color: string; bg: string }> = {
  low: { fr: 'Faible', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  medium: { fr: 'Modéré', color: 'text-amber-700', bg: 'bg-amber-100' },
  high: { fr: 'Élevé', color: 'text-red-700', bg: 'bg-red-100' },
};

const statusLabels: Record<string, { fr: string; icon: React.ElementType; color: string }> = {
  draft: { fr: 'Brouillon', icon: Edit, color: 'text-muted-foreground' },
  submitted: { fr: 'Soumise', icon: Clock, color: 'text-blue-600' },
  reviewed: { fr: 'Revue', icon: CheckCircle, color: 'text-emerald-600' },
};

const ObservationsModule: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [observations, setObservations] = useState<Observation[]>([]); // <-- INITIALISATION VIDE
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [filterDomain, setFilterDomain] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedObs, setSelectedObs] = useState<Observation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  // Form state
  const [form, setForm] = useState({
    studentName: '', studentClass: '', domain: 'behavior' as Observation['domain'],
    severity: 'medium' as Observation['severity'], context: '', description: '', actions: '',
  });

  // --- 1. LECTURE DEPUIS SUPABASE ---
  const fetchObservations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('teacher_observations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedObs: Observation[] = data.map(o => ({
          id: o.id,
          db_id: o.id,
          studentName: o.student_name,
          studentClass: o.student_class,
          date: new Date(o.observation_date).toISOString().split('T')[0],
          domain: o.domain as Observation['domain'],
          severity: o.severity as Observation['severity'],
          context: o.context,
          description: o.description,
          actions: o.actions || '',
          status: o.status as Observation['status']
        }));
        setObservations(formattedObs);
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: "Impossible de charger les observations.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchObservations();
  }, [user]);

  const filtered = observations.filter(o => {
    const matchSearch = o.studentName.toLowerCase().includes(search.toLowerCase()) || o.description.toLowerCase().includes(search.toLowerCase());
    const matchDomain = filterDomain === 'all' || o.domain === filterDomain;
    const matchSeverity = filterSeverity === 'all' || o.severity === filterSeverity;
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchDomain && matchSeverity && matchStatus;
  });

  const stats = {
    total: observations.length,
    high: observations.filter(o => o.severity === 'high').length,
    pending: observations.filter(o => o.status === 'submitted').length,
    reviewed: observations.filter(o => o.status === 'reviewed').length,
  };

  // --- 2. CRÉATION EN DB ---
  const handleSubmit = async (asDraft: boolean) => {
    if (!form.studentName || !form.description || (!asDraft && !form.context)) return;
    setIsSubmitting(true);

    try {
      const statusToSave = asDraft ? 'draft' : 'submitted';
      
      const payload = {
        user_id: user?.id,
        student_name: form.studentName,
        student_class: form.studentClass,
        observation_date: new Date().toISOString().split('T')[0],
        domain: form.domain,
        severity: form.severity,
        context: form.context,
        description: form.description,
        actions: form.actions,
        status: statusToSave
      };

      const { error } = await supabase.from('teacher_observations').insert([payload]);
      if (error) throw error;

      toast({ title: "Succès", description: asDraft ? "Brouillon sauvegardé" : "Observation soumise" });
      setForm({ studentName: '', studentClass: '', domain: 'behavior', severity: 'medium', context: '', description: '', actions: '' });
      setShowForm(false);
      setActiveTab('list');
      fetchObservations();

    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. SUPPRESSION EN DB ---
  const handleDelete = async (id: string) => {
    const obs = observations.find(o => o.id === id);
    if (!obs || !obs.db_id) return;

    try {
      const { error } = await supabase.from('teacher_observations').delete().eq('id', obs.db_id);
      if (error) throw error;
      
      setObservations(prev => prev.filter(o => o.id !== id));
      setSelectedObs(null);
      toast({ title: "Succès", description: "Observation supprimée" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  // --- 4. MISE À JOUR DU STATUT EN DB ---
  const handleStatusUpdate = async (id: string, newStatus: Observation['status']) => {
    const obs = observations.find(o => o.id === id);
    if (!obs || !obs.db_id) return;

    try {
      const { error } = await supabase.from('teacher_observations').update({ status: newStatus }).eq('id', obs.db_id);
      if (error) throw error;

      setObservations(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      setSelectedObs(prev => prev ? { ...prev, status: newStatus } : null);
      toast({ title: "Succès", description: "Statut mis à jour" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  if (selectedObs) {
    const domain = domainLabels[selectedObs.domain] || domainLabels.behavior;
    const severity = severityLabels[selectedObs.severity] || severityLabels.medium;
    const status = statusLabels[selectedObs.status] || statusLabels.draft;
    const StatusIcon = status.icon;

    return (
      <DashboardLayout>
        <Button variant="ghost" onClick={() => setSelectedObs(null)} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Retour aux observations
        </Button>

        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <User className="h-5 w-5" /> {selectedObs.studentName}
                    <span className="text-sm font-normal text-muted-foreground">({selectedObs.studentClass})</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {new Date(selectedObs.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon className={`h-4 w-4 ${status.color}`} />
                  <span className={`text-sm font-medium ${status.color}`}>{status.fr}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${domain.bg} ${domain.color}`}>{domain.fr}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${severity.bg} ${severity.color}`}>Sévérité : {severity.fr}</span>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-1 text-muted-foreground">Contexte</h3>
                <p className="text-sm">{selectedObs.context}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-1 text-muted-foreground">Description de l'observation</h3>
                <p className="text-sm leading-relaxed">{selectedObs.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-1 text-muted-foreground">Actions mises en place</h3>
                <p className="text-sm">{selectedObs.actions || <span className="italic text-slate-400">Aucune action précisée</span>}</p>
              </div>

              <div className="flex gap-2 pt-2">
                {selectedObs.status === 'draft' && (
                  <Button size="sm" onClick={() => handleStatusUpdate(selectedObs.id, 'submitted')}>Soumettre</Button>
                )}
                {/* Exemple optionnel d'un bouton de revue pour les admins/psy */}
                {selectedObs.status === 'submitted' && (
                  <Button size="sm" variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50" onClick={() => handleStatusUpdate(selectedObs.id, 'reviewed')}>Marquer comme revue</Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => handleDelete(selectedObs.id)} className="gap-1">
                  <Trash2 className="h-3.5 w-3.5" /> Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Eye className="h-6 w-6 text-blue-500" /> Observations</h1>
          <p className="text-muted-foreground text-sm">Gérez et documentez les observations comportementales et développementales des élèves</p>
        </div>
        <Button onClick={() => { setShowForm(true); setActiveTab('new'); }} className="gap-2">
          <Plus className="h-4 w-4" /> Nouvelle observation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total observations', value: stats.total, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Sévérité élevée', value: stats.high, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'En attente de revue', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Revues', value: stats.reviewed, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Liste</TabsTrigger>
          <TabsTrigger value="new">Nouvelle observation</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un élève ou une observation..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterDomain} onValueChange={setFilterDomain}>
              <SelectTrigger className="w-[160px]"><Filter className="h-3.5 w-3.5 mr-1" /><SelectValue placeholder="Domaine" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les domaines</SelectItem>
                {Object.entries(domainLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v.fr}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Sévérité" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {Object.entries(severityLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v.fr}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v.fr}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          {isLoading ? (
             <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground">Aucune observation trouvée</CardContent></Card>
              ) : (
                filtered.map(obs => {
                  const domain = domainLabels[obs.domain] || domainLabels.behavior;
                  const severity = severityLabels[obs.severity] || severityLabels.medium;
                  const status = statusLabels[obs.status] || statusLabels.draft;
                  const StatusIcon = status.icon;
                  return (
                    <Card key={obs.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedObs(obs)}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{obs.studentName}</span>
                              <span className="text-xs text-muted-foreground">({obs.studentClass})</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${domain.bg} ${domain.color}`}>{domain.fr}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${severity.bg} ${severity.color}`}>{severity.fr}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{obs.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-xs text-muted-foreground">{new Date(obs.date).toLocaleDateString('fr-FR')}</span>
                            <div className={`flex items-center gap-1 ${status.color}`}>
                              <StatusIcon className="h-3.5 w-3.5" />
                              <span className="text-xs">{status.fr}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nouvelle observation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom de l'élève *</Label>
                  <Input placeholder="Ex: Amara K." value={form.studentName} onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Classe *</Label>
                  <Input placeholder="Ex: CP1, CE2..." value={form.studentClass} onChange={e => setForm(f => ({ ...f, studentClass: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Domaine</Label>
                  <Select value={form.domain} onValueChange={v => setForm(f => ({ ...f, domain: v as Observation['domain'] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(domainLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v.fr}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Niveau de sévérité</Label>
                  <Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v as Observation['severity'] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(severityLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v.fr}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Contexte de l'observation *</Label>
                <Input placeholder="Ex: En classe pendant les exercices de lecture..." value={form.context} onChange={e => setForm(f => ({ ...f, context: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>Description détaillée *</Label>
                <Textarea rows={4} placeholder="Décrivez ce que vous avez observé..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>Actions mises en place</Label>
                <Textarea rows={2} placeholder="Décrivez les mesures prises..." value={form.actions} onChange={e => setForm(f => ({ ...f, actions: e.target.value }))} />
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={() => handleSubmit(false)} disabled={!form.studentName || !form.description || !form.context || isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  Soumettre l'observation
                </Button>
                <Button variant="outline" onClick={() => handleSubmit(true)} disabled={!form.studentName || !form.description || isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  Enregistrer comme brouillon
                </Button>
                <Button variant="ghost" onClick={() => { setShowForm(false); setActiveTab('list'); }}>Annuler</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ObservationsModule;