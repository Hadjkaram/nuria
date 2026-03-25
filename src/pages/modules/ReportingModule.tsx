import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const screeningData = [
  { month: 'Jan', count: 45 },
  { month: 'Fév', count: 62 },
  { month: 'Mar', count: 78 },
  { month: 'Avr', count: 55 },
  { month: 'Mai', count: 91 },
  { month: 'Jun', count: 84 },
];

const disorderData = [
  { name: 'Autisme', value: 28, color: '#1a6fb5' },
  { name: 'TDAH', value: 22, color: '#e8932f' },
  { name: 'Langage', value: 25, color: '#2a9d6e' },
  { name: 'Apprentissage', value: 15, color: '#7c3aed' },
  { name: 'Retard', value: 10, color: '#dc2626' },
];

const orientationData = [
  { month: 'Jan', orientations: 12, completed: 8 },
  { month: 'Fév', orientations: 18, completed: 14 },
  { month: 'Mar', orientations: 25, completed: 20 },
  { month: 'Avr', orientations: 15, completed: 13 },
  { month: 'Mai', orientations: 30, completed: 22 },
  { month: 'Jun', orientations: 28, completed: 25 },
];

const ReportingModule: React.FC = () => {
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">{t('module.reporting')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="font-semibold mb-4">Dépistages par mois</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={screeningData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border">
          <h3 className="font-semibold mb-4">Répartition par trouble</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={disorderData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {disorderData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border lg:col-span-2">
          <h3 className="font-semibold mb-4">Orientations et suivi</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={orientationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="orientations" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="completed" stroke="hsl(var(--nuria-green))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportingModule;
