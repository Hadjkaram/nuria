import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext'; // <-- AJOUT : pour récupérer l'user
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Stethoscope, Search, Plus, ArrowLeft, Calendar, Clock, User, Target,
  CheckCircle2, AlertTriangle, FileText, TrendingUp, Edit, Trash2,
  ChevronRight, Activity, Brain, Heart, Eye, Users, ClipboardList, Loader2 // <-- AJOUT Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase'; // <-- AJOUT : Connexion Supabase
import { useToast } from '@/hooks/use-toast'; // <-- AJOUT : Notifications

interface Objective {
  id: string;
  description: string;
  domain: string;
  targetDate: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'achieved' | 'modified';
  milestones: { id: string; label: string; done: boolean }[];
}

interface Intervention {
  id: string;
  type: string;
  professional: string;
  frequency: string;
  notes: string;
  startDate: string;
}

interface CarePlan {
  id: string;
  childName: string;
  childAge: string;
  diagnosis: string;
  status: 'active' | 'review' | 'completed' | 'draft';
  createdDate: string;
  lastReview: string;
  nextReview: string;
  overallProgress: number;
  coordinator: string;
  objectives: Objective[];
  interventions: Intervention[];
  teamMembers: { name: string; role: string; specialty: string }[];
  notes: { date: string; author: string; content: string }[];
  db_id?: string; // <-- AJOUT : Pour lier l'ID local à l'ID Supabase
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Actif', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <Activity className="h-3 w-3" /> },
  review: { label: 'En révision', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <AlertTriangle className="h-3 w-3" /> },
  completed: { label: 'Terminé', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  draft: { label: 'Brouillon', color: 'bg-muted text-muted-foreground border-border', icon: <FileText className="h-3 w-3" /> },
};

const domainIcons: Record<string, React.ReactNode> = {
  Langage: <Brain className="h-4 w-4 text-violet-500" />,
  Social: <Users className="h-4 w-4 text-blue-500" />,
  Comportement: <Heart className="h-4 w-4 text-rose-500" />,
  Cognitif: <Eye className="h-4 w-4 text-amber-500" />,
  Autonomie: <Target className="h-4 w-4 text-emerald-500" />,
};

const CarePlansModule: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [plans, setPlans] = useState<CarePlan[]>([]); // Vide par défaut (plus de données fictives)
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState<CarePlan | null>(null);
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [newNote, setNewNote] = useState('');

  // New plan form
  const [newPlan, setNewPlan] = useState({ childName: '', childAge: '', diagnosis: '', coordinator: '' });

