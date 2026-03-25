import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { BookOpen, Video, FileText, Dumbbell } from 'lucide-react';

const resources = [
  { id: '1', title: 'Comprendre le développement de votre enfant (0-3 ans)', type: 'guide', category: 'Développement', icon: FileText },
  { id: '2', title: 'Exercices de stimulation du langage à la maison', type: 'exercice', category: 'Langage', icon: Dumbbell },
  { id: '3', title: 'Comment favoriser l\'interaction sociale', type: 'vidéo', category: 'Social', icon: Video },
  { id: '4', title: 'Activités sensorielles pour l\'enfant', type: 'guide', category: 'Sensoriel', icon: BookOpen },
  { id: '5', title: 'Routine quotidienne structurée', type: 'exercice', category: 'Comportement', icon: Dumbbell },
  { id: '6', title: 'Techniques de communication alternative', type: 'vidéo', category: 'Communication', icon: Video },
  { id: '7', title: 'Gestion des crises et des comportements difficiles', type: 'guide', category: 'Comportement', icon: FileText },
  { id: '8', title: 'Jeux pour la motricité fine', type: 'exercice', category: 'Motricité', icon: Dumbbell },
];

const typeColors: Record<string, string> = {
  guide: 'bg-nuria-blue/10 text-nuria-blue',
  exercice: 'bg-nuria-green/10 text-nuria-green',
  'vidéo': 'bg-nuria-orange/10 text-nuria-orange',
};

const GuidanceModule: React.FC = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter ? resources.filter(r => r.type === filter) : resources;
  const types = ['guide', 'exercice', 'vidéo'];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">{t('module.guidance')}</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilter(null)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>Tout</button>
        {types.map(tp => (
          <button key={tp} onClick={() => setFilter(tp)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === tp ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{tp}s</button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(r => {
          const Icon = r.icon;
          return (
            <div key={r.id} className="bg-card rounded-xl p-5 border border-border card-hover">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[r.type]}`}>{r.type}</span>
                <span className="text-xs text-muted-foreground">{r.category}</span>
              </div>
              <Icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-medium text-sm">{r.title}</h3>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default GuidanceModule;
