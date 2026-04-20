import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const PALETTE = ['#1a6fb5', '#e8932f', '#2a9d6e', '#7c3aed', '#dc2626', '#6b7280', '#0ea5e9', '#f43f5e'];

const ReportingModule: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();

  // États initialisés à vide pour correspondre au protocole (Zéro fausse donnée)
  const [screeningData, setScreeningData] = useState<any[]>([]);
  const [disorderData, setDisorderData] = useState<any[]>([]);
  const [orientationData, setOrientationData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        // Chargement parallèle des 3 tables nécessaires
        const [screeningsRes, plansRes, referralsRes] = await Promise.all([
          supabase.from('screenings').select('created_at'),
          supabase.from('care_plans').select('diagnosis'),
          supabase.from('referrals').select('created_at, status')
        ]);

        if (screeningsRes.error) throw screeningsRes.error;
        // Tolérance d'erreur si la table care_plans ou referrals n'existe pas encore chez toi
        // On remplace par des tableaux vides le cas échéant.
        const screenings = screeningsRes.data || [];
        const plans = plansRes.data || [];
        const referrals = referralsRes.data || [];

        // 1. Initialiser le tableau des 6 derniers mois
        const last6Months: any[] = [];
        const d = new Date();
        for (let i = 5; i >= 0; i--) {
          const d2 = new Date(d.getFullYear(), d.getMonth() - i, 1);
          const monthLabel = d2.toLocaleDateString('fr-FR', { month: 'short' });
          // Format standardisé ex: 'Janv.', 'Févr.'
          const formattedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1).replace('.', '');
          
          last6Months.push({
            month: formattedMonth,
            m: d2.getMonth(),
            y: d2.getFullYear(),
            count: 0,
            orientations: 0,
            completed: 0
          });
        }

        // 2. Agréger les données de dépistage
        screenings.forEach(s => {
          const dt = new Date(s.created_at);
          const target = last6Months.find(m => m.m === dt.getMonth() && m.y === dt.getFullYear());
          if (target) target.count += 1;
        });

        // 3. Agréger les données d'orientation
        referrals.forEach(r => {
          const dt = new Date(r.created_at);
          const target = last6Months.find(m => m.m === dt.getMonth() && m.y === dt.getFullYear());
          if (target) {
            target.orientations += 1;
            if (r.status === 'completed' || r.status === 'active') {
              target.completed += 1;
            }
          }
        });

        // 4. Agréger les données de troubles (diagnostics)
        const diagMap: Record<string, number> = {};
        plans.forEach(cp => {
          const diag = cp.diagnosis || 'Non spécifié';
          diagMap[diag] = (diagMap[diag] || 0) + 1;
        });

        const dData = Object.entries(diagMap)
          .map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }))
          .sort((a, b) => b.value - a.value);

        // Mise à jour des états finaux
        setScreeningData(last6Months.map(m => ({ month: m.month, count: m.count })));
        setOrientationData(last6Months.map(m => ({ month: m.month, orientations: m.orientations, completed: m.completed })));
        setDisorderData(dData);

      } catch (err: any) {
        toast({ title: "Avertissement", description: "Certaines données analytiques n'ont pas pu être chargées.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [toast]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('module.reporting')}</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold mb-4">Dépistages par mois</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={screeningData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold mb-4">Répartition par trouble</h3>
            {disorderData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                Aucune donnée de diagnostic disponible
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={disorderData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                    {disorderData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-card rounded-xl p-5 border border-border lg:col-span-2">
            <h3 className="font-semibold mb-4">Orientations et suivi</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={orientationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="orientations" name="Orientations" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="completed" name="Suivis complétés" stroke="#2a9d6e" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ReportingModule;