  // --- 1. LECTURE DEPUIS SUPABASE ---
  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('care_plans')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedPlans: CarePlan[] = data.map(item => ({
          ...item.full_data, // Restaure l'objet complexe complet (objectifs, milestones, notes)
          db_id: item.id // Garde la trace de l'ID Supabase pour les futures mises à jour
        }));
        setPlans(formattedPlans);
      }
    } catch (error: any) {
      toast({ title: "Erreur", description: "Impossible de charger les plans de prise en charge.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // --- 2. SAUVEGARDE DANS SUPABASE (Création & Mise à jour) ---
  const savePlanToDB = async (planToSave: CarePlan) => {
    setIsSaving(true);
    try {
      const dbPayload = {
        user_id: user?.id,
        child_name: planToSave.childName,
        child_age: planToSave.childAge,
        diagnosis: planToSave.diagnosis,
        status: planToSave.status,
        coordinator: planToSave.coordinator,
        overall_progress: planToSave.overallProgress,
        next_review: planToSave.nextReview === '-' ? null : planToSave.nextReview,
        full_data: planToSave, // On stocke tout l'objet JSON tel quel
        updated_at: new Date().toISOString()
      };

      if (planToSave.db_id) {
        // Mise à jour d'un plan existant
        const { error } = await supabase.from('care_plans').update(dbPayload).eq('id', planToSave.db_id);
        if (error) throw error;
      } else {
        // Création d'un nouveau plan
        const { data, error } = await supabase.from('care_plans').insert([dbPayload]).select().single();
        if (error) throw error;
        if (data) planToSave.db_id = data.id; // Récupère l'ID généré par Supabase
      }

    } catch (error: any) {
      toast({ title: "Erreur de sauvegarde", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = plans.filter(p => {
    const matchesSearch = p.childName.toLowerCase().includes(search.toLowerCase()) || p.diagnosis.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: plans.length,
    active: plans.filter(p => p.status === 'active').length,
    review: plans.filter(p => p.status === 'review').length,
    completed: plans.filter(p => p.status === 'completed').length,
  };

  const handleCreatePlan = async () => {
    if (!newPlan.childName) return;
    const plan: CarePlan = {
      id: Date.now().toString(), childName: newPlan.childName, childAge: newPlan.childAge,
      diagnosis: newPlan.diagnosis, status: 'draft', createdDate: new Date().toISOString().split('T')[0],
      lastReview: '-', nextReview: '', overallProgress: 0, coordinator: newPlan.coordinator,
      objectives: [], interventions: [], teamMembers: [], notes: [],
    };
    
    // Sauvegarde en DB puis maj état local
    await savePlanToDB(plan);
    setPlans(prev => [plan, ...prev]);
    setNewPlan({ childName: '', childAge: '', diagnosis: '', coordinator: '' });
    setShowNewPlan(false);
    toast({ title: "Succès", description: "Le nouveau plan a été créé." });
  };

  const toggleMilestone = async (planId: string, objectiveId: string, milestoneId: string) => {
    let updatedPlan: CarePlan | null = null;
    
    setPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      const objectives = p.objectives.map(o => {
        if (o.id !== objectiveId) return o;
        const milestones = o.milestones.map(m => m.id === milestoneId ? { ...m, done: !m.done } : m);
        const doneCount = milestones.filter(m => m.done).length;
        const progress = Math.round((doneCount / milestones.length) * 100);
        const status: Objective['status'] = progress === 100 ? 'achieved' : progress > 0 ? 'in_progress' : 'not_started';
        return { ...o, milestones, progress, status };
      });
      const overallProgress = objectives.length ? Math.round(objectives.reduce((s, o) => s + o.progress, 0) / objectives.length) : 0;
      updatedPlan = { ...p, objectives, overallProgress };
      return updatedPlan;
    }));

    if (updatedPlan) {
      await savePlanToDB(updatedPlan); // Sauvegarde automatique du clic en DB
      if (selectedPlan?.id === planId) setSelectedPlan(updatedPlan);
    }
  };

  const addNote = async (planId: string) => {
    if (!newNote.trim()) return;
    let updatedPlan: CarePlan | null = null;

    setPlans(prev => prev.map(p => {
      if (p.id === planId) {
        updatedPlan = {
          ...p, notes: [{ date: new Date().toISOString().split('T')[0], author: user?.firstName || 'Utilisateur', content: newNote }, ...p.notes]
        };
        return updatedPlan;
      }
      return p;
    }));

    if (updatedPlan) {
      await savePlanToDB(updatedPlan); // Sauvegarde de la note en DB
      if (selectedPlan?.id === planId) setSelectedPlan(updatedPlan);
      toast({ title: "Note ajoutée", description: "La note de suivi a été enregistrée." });
    }
    setNewNote('');
  };


  // Detail view
  if (selectedPlan) {
    const plan = plans.find(p => p.id === selectedPlan.id) || selectedPlan;
    const sc = statusConfig[plan.status];
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedPlan(null)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{plan.childName}</h1>
              <p className="text-muted-foreground">{plan.diagnosis} · {plan.childAge}</p>
            </div>
            <Badge className={sc.color}>{sc.icon}<span className="ml-1">{sc.label}</span></Badge>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Progression globale</p>
              <p className="text-2xl font-bold text-primary">{plan.overallProgress}%</p>
              <Progress value={plan.overallProgress} className="mt-2 h-2" />
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Objectifs</p>
              <p className="text-2xl font-bold text-foreground">{plan.objectives.length}</p>
              <p className="text-xs text-muted-foreground">{plan.objectives.filter(o => o.status === 'achieved').length} atteints</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Interventions</p>
              <p className="text-2xl font-bold text-foreground">{plan.interventions.length}</p>
              <p className="text-xs text-muted-foreground">en cours</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Prochaine révision</p>
              <p className="text-sm font-semibold text-foreground">{plan.nextReview || '-'}</p>
              <Calendar className="h-4 w-4 mx-auto mt-1 text-muted-foreground" />
            </CardContent></Card>
          </div>

          <Tabs defaultValue="objectives">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="objectives">Objectifs</TabsTrigger>
              <TabsTrigger value="interventions">Interventions</TabsTrigger>
              <TabsTrigger value="team">Équipe</TabsTrigger>
              <TabsTrigger value="notes">Notes & Suivi</TabsTrigger>
            </TabsList>

            {/* Objectives */}
            <TabsContent value="objectives" className="space-y-4">
              {plan.objectives.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground">
                  <Target className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>Aucun objectif défini. Ce plan est en cours d'élaboration.</p>
                </CardContent></Card>
              ) : plan.objectives.map(obj => (
                <Card key={obj.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {domainIcons[obj.domain] || <Target className="h-4 w-4 text-muted-foreground" />}
                        <div>
                          <CardTitle className="text-base">{obj.description}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{obj.domain}</Badge>
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Cible : {obj.targetDate}</span>
                          </CardDescription>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-primary">{obj.progress}%</span>
                    </div>
                    <Progress value={obj.progress} className="h-2 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Jalons</p>
                    {obj.milestones.map(m => (
                      <label key={m.id} className="flex items-center gap-3 cursor-pointer py-1">
                        <Checkbox checked={m.done} onCheckedChange={() => toggleMilestone(plan.id, obj.id, m.id)} disabled={isSaving} />
                        <span className={`text-sm ${m.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{m.label}</span>
                      </label>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Interventions */}
            <TabsContent value="interventions" className="space-y-4">
              {plan.interventions.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground">
                  <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>Aucune intervention planifiée.</p>
                </CardContent></Card>
              ) : plan.interventions.map(iv => (
                <Card key={iv.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{iv.type}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <User className="h-3 w-3" /> {iv.professional}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" /> {iv.frequency}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">{iv.startDate}</Badge>
                    </div>
                    {iv.notes && <p className="mt-2 text-sm bg-muted p-2 rounded text-muted-foreground">{iv.notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Team */}
            <TabsContent value="team" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.teamMembers.map((tm, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{tm.name}</p>
                        <p className="text-sm text-muted-foreground">{tm.specialty}</p>
                        <Badge variant="outline" className="text-xs mt-1">{tm.role}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Notes */}
            <TabsContent value="notes" className="space-y-4">
              <div className="flex gap-2">
                <Textarea placeholder="Ajouter une note de suivi..." value={newNote} onChange={e => setNewNote(e.target.value)} className="flex-1" />
                <Button onClick={() => addNote(plan.id)} disabled={!newNote.trim() || isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Ajouter
                </Button>
              </div>
              {plan.notes.map((n, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{n.date}</Badge>
                      <span className="text-sm font-medium text-foreground">{n.author}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.content}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    );
  }

  // List view
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" /> Plans de prise en charge
            </h1>
            <p className="text-muted-foreground">Gestion des plans thérapeutiques individualisés</p>
          </div>
          <Dialog open={showNewPlan} onOpenChange={setShowNewPlan}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> Nouveau plan</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Créer un plan de prise en charge</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Nom de l'enfant *</label>
                  <Input value={newPlan.childName} onChange={e => setNewPlan(p => ({ ...p, childName: e.target.value }))} placeholder="Prénom et nom" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Âge</label>
                    <Input value={newPlan.childAge} onChange={e => setNewPlan(p => ({ ...p, childAge: e.target.value }))} placeholder="Ex: 4 ans" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Coordinateur</label>
                    <Input value={newPlan.coordinator} onChange={e => setNewPlan(p => ({ ...p, coordinator: e.target.value }))} placeholder="Nom du coordinateur" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Diagnostic</label>
                  <Input value={newPlan.diagnosis} onChange={e => setNewPlan(p => ({ ...p, diagnosis: e.target.value }))} placeholder="Diagnostic principal" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewPlan(false)}>Annuler</Button>
                  <Button onClick={handleCreatePlan} disabled={!newPlan.childName || isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Créer le plan
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center">
            <ClipboardList className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total plans</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <Activity className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
            <p className="text-2xl font-bold text-foreground">{stats.active}</p>
            <p className="text-xs text-muted-foreground">Actifs</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto text-amber-500 mb-1" />
            <p className="text-2xl font-bold text-foreground">{stats.review}</p>
            <p className="text-xs text-muted-foreground">En révision</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Terminés</p>
          </CardContent></Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher par nom ou diagnostic..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="review">En révision</SelectItem>
              <SelectItem value="completed">Terminé</SelectItem>
              <SelectItem value="draft">Brouillon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Plan cards */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">
                <Stethoscope className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>Aucun plan trouvé.</p>
              </CardContent></Card>
            ) : filtered.map(plan => {
              const sc = statusConfig[plan.status] || statusConfig.draft; // Fallback sécurité
              return (
                <Card key={plan.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedPlan(plan)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-foreground">{plan.childName}</h3>
                          <Badge className={sc.color}>{sc.icon}<span className="ml-1">{sc.label}</span></Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{plan.diagnosis} · {plan.childAge}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {plan.coordinator}</span>
                          <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {plan.objectives.length} objectifs</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Révision : {plan.nextReview || '-'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-lg font-bold text-primary">{plan.overallProgress}%</p>
                          <Progress value={plan.overallProgress} className="w-20 h-2" />
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CarePlansModule;