import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Activity, Search, Plus, Calendar, MapPin, Users, Clock, CheckCircle2,
  AlertCircle, Filter, Trash2, Play, Home, ClipboardList, UserCheck, Target, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type ActivityType = 'all' | 'home_visit' | 'screening_campaign' | 'awareness' | 'training' | 'community_meeting' | 'follow_up';
type ActivityStatus = 'all' | 'planned' | 'in_progress' | 'completed' | 'cancelled';

interface ActivityItem {
  id: string;
  title: string;
  type: ActivityType;
  status: ActivityStatus;
  date: string;
  time: string;
  location: string;
  area: string;
  responsible: string;
  participants: number;
  target_participants: number;
  description: string;
  outcomes?: string;
  families?: number;
  children_screened?: number;
  created_at: string;
}

const typeConfig: Record<string, { label: Record<string, string>; icon: React.ElementType; color: string }> = {
  home_visit: { label: { fr: 'Visite à domicile', en: 'Home visit', pt: 'Visita domiciliar', ar: 'زيارة منزلية' }, icon: Home, color: 'text-blue-500' },
  screening_campaign: { label: { fr: 'Campagne de dépistage', en: 'Screening campaign', pt: 'Campanha de triagem', ar: 'حملة فحص' }, icon: ClipboardList, color: 'text-emerald-500' },
  awareness: { label: { fr: 'Sensibilisation', en: 'Awareness', pt: 'Sensibilização', ar: 'توعية' }, icon: Users, color: 'text-orange-500' },
  training: { label: { fr: 'Formation', en: 'Training', pt: 'Formação', ar: 'تدريب' }, icon: Target, color: 'text-violet-500' },
  community_meeting: { label: { fr: 'Réunion communautaire', en: 'Community meeting', pt: 'Reunião comunitária', ar: 'اجتماع مجتمعي' }, icon: UserCheck, color: 'text-amber-500' },
  follow_up: { label: { fr: 'Suivi', en: 'Follow-up', pt: 'Acompanhamento', ar: 'متابعة' }, icon: Activity, color: 'text-teal-500' },
};

