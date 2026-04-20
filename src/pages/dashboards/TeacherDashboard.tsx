import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { GraduationCap, Eye, BookOpen, FileText, Bell, UserPlus, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    reportedStudents: 0,
    pendingObs: 0,
    receivedRecs: 0,
    activePlans: 0,
    toUpdate: 0
  });

  const [students, setStudents] = useState<any[]>([]);
  const [recentObs, setRecentObs] = useState<any[]>([]);

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        // 1. Récupération des élèves signalés par cet enseignant
        const { data: studentsData, error: studentError } = await supabase
          .from('children')
          .select('id, first_name, last_name, dob, created_at')
          .eq('created_by', user.id);

        if (studentError) throw studentError;

        // 2. Récupération des dépistages pour identifier les urgences
        const studentIds = studentsData?.map(s => s.id) || [];
        const { data: screeningsData } = await supabase
          .from('screenings')
          .select('child_id, risk_level, created_at')
          .in('child_id', studentIds)
          .order('created_at', { ascending: false });

        // 3. Récupération des plans de soins (Recommandations pédagogiques)
        const { data: plansData } = await supabase
          .from('care_plans')
          .select('id')
          .in('child_id', studentIds);

        // Formatage de la liste des élèves
        const formattedStudents = studentsData?.map(s => {
          const lastScr = screeningsData?.find(scr => scr.child_id === s.id);
          return {
            name: `${s.first_name} ${s.last_name[0]}.`,
            class: 'Classe', // Champ à ajouter en DB pour une V2
            concern: lastScr ? `Risque ${lastScr.risk_level}` : 'En attente d\'évaluation',
            status: lastScr?.risk_level.includes('Élevé') ? 'urgent' : (lastScr ? 'monitoring' : 'new')
          };
        }) || [];

        setStudents(formattedStudents.slice(0, 4));

        // KPIs
        setStats({
          reportedStudents: studentIds.length,
          pendingObs: studentIds.length - (screeningsData?.length || 0),
          receivedRecs: plansData?.length || 0,
          activePlans: plansData?.length || 0,
          toUpdate: formattedStudents.filter(s => s.status === 'urgent').length
        });

        // Simulation d'observations basées sur les dépistages réels
        setRecentObs(screeningsData?.slice(0, 3).map(scr => {
          const student = studentsData?.find(s => s.id === scr.child_id);
          return {
            student: student ? `${student.first_name} ${student.last_name[0]}.` : 'Élève',
            obs: `Dépistage effectué : risque ${scr.risk_level} identifié.`,
            date: new Date(scr.created_at).toLocaleDateString('fr-FR')
          };
        }) || []);

      } catch (error: any) {
        toast({ title: "Erreur", description: "Impossible de charger vos données de classe.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherData();
  }, [user, toast]);

  if (!user) return null;

  const kpis = [
    { icon: GraduationCap, label: t('teacher.reportedStudents'), value: stats.reportedStudents, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: Eye, label: t('teacher.pendingObs'), value: stats.pendingObs, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: BookOpen, label: t('teacher.receivedRecs'), value: stats.receivedRecs, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: FileText, label: t('teacher.activePlans'), value: stats.activePlans, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { icon: Bell, label: t('teacher.toUpdate'), value: stats.toUpdate, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  const quickActions = [
    { icon: UserPlus, label: t('teacher.reportStudent'), path: '/dashboard/children', color: 'bg-amber-500' },
    { icon: Eye, label: t('teacher.addObservation'), path: '/dashboard/observations', color: 'bg-blue-500' },
    { icon: BookOpen, label: t('teacher.viewRecs'), path: '/dashboard/education', color: 'bg-emerald-500' },
    { icon: Heart, label: t('teacher.openResources'), path: '/dashboard/resources', color: 'bg-rose-500' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard.welcome')}, {user.firstName} 👋</h1>
        <p className="text-muted-foreground">{t('teacher.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium italic">Chargement de votre suivi de classe...</p>
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
                <div className="text-[11px] text-muted-foreground leading-tight">{kpi.label}</div>
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
            {/* Students Needing Attention */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold mb-4">{t('teacher.studentsAttention')}</h2>
              <div className="space-y-3">
                {students.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Aucun élève signalé nécessitant une attention immédiate.</p>
                ) : (
                  students.map((s, i) => (
                    <div key={i} className="border border-border rounded-lg p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div>
                        <div className="font-bold text-sm text-slate-800">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.concern}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${s.status === 'urgent' ? 'bg-red-100 text-red-700' : s.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {s.status === 'urgent' ? 'Urgent' : s.status === 'new' ? 'Nouveau' : 'Suivi'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Observations */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold mb-4">{t('teacher.recentObs')}</h2>
              <div className="space-y-3">
                {recentObs.length === 0 ? (
                   <p className="text-sm text-muted-foreground italic">Pas de nouvelles observations enregistrées.</p>
                ) : (
                  recentObs.map((obs, i) => (
                    <div key={i} className="border border-border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-sm text-slate-800">{obs.student}</div>
                        <span className="text-[10px] text-muted-foreground font-medium">{obs.date}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">"{obs.obs}"</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pedagogical Recommendations */}
            <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">{t('teacher.pedResources')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { title: 'Adapter l\'environnement de classe pour le TDAH', cat: 'TDAH' },
                  { title: 'Supports visuels pour les troubles du langage', cat: 'Langage' },
                  { title: 'Gérer les comportements répétitifs en classe', cat: 'Autisme' },
                ].map((res, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 bg-amber-50/50 dark:bg-amber-950/20">
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full uppercase">{res.cat}</span>
                    <div className="text-sm font-semibold mt-2 text-slate-800">{res.title}</div>
                    <Button variant="link" size="sm" asChild className="px-0 mt-1 text-amber-600 h-auto">
                       <Link to="/dashboard/resources">{t('pd.viewAll')}</Link>
                    </Button>
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

export default TeacherDashboard;