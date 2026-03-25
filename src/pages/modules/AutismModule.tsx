import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const autismQuestions = [
  { id: 'c1', text: 'L\'enfant regarde-t-il dans les yeux quand on lui parle ?', category: 'communication', positive: true },
  { id: 'c2', text: 'L\'enfant pointe-t-il du doigt pour montrer quelque chose ?', category: 'communication', positive: true },
  { id: 'c3', text: 'L\'enfant utilise-t-il des mots ou des gestes pour communiquer ?', category: 'communication', positive: true },
  { id: 'c4', text: 'L\'enfant comprend-il des consignes simples ?', category: 'communication', positive: true },
  { id: 's1', text: 'L\'enfant sourit-il en réponse à un sourire ?', category: 'interactions', positive: true },
  { id: 's2', text: 'L\'enfant s\'intéresse-t-il aux autres enfants ?', category: 'interactions', positive: true },
  { id: 's3', text: 'L\'enfant partage-t-il ses jouets ?', category: 'interactions', positive: true },
  { id: 's4', text: 'L\'enfant montre-t-il de l\'empathie ?', category: 'interactions', positive: true },
  { id: 'r1', text: 'L\'enfant aligne-t-il souvent des objets ?', category: 'comportements', positive: false },
  { id: 'r2', text: 'L\'enfant a-t-il des mouvements répétitifs ?', category: 'comportements', positive: false },
  { id: 'r3', text: 'L\'enfant réagit-il fortement aux changements de routine ?', category: 'comportements', positive: false },
  { id: 'r4', text: 'L\'enfant a-t-il des intérêts restreints et intenses ?', category: 'comportements', positive: false },
];

const catColors: Record<string, string> = {
  communication: 'bg-nuria-blue/10 text-nuria-blue',
  interactions: 'bg-nuria-green/10 text-nuria-green',
  comportements: 'bg-nuria-orange/10 text-nuria-orange',
};

const AutismModule: React.FC = () => {
  const { t } = useLanguage();
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [submitted, setSubmitted] = useState(false);

  const answered = Object.keys(answers).length;
  const concerns = autismQuestions.filter(q => {
    const a = answers[q.id];
    if (a === null || a === undefined) return false;
    return q.positive ? !a : a;
  }).length;

  const riskLevel = concerns >= 6 ? 'high' : concerns >= 3 ? 'medium' : 'low';

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">{t('module.autism')}</h1>

      {submitted ? (
        <div className="max-w-lg mx-auto text-center">
          <div className={`rounded-xl p-8 mb-6 ${riskLevel === 'high' ? 'bg-destructive/10' : riskLevel === 'medium' ? 'bg-accent/10' : 'bg-secondary/10'}`}>
            {riskLevel === 'high' ? <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" /> : <CheckCircle2 className="h-12 w-12 text-secondary mx-auto mb-4" />}
            <h2 className="text-xl font-bold mb-2">
              {riskLevel === 'high' ? 'Risque élevé' : riskLevel === 'medium' ? 'Surveillance recommandée' : 'Pas de signes majeurs'}
            </h2>
            <p className="text-muted-foreground mb-4">{concerns} signe(s) de préoccupation sur {autismQuestions.length} items évalués.</p>
            <div className="space-y-2 text-left">
              {['communication', 'interactions', 'comportements'].map(cat => {
                const qs = autismQuestions.filter(q => q.category === cat);
                const c = qs.filter(q => {
                  const a = answers[q.id];
                  return q.positive ? !a : a;
                }).length;
                return (
                  <div key={cat} className="flex justify-between text-sm py-1 border-b border-border">
                    <span className="capitalize">{cat}</span>
                    <span>{c}/{qs.length} préoccupation(s)</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => { setAnswers({}); setSubmitted(false); }}>Nouveau repérage</Button>
            <Button variant="outline">Orienter</Button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <p className="text-muted-foreground mb-6">Répondez aux questions suivantes basées sur vos observations de l'enfant.</p>
          <div className="space-y-3">
            {autismQuestions.map(q => (
              <div key={q.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between gap-4">
                <div className="flex-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColors[q.category]} mb-1 inline-block`}>{q.category}</span>
                  <p className="text-sm mt-1">{q.text}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setAnswers({ ...answers, [q.id]: true })} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${answers[q.id] === true ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>Oui</button>
                  <button onClick={() => setAnswers({ ...answers, [q.id]: false })} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${answers[q.id] === false ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'}`}>Non</button>
                </div>
              </div>
            ))}
          </div>
          <Button size="lg" className="w-full mt-6" onClick={() => setSubmitted(true)} disabled={answered < autismQuestions.length}>
            Valider le repérage ({answered}/{autismQuestions.length})
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AutismModule;
