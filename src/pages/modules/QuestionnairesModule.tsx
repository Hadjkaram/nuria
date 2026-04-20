import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClipboardList, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast'; // <-- AJOUT

// --- Types ---
interface Questionnaire {
  id: string;
  title: string;
  description: string;
  ageRange: string;
  domain: string;
  questionCount: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

const QuestionnairesModule: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast(); // <-- AJOUT
  
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [activeQuestionnaire, setActiveQuestionnaire] = useState<Questionnaire | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Liste des questionnaires (Catalogue fixe d'outils cliniques)
  const questionnaires: Questionnaire[] = [
    { id: 'asq-6', title: 'ASQ-3 (6 mois)', description: 'Dépistage du développement global', ageRange: '6 mois', domain: 'Développement', questionCount: 30, status: 'not_started' },
    { id: 'm-chat', title: 'M-CHAT-R', description: 'Repérage précoce de l\'autisme', ageRange: '16-30 mois', domain: 'Autisme', questionCount: 20, status: 'not_started' },
  ];

  // Charger les enfants depuis Supabase
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const { data, error } = await supabase
          .from('children')
          .select('id, first_name, last_name')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data) setChildren(data);
      } catch (err: any) {
        toast({ title: "Erreur", description: "Impossible de charger la liste des enfants.", variant: "destructive" });
      }
    };
    fetchChildren();
  }, [toast]);

  const handleStartRequest = (q: Questionnaire) => {
    setActiveQuestionnaire(q);
    setShowStartDialog(true);
  };

  // --- CRÉATION DE L'ÉVALUATION EN DB (Sans fausses données) ---
  const completeQuestionnaire = async () => {
    if (!selectedChildId || !activeQuestionnaire || !user) return;
    setIsSaving(true);
    
    try {
      // On initialise l'évaluation avec un score de 0 et un statut "in_progress" (Zéro fausse donnée)
      const { error } = await supabase.from('questionnaire_results').insert([
        {
          child_id: selectedChildId,
          user_id: user.id,
          title: activeQuestionnaire.title,
          domain: activeQuestionnaire.domain,
          score: 0,
          max_score: activeQuestionnaire.questionCount,
          risk_level: 'pending',
          status: 'in_progress'
        }
      ]);

      if (error) throw error;
      
      toast({ title: "Succès", description: "L'évaluation a été initialisée avec succès." });
      setShowStartDialog(false);
      setSelectedChildId(''); // Reset
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{t('sidebar.questionnaires')}</h1>
        <p className="text-muted-foreground text-sm">Sélectionnez un outil d'évaluation.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {questionnaires.map((q) => (
          <Card key={q.id} className="group hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleStartRequest(q)}>
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{q.title}</h3>
                  <p className="text-sm text-muted-foreground">{q.description} • {q.ageRange}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Commencer l'évaluation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pour quel enfant ?</label>
              <Select onValueChange={setSelectedChildId} value={selectedChildId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un enfant..." />
                </SelectTrigger>
                <SelectContent>
                  {children.length === 0 ? (
                     <SelectItem value="none" disabled>Aucun enfant disponible</SelectItem>
                  ) : (
                    children.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.first_name} {c.last_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full" 
              disabled={!selectedChildId || selectedChildId === 'none' || isSaving} 
              onClick={completeQuestionnaire}
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Lancer le questionnaire
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default QuestionnairesModule;