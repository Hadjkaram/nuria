import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
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
  ChevronRight, Activity, Brain, Heart, Eye, Users, ClipboardList
} from 'lucide-react';

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
}

const initialPlans: CarePlan[] = [
  {
    id: '1', childName: 'Amadou Diallo', childAge: '5 ans', diagnosis: 'Trouble du spectre autistique (TSA)',
    status: 'active', createdDate: '2026-01-15', lastReview: '2026-02-28', nextReview: '2026-03-28',
    overallProgress: 45, coordinator: 'Dr. Fatou Ndiaye',
    objectives: [
      { id: 'o1', description: 'Améliorer la communication verbale : produire des phrases de 3 mots', domain: 'Langage', targetDate: '2026-06-15', progress: 60, status: 'in_progress', milestones: [{ id: 'm1', label: 'Utilise des mots isolés', done: true }, { id: 'm2', label: 'Combine 2 mots', done: true }, { id: 'm3', label: 'Phrases de 3 mots', done: false }] },
      { id: 'o2', description: 'Développer les interactions sociales avec les pairs', domain: 'Social', targetDate: '2026-07-01', progress: 30, status: 'in_progress', milestones: [{ id: 'm4', label: 'Tolère la proximité', done: true }, { id: 'm5', label: 'Jeu parallèle', done: false }, { id: 'm6', label: 'Jeu interactif', done: false }] },
      { id: 'o3', description: 'Réduire les comportements répétitifs', domain: 'Comportement', targetDate: '2026-08-01', progress: 20, status: 'in_progress', milestones: [{ id: 'm7', label: 'Identifier les déclencheurs', done: true }, { id: 'm8', label: 'Stratégies alternatives', done: false }] },
    ],
    interventions: [
      { id: 'i1', type: 'Orthophonie', professional: 'Mme Koné', frequency: '2x/semaine', notes: 'Méthode PECS en cours', startDate: '2026-01-20' },
      { id: 'i2', type: 'Psychomotricité', professional: 'M. Traoré', frequency: '1x/semaine', notes: 'Travail sur l\'intégration sensorielle', startDate: '2026-02-01' },
      { id: 'i3', type: 'ABA', professional: 'Dr. Sow', frequency: '3x/semaine', notes: 'Programme comportemental individualisé', startDate: '2026-01-15' },
    ],
    teamMembers: [
      { name: 'Dr. Fatou Ndiaye', role: 'Coordinatrice', specialty: 'Pédopsychiatre' },
      { name: 'Mme Koné', role: 'Thérapeute', specialty: 'Orthophoniste' },
      { name: 'M. Traoré', role: 'Thérapeute', specialty: 'Psychomotricien' },
      { name: 'Dr. Sow', role: 'Thérapeute', specialty: 'Analyste comportemental' },
    ],
    notes: [
      { date: '2026-02-28', author: 'Dr. Ndiaye', content: 'Progrès encourageants en communication. Amadou utilise maintenant 15 mots fonctionnels.' },
      { date: '2026-02-10', author: 'Mme Koné', content: 'Début PECS phase 2 : échange d\'images avec discrimination.' },
    ],
  },
  {
    id: '2', childName: 'Mariama Bah', childAge: '7 ans', diagnosis: 'TDAH - Type combiné',
    status: 'review', createdDate: '2025-11-10', lastReview: '2026-02-15', nextReview: '2026-03-15',
    overallProgress: 65, coordinator: 'Dr. Oumar Sy',
    objectives: [
      { id: 'o4', description: 'Améliorer l\'attention soutenue en classe (15 min)', domain: 'Cognitif', targetDate: '2026-05-01', progress: 70, status: 'in_progress', milestones: [{ id: 'm9', label: '5 min d\'attention', done: true }, { id: 'm10', label: '10 min d\'attention', done: true }, { id: 'm11', label: '15 min d\'attention', done: false }] },
      { id: 'o5', description: 'Développer l\'organisation des tâches scolaires', domain: 'Autonomie', targetDate: '2026-06-01', progress: 55, status: 'in_progress', milestones: [{ id: 'm12', label: 'Utilise un agenda', done: true }, { id: 'm13', label: 'Planifie ses devoirs', done: false }] },
    ],
    interventions: [
      { id: 'i4', type: 'Neuropsychologie', professional: 'Dr. Camara', frequency: '1x/semaine', notes: 'Entraînement cognitif', startDate: '2025-11-15' },
      { id: 'i5', type: 'Suivi pédagogique', professional: 'M. Diop', frequency: '2x/semaine', notes: 'Adaptations scolaires', startDate: '2025-12-01' },
    ],
    teamMembers: [
      { name: 'Dr. Oumar Sy', role: 'Coordinateur', specialty: 'Neuropédiatre' },
      { name: 'Dr. Camara', role: 'Thérapeute', specialty: 'Neuropsychologue' },
    ],
    notes: [
      { date: '2026-02-15', author: 'Dr. Sy', content: 'Révision prévue pour ajuster le plan. Mariama montre des améliorations significatives.' },
    ],
  },
  {
    id: '3', childName: 'Ibrahim Touré', childAge: '3 ans', diagnosis: 'Retard global de développement',
    status: 'draft', createdDate: '2026-03-01', lastReview: '-', nextReview: '2026-04-01',
    overallProgress: 0, coordinator: 'Dr. Fatou Ndiaye',
    objectives: [],
    interventions: [],
    teamMembers: [{ name: 'Dr. Fatou Ndiaye', role: 'Coordinatrice', specialty: 'Pédopsychiatre' }],
    notes: [{ date: '2026-03-01', author: 'Dr. Ndiaye', content: 'Plan en cours d\'élaboration suite au bilan initial.' }],
  },
  {
    id: '4', childName: 'Aïssatou Camara', childAge: '6 ans', diagnosis: 'Trouble du langage expressif',
    status: 'completed', createdDate: '2025-06-01', lastReview: '2026-01-15', nextReview: '-',
    overallProgress: 100, coordinator: 'Dr. Oumar Sy',
    objectives: [
      { id: 'o6', description: 'Atteindre un vocabulaire expressif de 200 mots', domain: 'Langage', targetDate: '2025-12-31', progress: 100, status: 'achieved', milestones: [{ id: 'm14', label: '50 mots', done: true }, { id: 'm15', label: '100 mots', done: true }, { id: 'm16', label: '200 mots', done: true }] },
    ],
    interventions: [
      { id: 'i6', type: 'Orthophonie intensive', professional: 'Mme Koné', frequency: '3x/semaine', notes: 'Programme terminé avec succès', startDate: '2025-06-15' },
    ],
    teamMembers: [
      { name: 'Dr. Oumar Sy', role: 'Coordinateur', specialty: 'Neuropédiatre' },
      { name: 'Mme Koné', role: 'Thérapeute', specialty: 'Orthophoniste' },
    ],
    notes: [
      { date: '2026-01-15', author: 'Dr. Sy', content: 'Objectifs atteints. Plan clôturé. Suivi de contrôle dans 6 mois.' },
    ],
  },
];

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
  const [plans, setPlans] = useState<CarePlan[]>(initialPlans);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState<CarePlan | null>(null);
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [newNote, setNewNote] = useState('');

  // New plan form
  const [newPlan, setNewPlan] = useState({ childName: '', childAge: '', diagnosis: '', coordinator: '' });

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

  const handleCreatePlan = () => {
    if (!newPlan.childName) return;
    const plan: CarePlan = {
      id: Date.now().toString(), childName: newPlan.childName, childAge: newPlan.childAge,
      diagnosis: newPlan.diagnosis, status: 'draft', createdDate: new Date().toISOString().split('T')[0],
      lastReview: '-', nextReview: '', overallProgress: 0, coordinator: newPlan.coordinator,
      objectives: [], interventions: [], teamMembers: [], notes: [],
    };
    setPlans(prev => [plan, ...prev]);
    setNewPlan({ childName: '', childAge: '', diagnosis: '', coordinator: '' });
    setShowNewPlan(false);
  };

  const toggleMilestone = (planId: string, objectiveId: string, milestoneId: string) => {
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
      return { ...p, objectives, overallProgress };
    }));
    if (selectedPlan?.id === planId) {
      setSelectedPlan(prev => {
        if (!prev) return prev;
        const updated = plans.find(p => p.id === planId);
        return updated || prev;
      });
    }
  };

  const addNote = (planId: string) => {
    if (!newNote.trim()) return;
    setPlans(prev => prev.map(p => p.id === planId ? {
      ...p, notes: [{ date: new Date().toISOString().split('T')[0], author: 'Vous', content: newNote }, ...p.notes]
    } : p));
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
                        <Checkbox checked={m.done} onCheckedChange={() => toggleMilestone(plan.id, obj.id, m.id)} />
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
                <Button onClick={() => addNote(plan.id)} disabled={!newNote.trim()}>Ajouter</Button>
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
                  <Button onClick={handleCreatePlan} disabled={!newPlan.childName}>Créer le plan</Button>
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
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <Stethoscope className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Aucun plan trouvé.</p>
            </CardContent></Card>
          ) : filtered.map(plan => {
            const sc = statusConfig[plan.status];
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
      </div>
    </DashboardLayout>
  );
};

export default CarePlansModule;
