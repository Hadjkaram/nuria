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
  
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [activeQuestionnaire, setActiveQuestionnaire] = useState<Questionnaire | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Liste des questionnaires
  const questionnaires: Questionnaire[] = [
    { id: 'asq-6', title: 'ASQ-3 (6 mois)', description: 'Dépistage du développement global', ageRange: '6 mois', domain: 'Développement', questionCount: 30, status: 'not_started' },
    { id: 'm-chat', title: 'M-CHAT-R', description: 'Repérage précoce de l\'autisme', ageRange: '16-30 mois', domain: 'Autisme', questionCount: 20, status: 'not_started' },
  ];

  // Charger les enfants
  useEffect(() => {
    const fetchChildren = async () => {
      const { data } = await supabase.from('children').select('id, first_name, last_name');
      if (data) setChildren(data);
    };
    fetchChildren();
  }, []);

  const handleStartRequest = (q: Questionnaire) => {
    setActiveQuestionnaire(q);
    setShowStartDialog(true);
  };

  const completeQuestionnaire = async () => {
    if (!selectedChildId || !activeQuestionnaire || !user) return;
    setIsSaving(true);
    try {
      const score = Math.floor(Math.random() * 100);
      const risk = score > 70 ? 'low' : score > 40 ? 'medium' : 'high';

      const { error } = await supabase.from('questionnaire_results').insert([
        {
          child_id: selectedChildId,
          user_id: user.id,
          title: activeQuestionnaire.title,
          domain: activeQuestionnaire.domain,
          score: score,
          max_score: 100,
          risk_level: risk,
          status: 'completed'
        }
      ]);

      if (error) throw error;
      setShowStartDialog(false);
    } catch (error) {
      console.error(error);
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
                  {children.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.first_name} {c.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full" 
              disabled={!selectedChildId || isSaving} 
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