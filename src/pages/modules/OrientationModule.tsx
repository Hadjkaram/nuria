import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building, Stethoscope, MapPin } from 'lucide-react';

const professionals = [
  { id: '1', name: 'Dr. Jean Mbeki', specialty: 'Pédopsychiatre', location: 'Abidjan', available: true },
  { id: '2', name: 'Dr. Fatou Diop', specialty: 'Neuropédiatre', location: 'Dakar', available: true },
  { id: '3', name: 'Marie Kouassi', specialty: 'Orthophoniste', location: 'Abidjan', available: false },
  { id: '4', name: 'Dr. Amadou Ba', specialty: 'Psychologue', location: 'Bamako', available: true },
  { id: '5', name: 'Awa Traoré', specialty: 'Psychomotricienne', location: 'Ouagadougou', available: true },
];

const structures = [
  { id: '1', name: 'Centre de Guidance Infantile', type: 'Centre spécialisé', city: 'Abidjan' },
  { id: '2', name: 'Hôpital Pédiatrique', type: 'Hôpital', city: 'Dakar' },
  { id: '3', name: 'Centre de Rééducation', type: 'Centre', city: 'Bamako' },
];

const OrientationModule: React.FC = () => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'professionals' | 'structures'>('professionals');
  const [referralSent, setReferralSent] = useState<string | null>(null);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">{t('module.orientation')}</h1>
      <div className="flex gap-2 mb-6">
        <Button variant={tab === 'professionals' ? 'default' : 'outline'} onClick={() => setTab('professionals')}>
          <Stethoscope className="h-4 w-4" /> Professionnels
        </Button>
        <Button variant={tab === 'structures' ? 'default' : 'outline'} onClick={() => setTab('structures')}>
          <Building className="h-4 w-4" /> Structures
        </Button>
      </div>

      {referralSent && (
        <div className="bg-secondary/10 text-secondary p-4 rounded-lg mb-4 flex justify-between items-center">
          <span>Orientation envoyée avec succès !</span>
          <Button variant="ghost" size="sm" onClick={() => setReferralSent(null)}>✕</Button>
        </div>
      )}

      {tab === 'professionals' ? (
        <div className="space-y-3">
          {professionals.map(p => (
            <div key={p.id} className="bg-card rounded-xl p-4 border border-border card-hover flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{p.name[0]}</div>
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    {p.specialty} · <MapPin className="h-3 w-3" /> {p.location}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${p.available ? 'bg-secondary/10 text-secondary' : 'bg-muted text-muted-foreground'}`}>
                  {p.available ? 'Disponible' : 'Indisponible'}
                </span>
                <Button size="sm" disabled={!p.available} onClick={() => setReferralSent(p.id)}>
                  Orienter <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {structures.map(s => (
            <div key={s.id} className="bg-card rounded-xl p-4 border border-border card-hover flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"><Building className="h-5 w-5 text-accent" /></div>
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-muted-foreground">{s.type} · {s.city}</div>
                </div>
              </div>
              <Button size="sm" onClick={() => setReferralSent(s.id)}>Orienter <ArrowRight className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default OrientationModule;
