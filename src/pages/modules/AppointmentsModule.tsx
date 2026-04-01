import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
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
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [newAppt, setNewAppt] = useState({ childName: '', professionalName: '', date: '', time: '', type: '' });

  // --- 1. LECTURE DEPUIS SUPABASE ---
  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;

      const formattedData: Appointment[] = (data || []).map(item => ({
        id: item.id,
        childName: item.child_name,
        professionalName: item.professional_name,
        date: item.appointment_date,
        time: item.appointment_time.substring(0, 5), // Garder HH:MM
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

  useEffect(() => {
    fetchAppointments();
  }, []);

  // --- 2. AJOUTER DANS SUPABASE ---
  const addAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('appointments').insert([{
        user_id: user?.id,
        child_name: newAppt.childName,
        professional_name: newAppt.professionalName,
        appointment_date: newAppt.date,
        appointment_time: newAppt.time,
        appointment_type: newAppt.type,
        status: 'scheduled'
      }]);

      if (error) throw error;

      toast({ title: "Succès", description: "Rendez-vous planifié." });
      setNewAppt({ childName: '', professionalName: '', date: '', time: '', type: '' });
      setShowForm(false);
      fetchAppointments();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. METTRE À JOUR LE STATUT (Optionnel mais utile) ---
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      fetchAppointments();
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
            {t('module.appointments')}
        </h1>
        <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Fermer' : <><Plus className="h-4 w-4 mr-2" /> Nouveau RDV</>}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={addAppt} className="bg-card rounded-xl p-6 border shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-4">
          <input placeholder="Nom de l'enfant" value={newAppt.childName} onChange={e => setNewAppt({...newAppt, childName: e.target.value})} required className="px-4 py-3 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary" />
          <input placeholder="Professionnel" value={newAppt.professionalName} onChange={e => setNewAppt({...newAppt, professionalName: e.target.value})} required className="px-4 py-3 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary" />
          <input type="date" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} required className="px-4 py-3 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary" />
          <input type="time" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} required className="px-4 py-3 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary" />
          <input placeholder="Type de consultation" value={newAppt.type} onChange={e => setNewAppt({...newAppt, type: e.target.value})} required className="px-4 py-3 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-primary sm:col-span-2" />
          <div className="flex gap-2 sm:col-span-2 justify-end pt-2">
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
                  <div className="hidden group-hover:flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => updateStatus(a.id, 'completed')} title="Marquer comme terminé">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => updateStatus(a.id, 'cancelled')} title="Annuler le RDV">
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