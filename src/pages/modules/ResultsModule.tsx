import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart3, Calendar, Download, ChevronRight, CheckCircle2, 
  AlertTriangle, Activity, Users, Loader2, MapPin, User, Phone, Baby, FileText
} from 'lucide-react';

interface ScreeningData {
  id: string;
  child_name: string;
  dob: string;
  gender: string;
  location: string;
  parent_name: string;
  parent_contact: string;
  score: number;
  risk_level: string;
  created_at: string;
  responses: Record<string, boolean>;
  form_type?: string; 
}

const statusConfig: Record<string, any> = {
  normal: { label: 'Risque Faible', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: CheckCircle2 },
  warning: { label: 'Risque Moyen', color: 'text-amber-600', bg: 'bg-amber-100', icon: AlertTriangle },
  alert: { label: 'Risque Élevé', color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle },
};

const ResultsModule: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const isParent = user?.role === 'parent';
  
  const [screenings, setScreenings] = useState<ScreeningData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // 1. Récupération des données avec Filtre
  useEffect(() => {
    const fetchScreenings = async () => {
      try {
        let query = supabase
          .from('screenings')
          .select('*')
          .order('created_at', { ascending: false });

        // LE FILTRE EST ICI
        if (isParent) {
          query = query.eq('parent_id', user.id);
        }

        const { data, error } = await query;

        if (error) throw error;
        setScreenings(data || []);
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les résultats : " + error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchScreenings();
  }, [user, toast]);

  const calculateAge = (dobString: string) => {
    if (!dobString) return 'Âge inconnu';
    const dob = new Date(dobString);
    const today = new Date();
    let ageMonths = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
    if (ageMonths < 12) return `${ageMonths} mois`;
    const years = Math.floor(ageMonths / 12);
    const months = ageMonths % 12;
    return months > 0 ? `${years} ans ${months} mois` : `${years} ans`;
  };

  const getStatusKey = (riskLevel: string, score: number, isPnsm: boolean) => {
    if (isPnsm) {
      return score > 0 ? 'alert' : 'normal';
    } else {
      if (riskLevel?.includes('Élevé') || score >= 8) return 'alert';
      if (riskLevel?.includes('Moyen') || score >= 3) return 'warning';
      return 'normal';
    }
  };

  const totalEvals = screenings.length;
  const alertCount = screenings.filter(s => getStatusKey(s.risk_level, s.score, !!s.form_type?.includes('PNSM')) === 'alert').length;
  const warningCount = screenings.filter(s => getStatusKey(s.risk_level, s.score, !!s.form_type?.includes('PNSM')) === 'warning').length;
  const normalCount = totalEvals - alertCount - warningCount;

  const selectedEval = screenings.find(s => s.id === selectedChildId);

  // VUE 2 : DÉTAIL
  if (selectedEval) {
    const isPnsm = !!selectedEval.form_type?.includes('PNSM');
    const statusKey = getStatusKey(selectedEval.risk_level, selectedEval.score, isPnsm);
    const sc = statusConfig[statusKey];
    const StatusIcon = sc.icon;
    const maxScore = isPnsm ? 20 : 20;
    const scorePercentage = (selectedEval.score / maxScore) * 100;

    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-4 hover:bg-slate-200" onClick={() => setSelectedChildId(null)}>
            ← {isParent ? 'Retour à mes enfants' : 'Retour à la liste des dépistages'}
          </Button>

          <div className="flex items-center gap-4 mb-6 bg-white p-6 rounded-2xl shadow-sm border">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center font-black text-2xl ${sc.bg} ${sc.color}`}>
              {selectedEval.child_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800">{selectedEval.child_name}</h1>
              <div className="flex gap-4 text-sm text-slate-500 mt-2 font-medium">
                <span className="flex items-center gap-1"><Baby className="h-4 w-4"/> {calculateAge(selectedEval.dob)} ({selectedEval.gender})</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4"/> {selectedEval.location}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4"/> {new Date(selectedEval.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            <div className={`flex flex-col items-end px-4 py-2 rounded-xl ${sc.bg} border border-${sc.color.split('-')[1]}-200`}>
              <div className={`flex items-center gap-2 font-bold ${sc.color}`}>
                <StatusIcon className="h-5 w-5" />
                {selectedEval.risk_level.toUpperCase()}
              </div>
              <span className={`text-xs font-bold mt-1 ${sc.color}`}>{selectedEval.form_type || 'M-CHAT-R'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2 space-y-6">
              <Card className={`border-t-4 shadow-md ${statusKey === 'alert' ? 'border-t-red-500' : statusKey === 'warning' ? 'border-t-amber-500' : 'border-t-emerald-500'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Score Obtenu</span>
                    <span className={`text-3xl font-black ${sc.color}`}>{selectedEval.score}<span className="text-xl text-slate-300">/{maxScore}</span></span>
                  </div>
                  <Progress value={scorePercentage} className="h-3 mb-2" />
                  {!isPnsm ? (
                    <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                      <span>Faible (0-2)</span>
                      <span>Moyen (3-7)</span>
                      <span>Élevé (8-20)</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                      <span>Normal (0 Non)</span>
                      <span>Risque (≥1 Non)</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader className="bg-slate-50 border-b pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" /> {isParent ? 'Nos Recommandations' : 'Recommandations cliniques'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {statusKey === 'normal' && (
                    <div className="flex items-start gap-3 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                      <p className="text-sm font-medium text-emerald-800">Aucune action immédiate n'est requise. Poursuivez le suivi pédiatrique classique de l'enfant et les activités d'éveil.</p>
                    </div>
                  )}
                  {statusKey === 'warning' && (
                    <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100">
                      <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                      <p className="text-sm font-medium text-amber-800">Une évaluation détaillée de suivi ou une consultation avec un spécialiste est recommandée pour approfondir les observations.</p>
                    </div>
                  )}
                  {statusKey === 'alert' && (
                    <div className="flex items-start gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
                      <AlertTriangle className="h-6 w-6 text-red-600 shrink-0" />
                      <p className="text-sm font-medium text-red-800">Une orientation vers un spécialiste du neurodéveloppement pour une évaluation complète est fortement recommandée.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {!isParent && (
                <Card className="shadow-md">
                  <CardHeader className="bg-slate-50 border-b pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" /> Contacts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Parent / Tuteur</span>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-700">{selectedEval.parent_name || 'Non renseigné'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Téléphone</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-700">{selectedEval.parent_contact || 'Non renseigné'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-col gap-3">
                <Button className="w-full gap-2 shadow-md"><Download className="h-4 w-4" /> Télécharger le rapport</Button>
                {statusKey !== 'normal' && (
                  <Button variant="outline" className="w-full gap-2 border-primary text-primary">
                    <FileText className="h-4 w-4" /> {isParent ? 'Demander une téléconsultation' : 'Orienter vers un médecin'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // VUE 1 : LISTE
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{isParent ? 'Résultats de mes enfants' : 'Résultats & Dépistages'}</h1>
      </div>

      {!isParent && (
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {[
            { label: 'Total dépistages', value: totalEvals, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-100' },
            { label: 'Risque Élevé (TND)', value: alertCount, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
            { label: 'Risque Moyen', value: warningCount, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
            { label: 'Développement Normal', value: normalCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          ].map((s, idx) => (
            <Card key={idx} className="shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">{isLoading ? '-' : s.value}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6 bg-slate-200/50 p-1">
          <TabsTrigger value="all" className="font-bold">{isParent ? 'Tous mes enfants' : 'Tous les enfants'}</TabsTrigger>
          <TabsTrigger value="alert" className="font-bold text-red-600 data-[state=active]:bg-red-100">Risque Élevé</TabsTrigger>
          <TabsTrigger value="warning" className="font-bold text-amber-600 data-[state=active]:bg-amber-100">Risque Moyen</TabsTrigger>
          <TabsTrigger value="normal" className="font-bold text-emerald-600 data-[state=active]:bg-emerald-100">Risque Faible / Normal</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-slate-500 font-medium">Chargement des dossiers...</p>
          </div>
        ) : screenings.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed shadow-sm">
             <Baby className="h-16 w-16 mx-auto text-slate-300 mb-4" />
             <h3 className="text-xl font-bold text-slate-700">Aucun résultat</h3>
             <p className="text-slate-500 mt-2">
               {isParent ? "Vous n'avez pas encore d'enfant évalué." : "Aucun enfant n'a encore été recensé sur le terrain."}
             </p>
           </div>
        ) : (
          ['all', 'alert', 'warning', 'normal'].map(tab => (
            <TabsContent key={tab} value={tab} className="mt-0">
              <div className="grid gap-3">
                {screenings
                  .filter(c => tab === 'all' || getStatusKey(c.risk_level, c.score, !!c.form_type?.includes('PNSM')) === tab)
                  .map(c => {
                    const isPnsm = !!c.form_type?.includes('PNSM');
                    const statusKey = getStatusKey(c.risk_level, c.score, isPnsm);
                    const sc = statusConfig[statusKey];
                    const StatusIcon = sc.icon;

                    return (
                      <Card 
                        key={c.id} 
                        className={`cursor-pointer hover:shadow-md transition-all border-l-4 ${
                          statusKey === 'alert' ? 'border-l-red-500' : 
                          statusKey === 'warning' ? 'border-l-amber-500' : 'border-l-emerald-500'
                        }`} 
                        onClick={() => setSelectedChildId(c.id)}
                      >
                        <CardContent className="p-4 flex items-center gap-5">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0 ${sc.bg} ${sc.color}`}>
                            {c.child_name.charAt(0).toUpperCase()}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-lg text-slate-800 truncate">{c.child_name}</p>
                            <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                              {calculateAge(c.dob)} · {c.form_type || 'M-CHAT-R'} ({new Date(c.created_at).toLocaleDateString('fr-FR')})
                            </p>
                          </div>

                          <div className="text-right mr-4">
                            <div className={`flex items-center gap-1.5 justify-end px-3 py-1 rounded-full border ${sc.bg} border-${sc.color.split('-')[1]}-200`}>
                              <StatusIcon className={`h-4 w-4 ${sc.color}`} />
                              <span className={`text-sm font-bold uppercase ${sc.color}`}>{c.risk_level} (Score: {c.score})</span>
                            </div>
                          </div>
                          
                          <ChevronRight className="h-6 w-6 text-slate-400" />
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </TabsContent>
          ))
        )}
      </Tabs>
    </DashboardLayout>
  );
};

export default ResultsModule;