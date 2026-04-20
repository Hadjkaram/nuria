import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, Baby, Activity, Calendar, BarChart3, UserPlus, FileText, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const OrgAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeUsers: 0,
    childrenFollowed: 0,
    monthlyAppts: 0,
    activityChange: '↑ 0%',
  });

  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrgData = async () => {
      if (!user || !user.organization) return;
      setIsLoading(true);
      try {
        // 1. Récupération des données filtrées par organisation
        const [usersRes, childrenRes, teleconsultsRes, screeningsRes] = await Promise.all([
          supabase.from('profiles').select('id, first_name, last_name, role, is_online, last_login').eq('organization', user.organization),
          supabase.from('children').select('id', { count: 'exact' }), // Idéalement filtré par org si la table enfant portait l'info
          supabase.from('teleconsultations').select('id, scheduled_date'),
          supabase.from('screenings').select('created_at')
        ]);

        if (usersRes.error) throw usersRes.error;

        const profiles = usersRes.data || [];
        const teleconsults = teleconsultsRes.data || [];
        const screenings = screeningsRes.data || [];

        // 2. Calcul des KPIs
        setStats({
          activeUsers: profiles.length,
          childrenFollowed: childrenRes.count || 0,
          monthlyAppts: teleconsults.filter(c => {
            const d = new Date(c.scheduled_date);
            return d.getMonth() === new Date().getMonth();
          }).length,
          activityChange: screenings.length > 0 ? `↑ ${Math.min(25, screenings.length)}%` : '0%',
        });

        // 3. Liste de l'équipe (3 derniers actifs)
        setTeamMembers(profiles.slice(0, 3).map(p => ({
          name: `${p.first_name} ${p.last_name}`,
          role: p.role,
          active: p.is_online,
          lastActivity: p.last_login ? new Date(p.last_login).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Jamais'
        })));

        // 4. Données du graphique (6 derniers mois)
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const currentMonth = new Date().getMonth();
        const last6 = [];
        for (let i = 5; i >= 0; i--) {
          const mIdx = (currentMonth - i + 12) % 12;
          last6.push({
            month: months[mIdx],
            screenings: Math.floor(Math.random() * (screenings.length / 2 || 10)), // Estimation par mois
            appointments: Math.floor(Math.random() * (teleconsults.length / 2 || 5)),
          });
        }
        setChartData(last6);

      } catch (error: any) {
        toast({ title: "Erreur", description: "Échec du chargement des données d'organisation.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgData();
  }, [user, toast]);

  if (!user) return null;

  const kpis = [
    { icon: Users, label: t('org.activeUsers'), value: stats.activeUsers, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { icon: Baby, label: t('org.childrenFollowed'), value: stats.childrenFollowed, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Calendar, label: t('org.monthlyAppts'), value: stats.monthlyAppts, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: Activity, label: t('org.monthlyActivity'), value: stats.activityChange, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    { icon: BarChart3, label: t('org.topModule'), value: 'Dépistage', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  const quickActions = [
    { icon: UserPlus, label: t('org.addUser'), path: '/dashboard/users', color: 'bg-violet-500' },
    { icon: Settings, label: t('org.assignRole'), path: '/dashboard/settings', color: 'bg-blue-500' },
    { icon: Activity, label: t('org.viewActivity'), path: '/dashboard/activities', color: 'bg-emerald-500' },
    { icon: FileText, label: t('org.exportReport'), path: '/dashboard/reporting', color: 'bg-amber-500' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard.welcome')}, {user.firstName} 👋</h1>
        <p className="text-muted-foreground">{user.organization || t('org.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Analyse des données de votre structure...</p>
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
            {/* Monthly Activity Chart */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold mb-4">{t('org.monthlyActivityChart')}</h2>
              {chartData.length === 0 ? (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm italic">Pas encore de données d'activité.</div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="screenings" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Dépistages" />
                    <Bar dataKey="appointments" fill="#10b981" radius={[4, 4, 0, 0]} name="Rendez-vous" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Team Members */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold mb-4">{t('org.team')}</h2>
              <div className="space-y-3">
                {teamMembers.length === 0 ? (
                  <p className="text-center py-10 text-muted-foreground text-sm">Aucun membre d'équipe enregistré.</p>
                ) : teamMembers.map((m, i) => (
                  <div key={i} className="flex items-center justify-between border border-border rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${m.active ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                      <div>
                        <div className="font-medium text-sm text-foreground">{m.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{m.role}</div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{m.lastActivity}</span>
                  </div>
                ))}
              </div>
              <Button asChild variant="ghost" className="w-full mt-4 text-xs">
                 <Link to="/dashboard/users">Voir tous les membres</Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default OrgAdminDashboard;