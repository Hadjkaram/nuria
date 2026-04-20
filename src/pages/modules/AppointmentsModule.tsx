import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Plus, User, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  childName: string;
  professionalName: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const AppointmentsModule: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const isParent = user?.role === 'parent';
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [myChildren, setMyChildren] = useState<string[]>([]); // Pour stocker les noms des enfants du parent
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [newAppt, setNewAppt] = useState({ childName: '', professionalName: '', date: '', time: '', type: '' });

  // --- 1. LECTURE DES DONNÉES ---
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('appointments')
          .select('*')
          .order('appointment_date', { ascending: true })
          .order('appointment_time', { ascending: true });

        // Filtre de confidentialité pour les parents
        if (isParent) {
          query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;

        if (error) throw error;

        const formattedData: Appointment[] = (data || []).map(item => ({
          id: item.id,
          childName: item.child_name,
          professionalName: item.professional_name,
          date: item.appointment_date,
          time: item.appointment_time.substring(0, 5),
          type: item.appointment_type,
          status: item.status as 'scheduled' | 'completed' | 'cancelled'
        }));

        setAppointments(formattedData);
      } catch (error: any) {
        toast({ title: "Erreur", description: "Impossible de charger les rendez-vous : " + error.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    // NOUVEAU : Récupérer la liste des enfants si c'est un parent
    const fetchMyChildren = async () => {
      if (isParent && user?.id) {
        const { data, error } = await supabase
          .from('screenings')
          .select('child_name')
          .eq('parent_id', user.id);
        
        if (!error && data) {
          // On retire les potentiels doublons de noms
          const uniqueNames = Array.from(new Set(data.map(c => c.child_name)));
          setMyChildren(uniqueNames);
        }
      }
    };

    fetchAppointments();
    fetchMyChildren();
  }, [user, isParent, toast]);

  // --- 2. AJOUTER DANS SUPABASE ---
  const addAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.childName) {
      toast({ title: "Erreur", description: "Veuillez sélectionner ou saisir le nom de l'enfant.", variant: "destructive" });
      return;
    }
    if (!newAppt.type) {
      toast({ title: "Erreur", description: "Veuillez sélectionner un type de consultation.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Si c'est un parent, on met "Médecin à assigner", sinon on prend ce que le docteur a tapé
      const profName = isParent ? 'Médecin à assigner' : newAppt.professionalName;

      const { error } = await supabase.from('appointments').insert([{
        user_id: user?.id,
        child_name: newAppt.childName,
        professional_name: profName,
        appointment_date: newAppt.date,
        appointment_time: newAppt.time,
        appointment_type: newAppt.type,
        status: 'scheduled'
      }]);

      if (error) throw error;

      toast({ title: "Succès", description: "Rendez-vous planifié." });
      setNewAppt({ childName: '', professionalName: '', date: '', time: '', type: '' });
      setShowForm(false);
      
      // On recharge la liste localement pour afficher le nouveau RDV
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq(isParent ? 'user_id' : 'id', isParent ? user!.id : '') // Hack rapide pour forcer la maj ou on recharge tout
        .order('appointment_date', { ascending: true });
        
       // Solution propre : On recharge la page complète silencieusement
       window.location.reload(); 
       
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      setIsSubmitting(false);
    } 
  };

  // --- 3. METTRE À JOUR LE STATUT ---
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Mise à jour de l'affichage local sans recharger toute la page
      setAppointments(prev => prev.map(appt => appt.id === id ? { ...appt, status: newStatus as any } : appt));
      toast({ title: "Statut mis à jour", description: "Le rendez-vous a été actualisé." });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  const statusStyles: Record<string, string> = {
    scheduled: 'bg-primary/10 text-primary border-primary/20',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };

  const statusLabels: Record<string, string> = { scheduled: 'Planifié', completed: 'Terminé', cancelled: 'Annulé' };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            {isParent ? 'Mes Rendez-vous' : t('module.appointments')}
        </h1>
        <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Fermer' : <><Plus className="h-4 w-4 mr-2" /> Nouveau RDV</>}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={addAppt} className="bg-card rounded-xl p-6 border shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-4">
          
          {/* NOUVEAU : Sélection de l'enfant (Menu déroulant pour le parent, texte libre pour le docteur) */}
          {isParent ? (
            <Select value={newAppt.childName} onValueChange={v => setNewAppt({...newAppt, childName: v})}>
              <SelectTrigger className="px-4 py-3 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary w-full">
                <SelectValue placeholder="Sélectionner mon enfant..." />
              </SelectTrigger>
              <SelectContent>
                {myChildren.length === 0 ? (
                  <SelectItem value="none" disabled>Aucun enfant inscrit</SelectItem>
                ) : (
                  myChildren.map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          ) : (
            <input placeholder="Nom de l'enfant" value={newAppt.childName} onChange={e => setNewAppt({...newAppt, childName: e.target.value})} required className="px-4 py-3 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary" />
          )}

          {/* Le champ professionnel est caché pour le parent, visible pour le docteur */}
          {!isParent && (
            <input placeholder="Professionnel" value={newAppt.professionalName} onChange={e => setNewAppt({...newAppt, professionalName: e.target.value})} required className="px-4 py-3 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary" />
          )}

          <input type="date" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} required className={`px-4 py-3 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary ${isParent ? 'sm:col-span-1' : ''}`} />
          <input type="time" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} required className="px-4 py-3 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary" />
          
          <div className="sm:col-span-2">
            <Select value={newAppt.type} onValueChange={v => setNewAppt({...newAppt, type: v})}>
              <SelectTrigger className="px-4 py-3 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary w-full">
                <SelectValue placeholder="Sélectionner le type de consultation..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Téléconsultation">🎥 Téléconsultation (Vidéo)</SelectItem>
                {!isParent && (
                  <>
                    <SelectItem value="Consultation de suivi">Consultation de suivi</SelectItem>
                    <SelectItem value="Bilan psychomoteur">Bilan psychomoteur</SelectItem>
                    <SelectItem value="Bilan orthophonique">Bilan orthophonique</SelectItem>
                  </>
                )}
                <SelectItem value="Entretien parental">Entretien parental</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 sm:col-span-2 justify-end pt-2 w-full">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enregistrer
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Chargement de l'agenda...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-dashed">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
          <p className="text-muted-foreground font-medium">Aucun rendez-vous n'est planifié.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(a => (
            <div key={a.id} className="bg-card rounded-xl p-4 border border-border hover:shadow-md transition-shadow flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border ${statusStyles[a.status]}`}>
                  <span className="text-xs font-bold uppercase">{new Date(a.date).toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                  <span className="text-lg font-black leading-none">{new Date(a.date).getDate()}</span>
                </div>
                
                <div>
                  <div className="font-bold text-lg text-foreground">{a.type}</div>
                  <div className="text-sm font-medium text-slate-500 flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-primary bg-primary/5 px-2 py-0.5 rounded-md"><Clock className="h-3 w-3" /> {a.time}</span>
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Patient: {a.childName}</span>
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Médecin: {a.professionalName}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyles[a.status]}`}>
                  {statusLabels[a.status]}
                </span>
                
                {a.status === 'scheduled' && (
                  <div className={`hidden group-hover:flex items-center gap-1 ${isParent ? 'pointer-events-none opacity-50' : ''}`}>
                    {/* Le parent peut voir l'icone mais seul le medecin peut cliquer dessus pour valider */}
                    {!isParent && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => updateStatus(a.id, 'completed')} title="Marquer comme terminé">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className={`h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 ${isParent ? 'pointer-events-auto opacity-100' : ''}`} onClick={() => updateStatus(a.id, 'cancelled')} title="Annuler le RDV">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AppointmentsModule;