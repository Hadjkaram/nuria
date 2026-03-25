import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Video, FileText, Award, CheckCircle2, Circle } from 'lucide-react';

const modules = [
  {
    id: '1',
    title: 'Introduction aux troubles du neurodéveloppement',
    lessons: [
      { id: 'l1', title: 'Définition et classification des TND', type: 'video', completed: true },
      { id: 'l2', title: 'Épidémiologie en Afrique', type: 'document', completed: true },
      { id: 'l3', title: 'Quiz d\'évaluation', type: 'quiz', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Repérage précoce des signes d\'alerte',
    lessons: [
      { id: 'l4', title: 'Jalons du développement 0-5 ans', type: 'video', completed: false },
      { id: 'l5', title: 'Outils de repérage', type: 'document', completed: false },
      { id: 'l6', title: 'Études de cas pratiques', type: 'document', completed: false },
      { id: 'l7', title: 'Quiz d\'évaluation', type: 'quiz', completed: false },
    ],
  },
  {
    id: '3',
    title: 'Autisme : repérage et accompagnement',
    lessons: [
      { id: 'l8', title: 'Signes précoces de l\'autisme', type: 'video', completed: false },
      { id: 'l9', title: 'Outils de dépistage M-CHAT', type: 'document', completed: false },
      { id: 'l10', title: 'Quiz d\'évaluation', type: 'quiz', completed: false },
    ],
  },
];

const typeIcons: Record<string, React.ElementType> = { video: Video, document: FileText, quiz: Award };

const TrainingModule: React.FC = () => {
  const { t } = useLanguage();
  const [completedLessons, setCompleted] = useState<Set<string>>(new Set(['l1', 'l2']));

  const toggleComplete = (id: string) => {
    const next = new Set(completedLessons);
    if (next.has(id)) next.delete(id); else next.add(id);
    setCompleted(next);
  };

  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);
  const completedCount = completedLessons.size;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-2">{t('module.training')}</h1>
      <p className="text-muted-foreground mb-6">Centre de formation en neurodéveloppement</p>

      <div className="bg-card rounded-xl p-5 border border-border mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Progression globale</span>
          <span className="font-medium">{completedCount}/{totalLessons}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div className="h-3 rounded-full bg-primary transition-all" style={{ width: `${(completedCount / totalLessons) * 100}%` }} />
        </div>
      </div>

      <div className="space-y-6">
        {modules.map(m => {
          const modCompleted = m.lessons.filter(l => completedLessons.has(l.id)).length;
          return (
            <div key={m.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{m.title}</h3>
                  <span className="text-xs text-muted-foreground">{modCompleted}/{m.lessons.length}</span>
                </div>
              </div>
              <div className="divide-y divide-border">
                {m.lessons.map(l => {
                  const Icon = typeIcons[l.type] || FileText;
                  const done = completedLessons.has(l.id);
                  return (
                    <button key={l.id} onClick={() => toggleComplete(l.id)} className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left">
                      {done ? <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0" /> : <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
                      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className={`text-sm ${done ? 'line-through text-muted-foreground' : ''}`}>{l.title}</span>
                      <span className="text-xs text-muted-foreground ml-auto capitalize">{l.type}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default TrainingModule;
