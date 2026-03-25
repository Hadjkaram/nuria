import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Video, FileText, Phone, Clock } from 'lucide-react';

const TeleconsultationModule: React.FC = () => {
  const { t } = useLanguage();
  const [activeCall, setActiveCall] = useState(false);

  const pastConsults = [
    { id: '1', professional: 'Dr. Jean Mbeki', date: '2026-03-05', duration: '30 min', notes: 'Bilan initial effectué. Suivi recommandé dans 3 mois.' },
    { id: '2', professional: 'Marie Kouassi', date: '2026-02-20', duration: '45 min', notes: 'Évaluation orthophonique. Programme d\'exercices proposé.' },
  ];

  const upcomingConsults = [
    { id: '3', professional: 'Dr. Fatou Diop', date: '2026-03-20', time: '10:00', child: 'Kofi Asante' },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">{t('module.teleconsult')}</h1>

      {activeCall ? (
        <div className="bg-foreground rounded-2xl p-8 text-center text-background max-w-lg mx-auto">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse-soft">
            <Video className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Consultation en cours</h2>
          <p className="text-background/60 mb-6">Dr. Fatou Diop · Kofi Asante</p>
          <div className="flex justify-center gap-4">
            <Button variant="destructive" size="lg" onClick={() => setActiveCall(false)}>
              <Phone className="h-4 w-4" /> Raccrocher
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Prochaines téléconsultations</h2>
            {upcomingConsults.map(c => (
              <div key={c.id} className="bg-card rounded-xl p-4 border border-border card-hover flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Video className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <div className="font-medium">{c.professional}</div>
                    <div className="text-sm text-muted-foreground">{c.child} · {c.date} à {c.time}</div>
                  </div>
                </div>
                <Button onClick={() => setActiveCall(true)}>
                  <Video className="h-4 w-4" /> Rejoindre
                </Button>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Consultations passées</h2>
            <div className="space-y-3">
              {pastConsults.map(c => (
                <div key={c.id} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{c.professional}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {c.duration}</div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">{c.date}</div>
                  <div className="bg-muted rounded-lg p-3 text-sm flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    {c.notes}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TeleconsultationModule;
