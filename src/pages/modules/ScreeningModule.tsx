import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Question {
  id: string;
  text: string;
  domain: string;
}

const screeningQuestions: Record<string, Question[]> = {
  '0-6m': [
    { id: 'q1', text: 'L\'enfant suit-il des objets du regard ?', domain: 'motricité' },
    { id: 'q2', text: 'L\'enfant réagit-il aux sons ?', domain: 'langage' },
    { id: 'q3', text: 'L\'enfant tient-il sa tête ?', domain: 'motricité' },
    { id: 'q4', text: 'L\'enfant sourit-il en réponse à un sourire ?', domain: 'social' },
  ],
  '6-12m': [
    { id: 'q6', text: 'L\'enfant s\'assied-il seul ?', domain: 'motricité' },
    { id: 'q7', text: 'L\'enfant babille-t-il (ba-ba, ma-ma) ?', domain: 'langage' },
  ]
};

const ScreeningModule: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [ageGroup, setAgeGroup] = useState<string>('0-6m');
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      const { data } = await supabase.from('children').select('id, first_name, last_name');
      if (data) setChildren(data);
    };
    fetchChildren();
  }, []);

  const questions = screeningQuestions[ageGroup] || [];
  const answeredCount = Object.keys(answers).length;

  const handleAnswer = (qId: string, value: boolean) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedChildId || !user) return;
    setLoading(true);

    const score = Object.values(answers).filter(v => v === true).length;
    
    try {
      const { error } = await supabase.from('screenings').insert([
        {
          child_id: selectedChildId,
          user_id: user.id,
          age_category: ageGroup,
          scores: answers,
          total_score: score,
          status: 'completed'
        }
      ]);

      if (error) throw error;
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Dépistage terminé</h2>
          <p className="text-muted-foreground mb-6">Les données ont été transmises avec succès pour analyse.</p>
          <Button onClick={() => { setIsSubmitted(false); setAnswers({}); }}>Nouveau dépistage</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">{t('module.screening')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="space-y-2">
          <label className="text-sm font-medium">Sélectionner l'enfant</label>
          <Select onValueChange={setSelectedChildId} value={selectedChildId}>
            <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
            <SelectContent>
              {children.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Tranche d'âge</label>
          <Select onValueChange={setAgeGroup} value={ageGroup}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0-6m">0 - 6 mois</SelectItem>
              <SelectItem value="6-12m">6 - 12 mois</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map(q => (
          <div key={q.id} className="bg-card p-4 rounded-xl border border-border flex items-center justify-between gap-4">
            <p className="text-sm flex-1">{q.text}</p>
            <div className="flex gap-2">
              <Button 
                variant={answers[q.id] === true ? "default" : "outline"} 
                size="sm" 
                onClick={() => handleAnswer(q.id, true)}
              >Oui</Button>
              <Button 
                variant={answers[q.id] === false ? "destructive" : "outline"} 
                size="sm" 
                onClick={() => handleAnswer(q.id, false)}
              >Non</Button>
            </div>
          </div>
        ))}
      </div>

      <Button 
        className="w-full mt-8" 
        size="lg" 
        disabled={!selectedChildId || answeredCount < questions.length || loading}
        onClick={handleSubmit}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Finaliser le dépistage
      </Button>
    </DashboardLayout>
  );
};

export default ScreeningModule;