import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, Baby, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const autismQuestions = [
  { id: 'c1', text: "L'enfant regarde-t-il dans les yeux quand on lui parle ?", category: 'communication', positive: true },
  { id: 'c2', text: "L'enfant pointe-t-il du doigt pour montrer quelque chose ?", category: 'communication', positive: true },
  { id: 'c3', text: "L'enfant utilise-t-il des mots ou des gestes pour communiquer ?", category: 'communication', positive: true },
  { id: 'c4', text: "L'enfant comprend-il des consignes simples ?", category: 'communication', positive: true },
  { id: 's1', text: "L'enfant sourit-il en réponse à un sourire ?", category: 'interactions', positive: true },
  { id: 's2', text: "L'enfant s'intéresse-t-il aux autres enfants ?", category: 'interactions', positive: true },
  { id: 's3', text: "L'enfant partage-t-il ses jouets ?", category: 'interactions', positive: true },
  { id: 's4', text: "L'enfant montre-t-il de l'empathie ?", category: 'interactions', positive: true },
  { id: 'r1', text: "L'enfant aligne-t-il ses jouets de manière répétitive ?", category: 'comportement', positive: false },
];

const catColors: Record<string, string> = {
  communication: 'bg-blue-100 text-blue-700',
  interactions: 'bg-emerald-100 text-emerald-700',
  comportement: 'bg-amber-100 text-amber-700',
};

const AutismModule: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const answered = Object.keys(answers).length;

  const handleSubmit = async () => {
    if (!childName || !childAge || answered < autismQuestions.length) {
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
        type: 'autism',
        child_name: childName,
        child_age: parseInt(childAge),
        responses: answers,
        created_at: new Date().toISOString()
      }]);

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Succès",
        description: "L'évaluation a été enregistrée dans la base de données.",
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
            Les résultats de l'évaluation ont été sauvegardés avec succès dans Supabase.
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
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Dépistage Autisme</h1>
            <p className="text-muted-foreground">Évaluation clinique des signes précoces</p>
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
              <Label>Âge (en mois)</Label>
              <Input type="number" placeholder="Ex: 36" value={childAge} onChange={(e) => setChildAge(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <p className="text-muted-foreground mb-6">Sélectionnez "Oui" ou "Non" en vous basant sur vos observations de l'enfant.</p>
        
        <div className="space-y-3">
          {autismQuestions.map(q => (
            <div key={q.id} className="bg-card rounded-xl p-4 border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColors[q.category]} mb-2 inline-block capitalize`}>
                  {q.category}
                </span>
                <p className="text-sm">{q.text}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => setAnswers({ ...answers, [q.id]: true })} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${answers[q.id] === true ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >Oui</button>
                <button 
                  onClick={() => setAnswers({ ...answers, [q.id]: false })} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${answers[q.id] === false ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >Non</button>
              </div>
            </div>
          ))}
        </div>

        <Button 
          size="lg" 
          className="w-full mt-6 h-14 text-lg" 
          onClick={handleSubmit} 
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
          Valider le repérage ({answered}/{autismQuestions.length})
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default AutismModule;