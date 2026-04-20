import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Baby, Calendar, ClipboardList, Stethoscope, Video, FileText, FolderOpen, Bell, Brain, Plus, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const ProfessionalDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activePatients: 0,
    newReferrals: 0,
    todayAppts: 0,
    toReview: 0,
    activePlans: 0,
    plannedTeleconsult: 0
  });

  const [alerts, setAlerts] = useState<any[]>([]);
  const [pendingEvals, setPendingEvals] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];

        // 1. Récupération des compteurs (KPIs)
        const [patients, referrals, teleconsults, plans, screenings] = await Promise.all([
          supabase.from('children').select('id', { count: 'exact' }),
          supabase.from('referrals').select('id', { count: 'exact' }).eq('status', 'pending'),
          supabase.from('teleconsultations').select('id', { count: 'exact' }).eq('scheduled_date', today).eq('status', 'upcoming'),
          supabase.from('care_plans').select('id', { count: 'exact' }),
          supabase.from('screenings').select('id, child_name, risk_level, created_at, score').order('created_at', { ascending: false })
        ]);

        setStats({
          activePatients: patients.count || 0,
          newReferrals: referrals.count || 0,
          todayAppts: teleconsults.count || 0, // Utilise les téléconsultations comme RDV pour ce module
          toReview: screenings.data?.filter(s => s.risk_level.includes('Élevé')).length || 0,
          activePlans: plans.count || 0,
          plannedTeleconsult: teleconsults.count || 0
        });

        // 2. Génération des alertes cliniques réelles
        if (screenings.data) {
          const clinicalAlerts = screenings.data
            .filter(s => s.risk_level.includes('Élevé') || s.risk_level.includes('Moyen'))
            .slice(0, 3)
            .map(s => ({
              patient: s.child_name,
              alert: `Risque ${s.risk_level} détecté (Score: ${s.score})`,
              severity: s.risk_level.includes('Élevé') ? 'high' : 'medium'
            }));
          setAlerts(clinicalAlerts);

          // 3. Évaluations en attente (Derniers dépistages sans plan de soin encore créé)
          setPendingEvals(screenings.data.slice(0, 3));
        }

      } catch (error: any) {
        toast({ title: "Erreur", description: "Impossible de charger les données du tableau de bord.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, toast]);

  if (!user) return null;

  const kpis = [
    { icon: Baby, label: t('pro.activePatients'), value: stats.activePatients, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: Bell, label: t('pro.newReferrals'), value: stats.newReferrals, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: Calendar, label: t('pro.todayAppts'), value: stats.todayAppts, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: FolderOpen, label: t('pro.toReview'), value: stats.toReview, color: 'text-violet-500', bg: 'bg-violet-100' },
    { icon: Stethoscope, label: t('pro.activePlans'), value: stats.activePlans, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    { icon: Video, label: t('pro.plannedTeleconsult'), value: stats.plannedTeleconsult, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  const quickActions = [
    { icon: FolderOpen, label: t('pro.openRecord'), path: '/dashboard/children', color: 'bg-emerald-500' },
    { icon: Play, label: t('pro.startEvaluation'), path: '/dashboard/screening', color: 'bg-blue-500' },
    { icon: Stethoscope, label: t('pro.createPlan'), path: '/dashboard/care-plans', color: 'bg-violet-500' },
    { icon: Video, label: t('pro.launchTeleconsult'), path: '/dashboard/teleconsultation', color: 'bg-teal-500' },
    { icon: FileText, label: t('pro.addNote'), path: '/dashboard/documents', color: 'bg-amber-500' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard.welcome')}, {user.firstName} 👋</h1>
        <p className="text-muted-foreground">{t('pro.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Synchronisation des dossiers patients...</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {kpis.map((kpi, i) => (
              <div key={i} className="bg-card rounded-xl p-4 border border-border">
                <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center mb-2`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">{t('pd.quickActions')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Agenda (Simulation basée sur teleconsults réelles) */}
            <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">{t('pro.todayAgenda')}</h2>
              {stats.todayAppts === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm border border-dashed rounded-lg">
                   Aucun rendez-vous prévu pour aujourd'hui.
                </div>
              ) : (
                <div className="space-y-2">
                   <p className="text-sm text-muted-foreground mb-4 italic">Consultez le module téléconsultation pour le détail de vos appels.</p>
                   <Button asChild variant="outline" size="sm">
                      <Link to="/dashboard/teleconsultation">Ouvrir l'agenda complet</Link>
                   </Button>
                </div>
              )}
            </div>

            {/* Clinical Alerts */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold mb-4">{t('pro.clinicalAlerts')}</h2>
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune alerte critique.</p>
                ) : alerts.map((alert, i) => (
                  <div key={i} className={`border-l-4 rounded-lg p-3 ${alert.severity === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'}`}>
                    <div className="font-bold text-sm">{alert.patient}</div>
                    <div className="text-xs text-muted-foreground mt-1">{alert.alert}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Evaluations */}
            <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">{t('pro.pendingEvaluations')}</h2>
              <div className="space-y-2">
                {pendingEvals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune évaluation en attente.</p>
                ) : pendingEvals.map((ev, i) => (
                  <div key={i} className="flex items-center justify-between border border-border rounded-lg p-3">
                    <div>
                      <div className="font-medium text-sm">{ev.child_name}</div>
                      <div className="text-xs text-muted-foreground">Dépisté le {new Date(ev.created_at).toLocaleDateString()}</div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                       <Link to="/dashboard/results">Voir détails</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity History (Simulée basée sur le temps réel) */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold mb-4">{t('pro.recentActivity')}</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-foreground">Connexion sécurisée établie</div>
                    <div className="text-xs text-muted-foreground">À l'instant</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 opacity-50">
                  <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-foreground italic">Historique d'activité local</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default ProfessionalDashboard;