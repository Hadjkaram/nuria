import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Plus, User } from 'lucide-react';

interface Appointment {
  id: string;
  childName: string;
  professionalName: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const mockAppointments: Appointment[] = [
  { id: '1', childName: 'Kofi Asante', professionalName: 'Dr. Jean Mbeki', date: '2026-03-15', time: '10:00', type: 'Consultation initiale', status: 'scheduled' },
  { id: '2', childName: 'Aïcha Diallo', professionalName: 'Marie Kouassi', date: '2026-03-12', time: '14:30', type: 'Bilan orthophonique', status: 'completed' },
  { id: '3', childName: 'Mamadou Traoré', professionalName: 'Dr. Fatou Diop', date: '2026-03-20', time: '09:00', type: 'Suivi', status: 'scheduled' },
];

const AppointmentsModule: React.FC = () => {
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState(mockAppointments);
  const [showForm, setShowForm] = useState(false);
  const [newAppt, setNewAppt] = useState({ childName: '', professionalName: '', date: '', time: '', type: '' });

  const addAppt = (e: React.FormEvent) => {
    e.preventDefault();
    setAppointments([...appointments, { ...newAppt, id: crypto.randomUUID(), status: 'scheduled' }]);
    setNewAppt({ childName: '', professionalName: '', date: '', time: '', type: '' });
    setShowForm(false);
  };

  const statusStyles: Record<string, string> = {
    scheduled: 'bg-primary/10 text-primary',
    completed: 'bg-secondary/10 text-secondary',
    cancelled: 'bg-destructive/10 text-destructive',
  };

  const statusLabels: Record<string, string> = { scheduled: 'Planifié', completed: 'Terminé', cancelled: 'Annulé' };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('module.appointments')}</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4" /> Nouveau RDV</Button>
      </div>

      {showForm && (
        <form onSubmit={addAppt} className="bg-card rounded-xl p-6 border border-border mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input placeholder="Nom de l'enfant" value={newAppt.childName} onChange={e => setNewAppt({...newAppt, childName: e.target.value})} required className="px-4 py-3 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-ring" />
          <input placeholder="Professionnel" value={newAppt.professionalName} onChange={e => setNewAppt({...newAppt, professionalName: e.target.value})} required className="px-4 py-3 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-ring" />
          <input type="date" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} required className="px-4 py-3 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-ring" />
          <input type="time" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} required className="px-4 py-3 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-ring" />
          <input placeholder="Type de consultation" value={newAppt.type} onChange={e => setNewAppt({...newAppt, type: e.target.value})} required className="px-4 py-3 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-ring" />
          <div className="flex gap-2">
            <Button type="submit">Enregistrer</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {appointments.map(a => (
          <div key={a.id} className="bg-card rounded-xl p-4 border border-border card-hover flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">{a.type}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-3 w-3" /> {a.childName} · {a.professionalName}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3 w-3" /> {a.date} à {a.time}
                </div>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[a.status]}`}>{statusLabels[a.status]}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AppointmentsModule;
