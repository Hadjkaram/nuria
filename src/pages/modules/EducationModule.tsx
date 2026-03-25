import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { FileText, BookOpen } from 'lucide-react';

const sheets = [
  { id: '1', title: 'Adapter l\'environnement de classe pour un enfant avec TDAH', level: 'Maternelle / Primaire' },
  { id: '2', title: 'Stratégies pédagogiques pour les troubles du langage', level: 'Maternelle' },
  { id: '3', title: 'Inclusion scolaire et autisme : guide pratique', level: 'Primaire' },
  { id: '4', title: 'Observation comportementale en classe : grille d\'évaluation', level: 'Tous niveaux' },
  { id: '5', title: 'Aménagements raisonnables pour les troubles des apprentissages', level: 'Primaire' },
];

const recommendations = [
  'Adapter le rythme d\'apprentissage de l\'enfant',
  'Utiliser des supports visuels pour les consignes',
  'Prévoir des pauses régulières',
  'Favoriser le travail en petits groupes',
  'Communiquer régulièrement avec les parents',
  'Utiliser le renforcement positif',
];

const EducationModule: React.FC = () => {
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">{t('module.education')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileText className="h-5 w-5" /> Fiches pédagogiques</h2>
          <div className="space-y-3">
            {sheets.map(s => (
              <div key={s.id} className="bg-card rounded-xl p-4 border border-border card-hover">
                <h3 className="font-medium text-sm mb-1">{s.title}</h3>
                <span className="text-xs text-muted-foreground">{s.level}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5" /> Recommandations</h2>
          <div className="bg-card rounded-xl p-5 border border-border space-y-3">
            {recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">{i + 1}</div>
                <span className="text-sm">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EducationModule;
