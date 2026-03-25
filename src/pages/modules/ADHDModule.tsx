import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

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
  { id: 'h6', text: 'Parle souvent trop', category: 'hyperactivité' },
  { id: 'im1', text: 'Laisse échapper la réponse avant la fin de la question', category: 'impulsivité' },
  { id: 'im2', text: 'A du mal à attendre son tour', category: 'impulsivité' },
  { id: 'im3', text: 'Interrompt souvent les autres', category: 'impulsivité' },
];

const catColors: Record<string, string> = {
  inattention: 'bg-nuria-blue/10 text-nuria-blue',
  hyperactivité: 'bg-nuria-orange/10 text-nuria-orange',
  impulsivité: 'bg-nuria-red/10 text-nuria-red',
};

const scores = ['jamais', 'parfois', 'souvent', 'très souvent'];

const ADHDModule: React.FC = () => {
  const { t } = useLanguage();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = (qId: string, score: number) => setAnswers({ ...answers, [qId]: score });

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxScore = adhdQuestions.length * 3;
  const answered = Object.keys(answers).length;

  const getCategory = (cat: string) => {
    const qs = adhdQuestions.filter(q => q.category === cat);
    const s = qs.reduce((a, q) => a + (answers[q.id] || 0), 0);
    return { score: s, max: qs.length * 3, pct: Math.round((s / (qs.length * 3)) * 100) };
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">{t('module.adhd')}</h1>

      {submitted ? (
        <div className="max-w-lg mx-auto text-center">
          <div className={`rounded-xl p-8 mb-6 ${totalScore > maxScore * 0.6 ? 'bg-destructive/10' : totalScore > maxScore * 0.3 ? 'bg-accent/10' : 'bg-secondary/10'}`}>
            {totalScore > maxScore * 0.6 ? <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" /> : <CheckCircle2 className="h-12 w-12 text-secondary mx-auto mb-4" />}
            <h2 className="text-xl font-bold mb-4">Score total : {totalScore}/{maxScore}</h2>
            <div className="space-y-3 text-left">
              {['inattention', 'hyperactivité', 'impulsivité'].map(cat => {
                const c = getCategory(cat);
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize font-medium">{cat}</span>
                      <span>{c.score}/{c.max} ({c.pct}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <Button onClick={() => { setAnswers({}); setSubmitted(false); }}>Nouvelle évaluation</Button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <p className="text-muted-foreground mb-6">Évaluez la fréquence de chaque comportement observé chez l'enfant.</p>
          <div className="space-y-3">
            {adhdQuestions.map(q => (
              <div key={q.id} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColors[q.category]}`}>{q.category}</span>
                </div>
                <p className="text-sm mb-3">{q.text}</p>
                <div className="flex gap-2">
                  {scores.map((s, i) => (
                    <button key={i} onClick={() => handleAnswer(q.id, i)} className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${answers[q.id] === i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button size="lg" className="w-full" onClick={() => setSubmitted(true)} disabled={answered < adhdQuestions.length}>
              Valider l'évaluation ({answered}/{adhdQuestions.length})
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ADHDModule;
