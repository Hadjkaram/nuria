import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { FileText, BookOpen, Loader2 } from 'lucide-react'; // <-- AJOUT de Loader2
import { supabase } from '@/lib/supabase'; // <-- AJOUT de Supabase
import { useToast } from '@/hooks/use-toast'; // <-- AJOUT des notifications

interface Sheet {
  id: string;
  title: string;
  level: string;
}

const EducationModule: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();

  // <-- INITIALISATION VIDE POUR RESPECTER LE PROTOCOLE (0 donnée fictive) -->
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- LECTURE DEPUIS SUPABASE ---
  useEffect(() => {
    const fetchEducationData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('educational_resources')
          .select('*')
          .order('order_index', { ascending: true }) // Permet de trier l'ordre d'affichage
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          // Séparer les fiches et les recommandations selon leur type
          const fetchedSheets = data
            .filter(item => item.type === 'sheet')
            .map(item => ({ id: item.id, title: item.title, level: item.level || '' }));
          
          const fetchedRecs = data
            .filter(item => item.type === 'recommendation')
            .map(item => item.title); // On utilise le champ title pour le texte de la recommandation

          setSheets(fetchedSheets);
          setRecommendations(fetchedRecs);
        }
      } catch (error: any) {
        toast({ title: "Erreur", description: "Impossible de charger les ressources éducatives.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEducationData();
  }, [toast]);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">{t('module.education')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Colonne : Fiches pédagogiques */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" /> Fiches pédagogiques
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-3">
              {sheets.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 bg-card rounded-xl border border-border">Aucune fiche pédagogique disponible pour le moment.</p>
              ) : (
                sheets.map(s => (
                  <div key={s.id} className="bg-card rounded-xl p-4 border border-border card-hover">
                    <h3 className="font-medium text-sm mb-1">{s.title}</h3>
                    <span className="text-xs text-muted-foreground">{s.level}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Colonne : Recommandations */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Recommandations
          </h2>
          {isLoading ? (
             <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="bg-card rounded-xl p-5 border border-border space-y-3">
              {recommendations.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune recommandation disponible pour le moment.</p>
              ) : (
                recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-sm">{r}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default EducationModule;