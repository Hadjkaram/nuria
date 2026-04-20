import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Video, FileText, Phone, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// 1. IMPORT DE L'API DAILY
import DailyIframe from '@daily-co/daily-js';

// MISE A JOUR de l'interface pour correspondre à 'appointments'
interface Teleconsultation {
  id: string;
  professional_name: string;
  child_name: string;
  scheduled_date: string;
  scheduled_time: string;
  duration?: string; // Optionnel car non présent dans 'appointments' de base
  notes?: string;    // Optionnel
  status: 'upcoming' | 'completed' | 'cancelled';
}

const TeleconsultationModule: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [consultations, setConsultations] = useState<Teleconsultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCall, setActiveCall] = useState<Teleconsultation | null>(null);
  const [isHangingUp, setIsHangingUp] = useState(false);

  // 2. RÉFÉRENCES POUR LA VIDÉO
  const callContainerRef = useRef<HTMLDivElement>(null);
  const [dailyCallObject, setDailyCallObject] = useState<any>(null);

  // --- LECTURE SYNCHRONISÉE DEPUIS 'APPOINTMENTS' ---
  const fetchConsultations = async () => {
    setIsLoading(true);
    try {
      // On lit la table 'appointments' au lieu de 'teleconsultations'
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_type', 'Téléconsultation') // ON NE PREND QUE LES TÉLÉCONSULTATIONS
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) throw error;

      if (data) {
        setConsultations(data.map(c => ({
          id: c.id,
          professional_name: c.professional_name || 'Non assigné',
          child_name: c.child_name || 'Patient Inconnu',
          scheduled_date: new Date(c.appointment_date).toLocaleDateString('fr-FR'),
          scheduled_time: c.appointment_time ? c.appointment_time.slice(0, 5) : '00:00',
          duration: '30 min', // Par défaut
          notes: '', // Par défaut, à lier à clinical_notes plus tard si besoin
          status: c.status === 'scheduled' ? 'upcoming' : c.status as 'completed' | 'cancelled'
        })));
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: "Impossible de charger les téléconsultations.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, [user]);

  const upcomingConsults = consultations.filter(c => c.status === 'upcoming');
  const pastConsults = consultations.filter(c => c.status === 'completed');

  // --- FIN D'APPEL ET MISE À JOUR DB ---
  const handleHangUp = async () => {
    if (!activeCall) return;
    setIsHangingUp(true);

    try {
      // Destruction de l'instance vidéo Daily pour libérer la mémoire
      if (dailyCallObject) {
        await dailyCallObject.destroy();
        setDailyCallObject(null);
      }

      // MISE A JOUR dans la table 'appointments'
      const { error } = await supabase.from('appointments').update({
        status: 'completed'
      }).eq('id', activeCall.id);

      if (error) throw error;

      toast({ title: "Appel terminé", description: "La consultation a été archivée dans l'historique." });
      setActiveCall(null);
      fetchConsultations();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsHangingUp(false);
    }
  };

  // --- 3. INITIALISATION DE LA VIDÉO QUAND L'APPEL DÉMARRE ---
  useEffect(() => {
    // Dès que le médecin clique sur un appel, ce useEffect se lance
    if (activeCall && callContainerRef.current) {
      
      // L'URL de la salle que tu as configurée
      const ROOM_URL = "https://enuria.daily.co/nuria-test";

      // Création de l'interface vidéo Daily
      const callFrame = DailyIframe.createFrame(callContainerRef.current, {
        showLeaveButton: true, // Bouton rouge pour raccrocher
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: 'none',
        },
      });

      // Si le médecin raccroche via l'interface interne de la vidéo
      callFrame.on('left-meeting', () => {
        handleHangUp();
      });

      // Connexion à la salle avec le nom du médecin (récupéré depuis ton AuthContext)
      callFrame.join({ 
        url: ROOM_URL,
        userName: user?.firstName ? `Dr. ${user.firstName} ${user.lastName}` : 'Médecin NURIA'
      });

      setDailyCallObject(callFrame);

      // Si l'utilisateur change de page brutalement, on nettoie
      return () => {
        callFrame.destroy();
      };
    }
  }, [activeCall]);


  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">{t('module.teleconsult')}</h1>

      {activeCall ? (
        // ÉCRAN DE CONSULTATION ACTIF
        <div className="flex flex-col h-[calc(100vh-140px)] bg-foreground rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
          
          {/* En-tête de l'appel */}
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between z-10 shadow-md shrink-0">
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Consultation avec {activeCall.child_name}
              </h2>
              <p className="text-slate-400 text-sm">Dr. {activeCall.professional_name}</p>
            </div>
            <Button variant="destructive" onClick={handleHangUp} disabled={isHangingUp} className="font-bold shadow-lg shadow-red-500/20">
              {isHangingUp ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Phone className="h-4 w-4 mr-2" />}
              Terminer la consultation
            </Button>
          </div>

          {/* 4. LE CONTENEUR QUI REÇOIT L'IFRAME DAILY */}
          <div className="flex-1 bg-black relative" ref={callContainerRef}>
            {/* L'image de la caméra apparaîtra ici */}
            {!dailyCallObject && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-[#00A3E0]" />
                <p className="font-medium">Connexion à la salle vidéo sécurisée...</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        // ÉCRAN D'ACCUEIL : LISTE DES APPELS
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Prochaines téléconsultations</h2>
            {isLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-[#00A3E0]" /></div>
            ) : upcomingConsults.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-dashed border-slate-300 text-slate-500">
                <Video className="h-10 w-10 mx-auto mb-3 opacity-30 text-[#00A3E0]" />
                <p className="font-medium">Aucune téléconsultation prévue pour le moment.</p>
              </div>
            ) : (
              upcomingConsults.map(c => (
                <div key={c.id} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Video className="h-6 w-6 text-[#0056A8]" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-base">{c.professional_name}</div>
                      <div className="text-sm font-medium text-slate-500">Patient : <span className="text-[#00A3E0]">{c.child_name}</span></div>
                      <div className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {c.scheduled_date} à {c.scheduled_time}
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => setActiveCall(c)} className="bg-[#0056A8] hover:bg-[#004080] text-white font-bold h-10 px-4 rounded-lg shadow-sm">
                    <Video className="h-4 w-4 mr-2" /> Rejoindre
                  </Button>
                </div>
              ))
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Consultations passées</h2>
            {isLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-[#00A3E0]" /></div>
            ) : pastConsults.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-dashed border-slate-300 text-slate-500">
                <Clock className="h-10 w-10 mx-auto mb-3 opacity-30 text-slate-400" />
                <p className="font-medium">Aucun historique de consultation.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastConsults.map(c => (
                  <div key={c.id} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-slate-800">{c.professional_name}</div>
                      <div className="text-xs font-bold text-[#0056A8] bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {c.duration}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-slate-600 mb-3">
                      Date : {c.scheduled_date} • Patient : <span className="text-slate-800">{c.child_name}</span>
                    </div>
                    {c.notes && (
                      <div className="bg-slate-50 rounded-xl p-4 text-sm flex items-start gap-3 border border-slate-100">
                        <FileText className="h-4 w-4 text-[#00A3E0] mt-0.5 flex-shrink-0" />
                        <p className="text-slate-700 italic">"{c.notes}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TeleconsultationModule;