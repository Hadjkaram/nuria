import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Baby, Bell, ClipboardList, Calendar, BookOpen, Heart, Plus, Play, Eye, Video, Loader2, Phone, Activity, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import DailyIframe from '@daily-co/daily-js';

const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [children, setChildren] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  // États pour les KPI
  const [stats, setStats] = useState({
    childrenCount: 0,
    pendingQuestionnaires: 0,
    nextAppts: 0,
    alerts: 0,
    recommendations: 0
  });

  // États pour la modale de demande de RDV
  const [showApptModal, setShowApptModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedChildName, setSelectedChildName] = useState('');
  const [apptData, setApptData] = useState({ date: '', time: '' });

  // États pour la vidéo Daily.co
  const [activeCall, setActiveCall] = useState<any | null>(null);
  const [isHangingUp, setIsHangingUp] = useState(false);
  const callContainerRef = useRef<HTMLDivElement>(null);
  const [dailyCallObject, setDailyCallObject] = useState<any>(null);

  const fetchParentData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Récupération des enfants DU PARENT CONNECTÉ
      const { data: screeningsData, error: childError } = await supabase
        .from('screenings')
        .select('*')
        .eq('parent_id', user.id) // 🚨 LE VERROU EST ICI : On ne prend que SES enfants
        .order('created_at', { ascending: false });

      if (childError) throw childError;

      const formattedChildren = screeningsData?.map(child => ({
        id: child.id,
        name: child.child_name,
        age: calculateAge(child.dob),
        risk_level: child.risk_level,
        score: child.score,
        status: child.risk_level?.includes('Élevé') || child.risk_level?.includes('Moyen') ? 'alert' : 'ok',
        lastDate: new Date(child.created_at).toLocaleDateString('fr-FR')
      })) || [];

      setChildren(formattedChildren);

      // 2. Récupération des téléconsultations DU PARENT CONNECTÉ
      const { data: apptsData, error: apptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id) // 🚨 LE VERROU EST ICI AUSSI
        .eq('appointment_type', 'Téléconsultation')
        .order('appointment_date', { ascending: true });
        
      if (apptError) throw apptError;

      setAppointments(apptsData || []);

      // 3. Mise à jour des compteurs (KPI)
      setStats({
        childrenCount: formattedChildren.length,
        pendingQuestionnaires: 0,
        nextAppts: apptsData?.filter(a => a.status === 'scheduled').length || 0,
        alerts: formattedChildren.filter(c => c.status === 'alert').length,
        recommendations: 3 // Valeur statique pour l'instant
      });

    } catch (error: any) {
      toast({ title: "Erreur", description: "Impossible de charger votre espace famille.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, [user, toast]);

  const calculateAge = (dob: string) => {
    if(!dob) return 'Age inconnu';
    const diff = new Date().getTime() - new Date(dob).getTime();
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
    if (months < 12) return `${months} mois`;
    return `${Math.floor(months / 12)} ans ${months % 12} mois`;
  };

  // --- ACTIONS POUR LA TÉLÉCONSULTATION ---
  const handleRequestAppt = async () => {
    if (!apptData.date || !apptData.time || !selectedChildName) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('appointments').insert([{
        user_id: user?.id,
        child_name: selectedChildName,
        professional_name: 'Médecin à assigner',
        appointment_date: apptData.date,
        appointment_time: apptData.time,
        appointment_type: 'Téléconsultation',
        status: 'scheduled'
      }]);

      if (error) throw error;
      toast({ title: "Demande envoyée", description: "Votre demande de téléconsultation a été transmise." });
      setShowApptModal(false);
      setApptData({ date: '', time: '' });
      fetchParentData();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHangUp = async () => {
    if (!activeCall) return;
    setIsHangingUp(true);
    try {
      if (dailyCallObject) {
        await dailyCallObject.destroy();
        setDailyCallObject(null);
      }
      toast({ title: "Appel terminé", description: "Merci pour votre temps." });
      setActiveCall(null);
      fetchParentData();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsHangingUp(false);
    }
  };

  useEffect(() => {
    if (activeCall && callContainerRef.current) {
      const ROOM_URL = "https://enuria.daily.co/nuria-test";
      const callFrame = DailyIframe.createFrame(callContainerRef.current, {
        showLeaveButton: true,
        iframeStyle: { width: '100%', height: '100%', border: 'none', borderRadius: '0.75rem' },
      });
      callFrame.on('left-meeting', () => handleHangUp());
      callFrame.join({ 
        url: ROOM_URL,
        userName: user?.firstName ? `Parent de ${activeCall.child_name}` : 'Parent'
      });
      setDailyCallObject(callFrame);
      return () => { callFrame.destroy(); };
    }
  }, [activeCall]);

  if (!user) return null;

  const kpis = [
    { icon: Baby, label: t('dashboard.children'), value: stats.childrenCount, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: ClipboardList, label: t('sidebar.questionnaires'), value: stats.pendingQuestionnaires, color: 'text-amber-500', bg: 'bg-amber-500/10', suffix: t('pd.pending') },
    { icon: Calendar, label: t('sidebar.appointments'), value: stats.nextAppts, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: Bell, label: t('dashboard.alerts'), value: stats.alerts, color: 'text-red-500', bg: 'bg-red-500/10' },
    { icon: BookOpen, label: t('dashboard.recommendations'), value: stats.recommendations, color: 'text-violet-500', bg: 'bg-violet-500/10', suffix: t('pd.unread') },
  ];

  const quickActions = [
    { icon: Plus, label: t('pd.addChild'), path: '/dashboard/children', color: 'bg-blue-500' },
    { icon: Play, label: t('pd.startQuestionnaire'), path: '/dashboard/screening', color: 'bg-amber-500' },
    { icon: Eye, label: t('pd.viewResults'), path: '/dashboard/results', color: 'bg-emerald-500' },
    { icon: Calendar, label: t('pd.bookAppointment'), path: '/dashboard/appointments', color: 'bg-violet-500' },
    { icon: Video, label: t('sidebar.teleconsultation'), path: '/dashboard/teleconsultation', color: 'bg-teal-500' },
    { icon: Heart, label: t('sidebar.guidance'), path: '/dashboard/guidance', color: 'bg-rose-500' },
  ];

  const upcomingAppts = appointments.filter(a => a.status === 'scheduled');

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('dashboard.welcome')}, {user.firstName} 👋</h1>
        <p className="text-muted-foreground">{t('pd.subtitle')}</p>
      </div>

      {activeCall ? (
        // ÉCRAN D'APPEL VIDÉO
        <div className="flex flex-col h-[70vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 mb-6">
          <div className="bg-slate-800 p-4 text-white flex justify-between items-center z-10">
            <h2 className="font-bold flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Téléconsultation pour {activeCall.child_name}
            </h2>
            <Button variant="destructive" onClick={handleHangUp} disabled={isHangingUp}>
              {isHangingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4 mr-2" />}
              Quitter l'appel
            </Button>
          </div>
          <div className="flex-1 bg-black relative" ref={callContainerRef}>
            {!dailyCallObject && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                <p>Connexion au cabinet du médecin...</p>
              </div>
            )}
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium italic">Préparation de votre espace famille...</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {kpis.map((kpi, i) => (
              <div key={i} className="bg-card rounded-xl p-4 border border-border">
                <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center mb-2`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.label} {kpi.suffix && stats.pendingQuestionnaires > 0 && <span className="text-orange-500">• {kpi.suffix}</span>}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">{t('pd.quickActions')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickActions.map((action, i) => (
                <Link key={i} to={action.path} className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow text-center">
                  <div className={`w-10 h-10 rounded-full ${action.color} text-white flex items-center justify-center`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne Gauche : Mes Enfants */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2"><Baby className="text-primary" /> {t('sidebar.myChildren')}</h2>
              {children.length === 0 ? (
                <p className="text-center py-6 text-sm text-muted-foreground italic border border-dashed rounded-lg">Vous n'avez pas encore ajouté d'enfant.</p>
              ) : children.map((child, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-slate-800">{child.name}</h3>
                    <Badge variant="outline" className={`font-bold ${child.status === 'alert' ? 'text-red-600 border-red-200 bg-red-50' : 'text-emerald-600 border-emerald-200 bg-emerald-50'}`}>
                      {child.risk_level || (child.status === 'alert' ? 'Risque Détecté' : 'Normal')}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Dossier mis à jour le {child.lastDate}
                  </p>
                  <Button 
                    className="w-full bg-slate-100 text-primary hover:bg-primary hover:text-white transition-colors"
                    onClick={() => {
                      setSelectedChildName(child.name);
                      setShowApptModal(true);
                    }}
                  >
                    <Video className="h-4 w-4 mr-2" /> Demander une téléconsultation
                  </Button>
                </div>
              ))}
            </div>

            {/* Colonne Droite : Rendez-vous à venir */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2"><Calendar className="text-primary" /> Mes Téléconsultations</h2>
              {upcomingAppts.length === 0 ? (
                <div className="bg-slate-50 rounded-xl p-8 text-center border border-dashed border-slate-200">
                  <Calendar className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500 font-medium">Vous n'avez aucune téléconsultation prévue.</p>
                </div>
              ) : (
                upcomingAppts.map(appt => (
                  <div key={appt.id} className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm border-l-4 border-l-blue-500">
                    <h3 className="font-bold text-slate-800">Consultation pour {appt.child_name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                      <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500" /> Le {new Date(appt.appointment_date).toLocaleDateString('fr-FR')} à {appt.appointment_time.slice(0, 5)}</p>
                      <p className="flex items-center gap-2"><Baby className="h-4 w-4 text-blue-500" /> Avec : {appt.professional_name}</p>
                    </div>
                    <Button 
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                      onClick={() => setActiveCall(appt)}
                    >
                      <Video className="h-4 w-4 mr-2" /> Rejoindre la salle d'attente
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* MODALE POUR DEMANDER UN RDV */}
      <Dialog open={showApptModal} onOpenChange={setShowApptModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Programmer une téléconsultation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-500">Choisissez une date et une heure pour échanger en vidéo avec un spécialiste concernant <b>{selectedChildName}</b>.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date souhaitée</Label>
                <Input type="date" value={apptData.date} onChange={e => setApptData({...apptData, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Heure souhaitée</Label>
                <Input type="time" value={apptData.time} onChange={e => setApptData({...apptData, time: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApptModal(false)}>Annuler</Button>
            <Button onClick={handleRequestAppt} disabled={isSubmitting || !apptData.date || !apptData.time}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmer la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ParentDashboard;