const statusConfig: Record<string, { label: Record<string, string>; style: string; icon: React.ElementType }> = {
  planned: { label: { fr: 'Planifiée', en: 'Planned', pt: 'Planejada', ar: 'مخططة' }, style: 'bg-blue-100 text-blue-800 border-blue-200', icon: Calendar },
  in_progress: { label: { fr: 'En cours', en: 'In progress', pt: 'Em andamento', ar: 'جارية' }, style: 'bg-amber-100 text-amber-800 border-amber-200', icon: Play },
  completed: { label: { fr: 'Terminée', en: 'Completed', pt: 'Concluída', ar: 'مكتملة' }, style: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  cancelled: { label: { fr: 'Annulée', en: 'Cancelled', pt: 'Cancelada', ar: 'ملغاة' }, style: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
};

const ActivitiesModule: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ActivityType>('all');
  const [statusFilter, setStatusFilter] = useState<ActivityStatus>('all');
  
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: '', type: 'home_visit' as ActivityType, date: '', time: '', location: '', area: '', description: '', targetParticipants: '',
  });

  // RÉCUPÉRATION DES DONNÉES DEPUIS SUPABASE
  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      // Suppression du filtre eq('agent_id') pour que le coordinateur voit tout
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
      
      if (selectedActivity) {
        const updatedSelected = data?.find(a => a.id === selectedActivity.id);
        if (updatedSelected) setSelectedActivity(updatedSelected);
      }
    } catch (error) {
      console.error("Erreur chargement activités", error);
      toast({ title: "Erreur", description: "Impossible de charger les activités.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [user]);

  const filtered = activities.filter(a => {
    const matchSearch = (a.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.location && a.location.toLowerCase().includes(search.toLowerCase())) ||
      (a.area && a.area.toLowerCase().includes(search.toLowerCase())) ||
      (a.responsible && a.responsible.toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const stats = {
    total: activities.length,
    planned: activities.filter(a => a.status === 'planned').length,
    inProgress: activities.filter(a => a.status === 'in_progress').length,
    completed: activities.filter(a => a.status === 'completed').length,
    totalParticipants: activities.reduce((s, a) => s + (a.participants || 0), 0),
    totalScreened: activities.reduce((s, a) => s + (a.children_screened || 0), 0),
  };

  const handleCreate = async () => {
    if (!newActivity.title.trim() || !newActivity.date) return;
    setIsSaving(true);
    
    try {
      const { error } = await supabase.from('activities').insert([{
        agent_id: user?.id,
        title: newActivity.title,
        type: newActivity.type,
        status: 'planned',
        date: newActivity.date,
        time: newActivity.time,
        location: newActivity.location,
        area: newActivity.area,
        responsible: user ? `${user.firstName} ${user.lastName}` : 'Coordination',
        target_participants: parseInt(newActivity.targetParticipants) || 0,
        description: newActivity.description
      }]);

      if (error) throw error;
      
      toast({ title: "Succès", description: "Activité planifiée avec succès." });
      setNewActivity({ title: '', type: 'home_visit', date: '', time: '', location: '', area: '', description: '', targetParticipants: '' });
      setShowCreate(false);
      fetchActivities(); 
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (id: string, status: ActivityStatus) => {
    try {
      const { error } = await supabase.from('activities').update({ status }).eq('id', id);
      if (error) throw error;
      fetchActivities();
      toast({ title: "Statut mis à jour" });
    } catch (error: any) {
      toast({ title: "Erreur", description: "Mise à jour impossible.", variant: "destructive" });
    }
  };

  const deleteActivity = async (id: string) => {
    if(!window.confirm("Voulez-vous vraiment supprimer cette activité ?")) return;
    try {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (error) throw error;
      
      if (selectedActivity?.id === id) setSelectedActivity(null);
      toast({ title: "Activité supprimée" });
      fetchActivities();
    } catch (error: any) {
      toast({ title: "Erreur", description: "Suppression impossible.", variant: "destructive" });
    }
  };

  const l = {
    fr: { title: 'Activités terrain', search: 'Rechercher une activité...', newActivity: 'Nouvelle activité', total: 'Total', planned: 'Planifiées', inProgress: 'En cours', completed: 'Terminées', participants: 'Participants', screened: 'Enfants dépistés', all: 'Toutes', details: 'Détails', date: 'Date', time: 'Horaire', location: 'Lieu', area: 'Zone', responsible: 'Responsable', target: 'Objectif', progress: 'Progression', outcomes: 'Résultats', families: 'Familles', type: 'Type', status: 'Statut', description: 'Description', create: 'Créer', cancel: 'Annuler', activityTitle: 'Titre', targetParticipants: 'Participants visés', noResults: 'Aucune activité trouvée', selectActivity: 'Sélectionnez une activité', start: 'Démarrer', complete: 'Terminer', delete: 'Supprimer', actions: 'Actions' },
    en: { title: 'Field activities', search: 'Search activities...', newActivity: 'New activity', total: 'Total', planned: 'Planned', inProgress: 'In progress', completed: 'Completed', participants: 'Participants', screened: 'Children screened', all: 'All', details: 'Details', date: 'Date', time: 'Time', location: 'Location', area: 'Area', responsible: 'Responsible', target: 'Target', progress: 'Progress', outcomes: 'Outcomes', families: 'Families', type: 'Type', status: 'Status', description: 'Description', create: 'Create', cancel: 'Cancel', activityTitle: 'Title', targetParticipants: 'Target participants', noResults: 'No activities found', selectActivity: 'Select an activity', start: 'Start', complete: 'Complete', delete: 'Delete', actions: 'Actions' },
  }[lang] || { title: 'Activités' };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{l.title}</h1>
            <p className="text-muted-foreground text-sm">{stats.total} activités réelles</p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />{l.newActivity}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />{l.newActivity}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>{l.activityTitle} *</Label>
                  <Input value={newActivity.title} onChange={e => setNewActivity(p => ({ ...p, title: e.target.value }))} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{l.type}</Label>
                    <Select value={newActivity.type} onValueChange={v => setNewActivity(p => ({ ...p, type: v as ActivityType }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeConfig).map(([key, cfg]) => (
                          <SelectItem key={key} value={key}>{cfg.label[lang] || cfg.label['fr']}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{l.date} *</Label>
                    <Input type="date" value={newActivity.date} onChange={e => setNewActivity(p => ({ ...p, date: e.target.value }))} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{l.time}</Label>
                    <Input value={newActivity.time} onChange={e => setNewActivity(p => ({ ...p, time: e.target.value }))} placeholder="09:00 - 12:00" className="mt-1" />
                  </div>
                  <div>
                    <Label>{l.targetParticipants}</Label>
                    <Input type="number" value={newActivity.targetParticipants} onChange={e => setNewActivity(p => ({ ...p, targetParticipants: e.target.value }))} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{l.location}</Label>
                    <Input value={newActivity.location} onChange={e => setNewActivity(p => ({ ...p, location: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label>{l.area}</Label>
                    <Input value={newActivity.area} onChange={e => setNewActivity(p => ({ ...p, area: e.target.value }))} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label>{l.description}</Label>
                  <Textarea value={newActivity.description} onChange={e => setNewActivity(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={3} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreate(false)} disabled={isSaving}>{l.cancel}</Button>
                  <Button onClick={handleCreate} disabled={isSaving}>
                    {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {l.create}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: l.total, value: stats.total, icon: Activity, color: 'text-primary' },
            { label: l.planned, value: stats.planned, icon: Calendar, color: 'text-blue-500' },
            { label: l.inProgress, value: stats.inProgress, icon: Play, color: 'text-amber-500' },
            { label: l.completed, value: stats.completed, icon: CheckCircle2, color: 'text-emerald-500' },
            { label: l.participants, value: stats.totalParticipants, icon: Users, color: 'text-violet-500' },
            { label: l.screened, value: stats.totalScreened, icon: ClipboardList, color: 'text-teal-500' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${s.color}`}><s.icon className="h-4 w-4" /></div>
                <div>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={l.search} className="pl-10" />
          </div>
          <Select value={typeFilter} onValueChange={v => setTypeFilter(v as ActivityType)}>
            <SelectTrigger className="w-full sm:w-52"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{l.all}</SelectItem>
              {Object.entries(typeConfig).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label[lang] || cfg.label['fr']}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as ActivityStatus)}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{l.all}</SelectItem>
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label[lang] || cfg.label['fr']}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {isLoading ? (
               <Card><CardContent className="p-12 text-center flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></CardContent></Card>
            ) : filtered.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground"><Activity className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>{l.noResults}</p></CardContent></Card>
            ) : filtered.map(activity => {
              const typeCfg = typeConfig[activity.type];
              const Icon = typeCfg?.icon || Activity;
              const progressPercent = activity.target_participants > 0 ? Math.round((activity.participants / activity.target_participants) * 100) : 0;

              return (
                <Card
                  key={activity.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${selectedActivity?.id === activity.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedActivity(activity)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-lg bg-muted flex-shrink-0 ${typeCfg?.color || 'text-muted-foreground'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold text-foreground">{activity.title}</p>
                          <Badge className={`text-xs flex-shrink-0 ${statusConfig[activity.status]?.style || ''}`}>
                            {statusConfig[activity.status]?.label[lang] || statusConfig[activity.status]?.label['fr']}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{activity.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{activity.date}</span>
                          {activity.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{activity.time}</span>}
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{activity.area}</span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{activity.participants}/{activity.target_participants}</span>
                        </div>
                        {activity.status !== 'cancelled' && activity.target_participants > 0 && (
                          <div className="mt-2">
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div>
            {selectedActivity ? (
                <Card className="sticky top-20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-lg bg-muted ${typeConfig[selectedActivity.type]?.color}`}><Activity className="h-5 w-5" /></div>
                      <Badge variant="outline" className="text-xs">{typeConfig[selectedActivity.type]?.label[lang] || typeConfig[selectedActivity.type]?.label['fr']}</Badge>
                    </div>
                    <CardTitle className="text-lg">{selectedActivity.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Badge className={`${statusConfig[selectedActivity.status]?.style}`}>
                      {statusConfig[selectedActivity.status]?.label[lang] || statusConfig[selectedActivity.status]?.label['fr']}
                    </Badge>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">{l.date}</span><span className="font-medium text-foreground">{selectedActivity.date}</span></div>
                      {selectedActivity.time && <div className="flex justify-between"><span className="text-muted-foreground">{l.time}</span><span className="font-medium text-foreground">{selectedActivity.time}</span></div>}
                      <div className="flex justify-between"><span className="text-muted-foreground">{l.location}</span><span className="font-medium text-foreground text-right max-w-[60%]">{selectedActivity.location}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{l.area}</span><span className="font-medium text-foreground">{selectedActivity.area}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{l.responsible}</span><span className="font-medium text-foreground">{selectedActivity.responsible}</span></div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-1">{l.description}</p>
                      <p className="text-sm text-foreground">{selectedActivity.description}</p>
                    </div>

                    <div className="border-t border-border pt-4 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase">{l.actions}</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedActivity.status === 'planned' && (
                          <Button size="sm" onClick={() => updateStatus(selectedActivity.id, 'in_progress')}>
                            <Play className="h-3.5 w-3.5 mr-1" />{l.start}
                          </Button>
                        )}
                        {selectedActivity.status === 'in_progress' && (
                          <Button size="sm" onClick={() => updateStatus(selectedActivity.id, 'completed')}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />{l.complete}
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => deleteActivity(selectedActivity.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" />{l.delete}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Activity className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>{l.selectActivity}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ActivitiesModule;