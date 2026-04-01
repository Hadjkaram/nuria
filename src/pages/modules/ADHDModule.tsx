import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, Baby, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const adhdQuestions = [
  { id: 'i1', text: 'A du mal à soutenir son attention dans les tâches', category: 'inattention' },
  { id: 'i2', text: 'Ne semble pas écouter quand on lui parle', category: 'inattention' },
  { id: 'i3', text: 'Ne se conforme pas aux consignes', category: 'inattention' },
  { id: 'i4', text: 'A du mal à organiser ses activités', category: 'inattention' },
  { id: 'i5', text: 'Perd souvent les objets nécessaires', category: 'inattention' },
  { id: 'i6', text: 'Est facilement distrait par des stimuli externes', category: 'inattention' },
  { id: 'h1', text: 'Remue souvent les mains ou les pieds', category: 'hyperactivité' },
  { id: 'h2', text: 'Se lève souvent en classe', category: 'hyperactivité' },
  { id: 'h3', text: 'Court ou grimpe partout de manière excessive', category: 'hyperactivité' },
  { id: 'h4', text: 'A du mal à jouer tranquillement', category: 'hyperactivité' },
  { id: 'h5', text: 'Est souvent « sur la brèche »', category: 'hyperactivité' },
  { id: 'h6', text: 'Parle trop souvent', category: 'hyperactivité' },
];

const catColors: Record<string, string> = {
  inattention: 'bg-amber-100 text-amber-700',
  hyperactivité: 'bg-red-100 text-red-700',
};

const scores = ['Jamais', 'Parfois', 'Souvent', 'Très souvent'];

const ADHDModule: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const answered = Object.keys(answers).length;

  const handleAnswer = (qId: string, score: number) => {
    setAnswers({ ...answers, [qId]: score });
  };

  const handleSubmit = async () => {
    if (!childName || !childAge || answered < adhdQuestions.length) {
      toast({
        title: "Attention",
        description: "Veuillez remplir le nom, l'âge et répondre à toutes les questions.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('evaluations').insert([{
        professional_id: user?.id,
        type: 'adhd', // Identifiant pour le TDAH
        child_name: childName,
        child_age: parseInt(childAge),
        responses: answers,
        created_at: new Date().toISOString()
      }]);

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Succès",
        description: "L'évaluation TDAH a été enregistrée avec succès.",
      });
    } catch (err: any) {
      toast({
        title: "Erreur de sauvegarde",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Évaluation enregistrée</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Les résultats de l'évaluation TDAH ont été sauvegardés avec succès dans la base de données.
          </p>
          <Button onClick={() => { setSubmitted(false); setAnswers({}); setChildName(''); setChildAge(''); }}>
            Nouvelle évaluation
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Évaluation TDAH</h1>
            <p className="text-muted-foreground">Évaluation clinique des comportements</p>
          </div>
        </div>

        {/* Informations de l'enfant */}
        <Card className="mb-6">
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Baby className="h-4 w-4" /> Nom de l'enfant</Label>
              <Input placeholder="Prénom Nom" value={childName} onChange={(e) => setChildName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Âge (en mois ou années)</Label>
              <Input type="number" placeholder="Ex: 8" value={childAge} onChange={(e) => setChildAge(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <p className="text-muted-foreground mb-6">Évaluez la fréquence de chaque comportement observé chez l'enfant.</p>
        
        <div className="space-y-3">
          {adhdQuestions.map(q => (
            <div key={q.id} className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColors[q.category]} capitalize`}>
                  {q.category}
                </span>
              </div>
              <p className="text-sm mb-3 font-medium">{q.text}</p>
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                {scores.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleAnswer(q.id, i)} 
                    className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${answers[q.id] === i ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <Button 
            size="lg" 
            className="w-full h-14 text-lg shadow-lg" 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
            Valider l'évaluation ({answered}/{adhdQuestions.length})
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ADHDModule;