import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, Building, Globe, Activity, Shield, Layers, Database, Monitor, Plus, Settings, Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // Import ajouté
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCountries: 0,
    activeOrgs: 0,
    activityVolume: 0,
    systemAlerts: 0,
    activeModules: 0
  });

  const [activityData, setActivityData] = useState<any[]>([]);
  const [countryStats, setCountryStats] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchGlobalData = async () => {
      setIsLoading(true);
      try {
        // 1. Récupération des données globales depuis plusieurs tables
        // Note: On ajoute les colonnes manquantes (first_name, role) dans le select
        const [profilesRes, orgsRes, screeningsRes, settingsRes] = await Promise.all([
          supabase.from('profiles').select('id, organization, created_at, status, first_name, role'),
          supabase.from('structures').select('id, region'),
          supabase.from('screenings').select('id, created_at'),
          supabase.from('platform_settings').select('modules').eq('id', 'global').single()
        ]);

        if (profilesRes.error) throw profilesRes.error;

        const profiles = profilesRes.data || [];
        const structures = orgsRes.data || [];
        const screenings = screeningsRes.data || [];
        const modules = settingsRes.data?.modules || [];

        // 2. Calcul des KPIs
        const orgSet = new Set(profiles.map(p => p.organization).filter(o => o !== '-'));
        
        setStats({
          totalUsers: profiles.length,
          activeCountries: 1, 
          activeOrgs: structures.length || orgSet.size,
          activityVolume: screenings.length,
          systemAlerts: profiles.filter(p => p.status === 'pending').length, 
          activeModules: Array.isArray(modules) ? modules.filter((m: any) => m.enabled).length : 8
        });

        // 3. Activité Hebdomadaire
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dayLabel = days[d.getDay()];
          const dayActions = screenings.filter(s => 
            new Date(s.created_at).toDateString() === d.toDateString()
          ).length;
          
          last7Days.push({
            day: dayLabel,
            logins: Math.floor(profiles.length / 10) + (dayActions * 2),
            actions: dayActions
          });
        }
        setActivityData(last7Days);

        // 4. Statistiques Pays
        setCountryStats([
          { country: '🇨🇮 Côte d\'Ivoire', users: profiles.length, orgs: structures.length || orgSet.size, status: 'Active' },
          { country: '🇸🇳 Sénégal', users: 0, orgs: 0, status: 'Pilote' }
        ]);

        // 5. Logs récents (CORRIGÉ : Casté en any pour éviter les erreurs de propriétés)
        const logs = profiles.slice(0, 5).map((p: any) => ({
          action: `Nouvel utilisateur: ${p.first_name || 'Inconnu'}`,
          user: p.role || 'N/A',
          time: new Date(p.created_at).toLocaleDateString(),
          type: p.status === 'pending' ? 'warning' : 'success'
        }));
        setRecentLogs(logs);

      } catch (error: any) {
        console.error(error);
        toast({ title: "Erreur", description: "Impossible de charger la console d'administration.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalData();
  }, [toast]);

  if (!user) return null;

  const kpis = [
    { icon: Users, label: t('sa.totalUsers'), value: stats.totalUsers.toLocaleString(), color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { icon: Globe, label: t('sa.activeCountries'), value: stats.activeCountries, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Building, label: t('sa.activeOrgs'), value: stats.activeOrgs, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: Activity, label: t('sa.activityVolume'), value: stats.activityVolume.toLocaleString(), color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: Bell, label: t('sa.systemAlerts'), value: stats.systemAlerts, color: 'text-red-500', bg: 'bg-red-500/10' },
    { icon: Layers, label: t('sa.activeModules'), value: stats.activeModules, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  ];

  const quickActions = [
    { icon: Globe, label: t('sa.addCountry'), path: '/dashboard/countries', color: 'bg-rose-500' },
    { icon: Building, label: t('sa.addOrg'), path: '/dashboard/structures', color: 'bg-blue-500' },
    { icon: Shield, label: t('sa.createRole'), path: '/dashboard/roles', color: 'bg-emerald-500' },
    { icon: Settings, label: t('sa.managePermissions'), path: '/dashboard/roles', color: 'bg-violet-500' },
    { icon: Database, label: t('sa.viewLogs'), path: '/dashboard/settings', color: 'bg-amber-500' },
    { icon: Layers, label: t('sa.toggleModule'), path: '/dashboard/settings', color: 'bg-teal-500' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard.welcome')}, {user.firstName} 👋</h1>
        <p className="text-muted-foreground">{t('sa.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium italic">Connexion sécurisée au cœur du système...</p>
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
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{kpi.label}</div>
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
                  <span className="text-[11px] font-bold uppercase">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Activity */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold mb-4">{t('sa.weeklyActivity')}</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="logins" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Connexions" />
                  <Bar dataKey="actions" fill="#6366f1" radius={[4, 4, 0, 0]} name="Actions" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Country Stats */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold mb-4">{t('sa.countryStats')}</h2>
              <div className="space-y-2">
                {countryStats.map((c, i) => (
                  <div key={i} className="flex items-center justify-between border border-border rounded-lg p-3">
                    <div>
                      <div className="font-medium text-sm">{c.country}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{c.users} utilisateurs • {c.orgs} organisations</div>
                    </div>
                    <Badge variant="outline" className={c.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                      {c.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Logs */}
            <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">{t('sa.recentLogs')}</h2>
              <div className="space-y-2">
                {recentLogs.length === 0 ? (
                   <p className="text-center py-6 text-sm text-muted-foreground italic">Aucun log récent généré.</p>
                ) : recentLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 border border-border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.type === 'warning' ? 'bg-red-500' : log.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-slate-800">{log.action}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mt-1">{log.user} • {log.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;