import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Users, MapPin, ArrowRight, Plus } from 'lucide-react';

const mockFamilies = [
  { id: '1', name: 'Famille Koné', location: 'Quartier Cocody, Abidjan', children: 2, status: 'suivi' },
  { id: '2', name: 'Famille Diallo', location: 'Médina, Dakar', children: 1, status: 'repéré' },
  { id: '3', name: 'Famille Traoré', location: 'Badalabougou, Bamako', children: 3, status: 'orienté' },
];

const statusStyles: Record<string, string> = {
  suivi: 'bg-secondary/10 text-secondary',
  repéré: 'bg-accent/10 text-accent',
  orienté: 'bg-primary/10 text-primary',
};

const CommunityModule: React.FC = () => {
  const { t } = useLanguage();
  const [families] = useState(mockFamilies);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('module.community')}</h1>
        <Button><Plus className="h-4 w-4" /> Ajouter une famille</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-5 border border-border text-center">
          <div className="text-3xl font-bold text-primary">{families.length}</div>
          <div className="text-sm text-muted-foreground">Familles suivies</div>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border text-center">
          <div className="text-3xl font-bold text-nuria-orange">{families.reduce((a, f) => a + f.children, 0)}</div>
          <div className="text-sm text-muted-foreground">Enfants repérés</div>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border text-center">
          <div className="text-3xl font-bold text-secondary">{families.filter(f => f.status === 'orienté').length}</div>
          <div className="text-sm text-muted-foreground">Orientations</div>
        </div>
      </div>

      <div className="space-y-3">
        {families.map(f => (
          <div key={f.id} className="bg-card rounded-xl p-4 border border-border card-hover flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
              <div>
                <div className="font-medium">{f.name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {f.location} · {f.children} enfant(s)</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[f.status]}`}>{f.status}</span>
              <Button size="sm" variant="outline"><ArrowRight className="h-3 w-3" /></Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default CommunityModule;
