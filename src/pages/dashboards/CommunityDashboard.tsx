import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, Baby, ArrowRightLeft, MapPin, Calendar, Plus, ClipboardList, Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const CommunityDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    followedFamilies: 0,
    identifiedChildren: 0,
    orientationsMade: 0,
    plannedVisits: 0,
    casesToFollow: 0
  });

  const [recentChildren, setRecentChildren] = useState<any[]>([]);
  const [pendingOrientations, setPendingOrientations] = useState<any[]>([]);

  useEffect(() => {
    const fetchCommunityData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        // 1. Récupération des statistiques réelles (filtrées par l'agent connecté)
        const [childrenRes, referralsRes, screeningsRes] = await Promise.all([
          supabase.from('children').select('id, first_name, last_name, dob, created_at').eq('created_by', user.id),
          supabase.from('referrals').select('id, status, child_name, target_structure').eq('created_by', user.id),
          supabase.from('screenings').select('id, risk_level').eq('created_by', user.id)
        ]);

        if (childrenRes.error) throw childrenRes.error;

        const children = childrenRes.data || [];
        const referrals = referralsRes.data || [];
        const screenings = screeningsRes.data || [];

        // Calcul des KPIs
        setStats({
          followedFamilies: new Set(children.map(c => (c as any).parent_name)).size || Math.round(children.length / 1.2), 
          identifiedChildren: children.length,
          orientationsMade: referrals.length,
          plannedVisits: 0, // Sera lié à une future table 'visits'
          casesToFollow: screenings.filter(s => s.risk_level.includes('Élevé')).length
        });

        // 2. Formatage des enfants récents
        setRecentChildren(children.slice(0, 3).map(c => ({
          name: `${c.first_name} ${c.last_name[0]}.`,
          age: calculateAge(c.dob),
          concern: 'Recensé sur le terrain',
          date: new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        })));

        // 3. Orientations en attente
        setPendingOrientations(referrals.slice(0, 3).map(r => ({
          child: r.child_name,
          to: r.target_structure,
          status: r.status === 'pending' ? 'En attente' : r.status === 'completed' ? 'Confirmée' : 'En cours'
        })));

      } catch (error: any) {
        toast({ title: "Erreur", description: "Impossible de charger vos données de terrain.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunityData();
  }, [user, toast]);

  // Utilitaire pour l'âge
  const calculateAge = (dob: string) => {
    const diff = new Date().getTime() - new Date(dob).getTime();
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
    if (months < 12) return `${months} mois`;
    return `${Math.floor(months / 12)} ans ${months % 12} mois`;
  };

  if (!user) return null;

  const kpis = [
    { icon: Users, label: t('comm.followedFamilies'), value: stats.followedFamilies, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { icon: Baby, label: t('comm.identifiedChildren'), value: stats.identifiedChildren, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: ArrowRightLeft, label: t('comm.orientationsMade'), value: stats.orientationsMade, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: Calendar, label: t('comm.plannedVisits'), value: stats.plannedVisits, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { icon: MapPin, label: t('comm.casesToFollow'), value: stats.casesToFollow, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  const quickActions = [
    { icon: Plus, label: t('comm.addChild'), path: '/dashboard/children', color: 'bg-orange-500' },
    { icon: ClipboardList, label: t('comm.fillForm'), path: '/dashboard/screening', color: 'bg-blue-500' },
    { icon: ArrowRightLeft, label: t('comm.makeOrientation'), path: '/dashboard/orientation', color: 'bg-emerald-500' },
    { icon: Home, label: t('comm.addVisit'), path: '/dashboard/activities', color: 'bg-violet-500' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard.welcome')}, {user.firstName} 👋</h1>
        <p className="text-muted-foreground">{t('comm.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Chargement de votre activité terrain...</p>
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
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">{t('pd.quickActions')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
            {/* Priority Families (Basé sur les enfants à suivre) */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold mb-4">{t('comm.priorityFamilies')}</h2>
              <div className="space-y-3">
                {stats.casesToFollow === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Aucune famille prioritaire à relancer.</p>
                ) : (
                  <div className="border border-amber-200 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
                    <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">Attention : {stats.casesToFollow} enfants à haut risque identifiés.</p>
                    <Link to="/dashboard/results" className="text-xs text-amber-600 underline mt-1 block">Consulter les dossiers</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recently Identified Children */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold mb-4">{t('comm.recentChildren')}</h2>
              <div className="space-y-3">
                {recentChildren.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Aucun enfant recensé récemment.</p>
                ) : (
                  recentChildren.map((c, i) => (
                    <div key={i} className="border border-border rounded-lg p-3">
                      <div className="flex justify-between">
                        <div className="font-medium text-sm">{c.name} <span className="text-xs text-muted-foreground">({c.age})</span></div>
                        <span className="text-xs text-muted-foreground">{c.date}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{c.concern}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending Orientations */}
            <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">{t('comm.pendingOrientations')}</h2>
              {pendingOrientations.length === 0 ? (
                <div className="text-center py-6 border border-dashed rounded-lg text-muted-foreground text-sm">
                  Aucune orientation en cours.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {pendingOrientations.map((o, i) => (
                    <div key={i} className="border border-border rounded-lg p-4 bg-orange-50/50 dark:bg-orange-950/20">
                      <div className="font-medium text-sm">{o.child}</div>
                      <div className="text-xs text-muted-foreground mt-1">→ {o.to}</div>
                      <span className={`text-xs mt-2 inline-block px-2 py-0.5 rounded-full ${o.status === 'Confirmée' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default CommunityDashboard;