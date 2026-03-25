import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search, FolderOpen, Plus, Calendar, User, FileText, Brain,
  Activity, ClipboardList, ChevronRight, Download, Printer,
  AlertTriangle, CheckCircle, Clock, Filter, Eye, Edit, Trash2,
  Baby, Stethoscope, BookOpen, TrendingUp, X
} from 'lucide-react';

type RecordStatus = 'active' | 'pending' | 'archived' | 'urgent';
type TabType = 'all' | 'active' | 'pending' | 'urgent' | 'archived';

interface Evaluation {
  id: string;
  date: string;
  type: string;
  result: string;
  score?: number;
  professional: string;
}

interface ClinicalNote {
  id: string;
  date: string;
  author: string;
  content: string;
  category: string;
}

interface ChildRecord {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'M' | 'F';
  parentName: string;
  parentPhone: string;
  address: string;
  status: RecordStatus;
  createdAt: string;
  lastVisit: string;
  referredBy: string;
  diagnosis: string[];
  evaluations: Evaluation[];
  notes: ClinicalNote[];
  carePlanActive: boolean;
}

const mockRecords: ChildRecord[] = [
  {
    id: 'REC-001', firstName: 'Kofi', lastName: 'Asante', dob: '2021-03-15', gender: 'M',
    parentName: 'Aminata Koné', parentPhone: '+225 07 12 34 56', address: 'Abidjan, Cocody',
    status: 'active', createdAt: '2024-09-01', lastVisit: '2025-03-05', referredBy: 'Dr. Ouattara',
    diagnosis: ['Retard de langage', 'Suspicion TDAH'],
    evaluations: [
      { id: 'E1', date: '2025-01-15', type: 'Dépistage général', result: 'À risque', score: 65, professional: 'Dr. Ouattara' },
      { id: 'E2', date: '2025-02-20', type: 'Évaluation TDAH', result: 'Positif', score: 78, professional: 'Dr. Mensah' },
      { id: 'E3', date: '2025-03-05', type: 'Bilan orthophonique', result: 'Retard modéré', professional: 'Mme. Traoré' },
    ],
    notes: [
      { id: 'N1', date: '2025-03-05', author: 'Dr. Ouattara', content: 'Progrès notés en compréhension orale. Maintenir les séances d\'orthophonie bi-hebdomadaires.', category: 'Suivi' },
      { id: 'N2', date: '2025-02-20', author: 'Dr. Mensah', content: 'Score TDAH élevé. Recommandation: évaluation approfondie et prise en charge comportementale.', category: 'Évaluation' },
    ],
    carePlanActive: true,
  },
  {
    id: 'REC-002', firstName: 'Aïcha', lastName: 'Diallo', dob: '2022-07-22', gender: 'F',
    parentName: 'Fatou Diallo', parentPhone: '+221 77 890 12 34', address: 'Dakar, Médina',
    status: 'urgent', createdAt: '2025-01-10', lastVisit: '2025-03-08', referredBy: 'Centre communautaire Médina',
    diagnosis: ['Suspicion TSA'],
    evaluations: [
      { id: 'E4', date: '2025-02-01', type: 'M-CHAT-R', result: 'Risque élevé', score: 18, professional: 'Dr. Ndiaye' },
      { id: 'E5', date: '2025-03-08', type: 'Évaluation autisme', result: 'En cours', professional: 'Dr. Sow' },
    ],
    notes: [
      { id: 'N3', date: '2025-03-08', author: 'Dr. Sow', content: 'Absence de contact visuel, écholalie. Évaluation ADOS-2 programmée pour le 20 mars.', category: 'Observation' },
    ],
    carePlanActive: false,
  },
  {
    id: 'REC-003', firstName: 'Mamadou', lastName: 'Traoré', dob: '2020-11-03', gender: 'M',
    parentName: 'Moussa Traoré', parentPhone: '+223 66 78 90 12', address: 'Bamako, Kalaban-Coura',
    status: 'active', createdAt: '2024-06-15', lastVisit: '2025-02-28', referredBy: 'École Les Petits Génies',
    diagnosis: ['Trouble du comportement', 'Retard psychomoteur'],
    evaluations: [
      { id: 'E6', date: '2024-09-10', type: 'Bilan psychomoteur', result: 'Retard léger', score: 72, professional: 'Mme. Coulibaly' },
      { id: 'E7', date: '2025-01-20', type: 'Évaluation comportementale', result: 'Difficultés modérées', score: 55, professional: 'Dr. Keita' },
    ],
    notes: [
      { id: 'N4', date: '2025-02-28', author: 'Dr. Keita', content: 'Amélioration du comportement en groupe. Parents impliqués dans le programme de guidance.', category: 'Suivi' },
    ],
    carePlanActive: true,
  },
  {
    id: 'REC-004', firstName: 'Nana', lastName: 'Osei', dob: '2023-01-10', gender: 'F',
    parentName: 'Awa Ndiaye', parentPhone: '+225 05 67 89 01', address: 'Abidjan, Yopougon',
    status: 'pending', createdAt: '2025-02-20', lastVisit: '2025-02-20', referredBy: 'Auto-référencement (parent)',
    diagnosis: [],
    evaluations: [
      { id: 'E8', date: '2025-02-20', type: 'Dépistage général', result: 'En attente', professional: 'Dr. Ouattara' },
    ],
    notes: [],
    carePlanActive: false,
  },
  {
    id: 'REC-005', firstName: 'Ibrahim', lastName: 'Bah', dob: '2019-05-18', gender: 'M',
    parentName: 'Mariama Bah', parentPhone: '+224 62 34 56 78', address: 'Conakry, Matam',
    status: 'archived', createdAt: '2023-03-01', lastVisit: '2024-12-15', referredBy: 'Dr. Barry',
    diagnosis: ['Retard de langage (résolu)'],
    evaluations: [
      { id: 'E9', date: '2023-06-10', type: 'Bilan orthophonique', result: 'Retard sévère', score: 35, professional: 'Mme. Diallo' },
      { id: 'E10', date: '2024-06-10', type: 'Bilan orthophonique', result: 'Normal', score: 88, professional: 'Mme. Diallo' },
    ],
    notes: [
      { id: 'N5', date: '2024-12-15', author: 'Mme. Diallo', content: 'Développement langagier normalisé. Sortie du programme avec suivi annuel recommandé.', category: 'Clôture' },
    ],
    carePlanActive: false,
  },
];

const statusConfig: Record<RecordStatus, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: 'Actif', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertTriangle },
  archived: { label: 'Archivé', color: 'bg-muted text-muted-foreground', icon: FolderOpen },
};

const RecordsModule: React.FC = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedRecord, setSelectedRecord] = useState<ChildRecord | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'evaluations' | 'notes' | 'timeline'>('overview');
  const [showNewNote, setShowNewNote] = useState(false);
  const [records, setRecords] = useState(mockRecords);
  const [newNote, setNewNote] = useState({ content: '', category: 'Suivi' });

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'Tous', count: records.length },
    { key: 'active', label: 'Actifs', count: records.filter(r => r.status === 'active').length },
    { key: 'pending', label: 'En attente', count: records.filter(r => r.status === 'pending').length },
    { key: 'urgent', label: 'Urgents', count: records.filter(r => r.status === 'urgent').length },
    { key: 'archived', label: 'Archivés', count: records.filter(r => r.status === 'archived').length },
  ];

  const filtered = records.filter(r => {
    const matchesSearch = `${r.firstName} ${r.lastName} ${r.id} ${r.parentName}`.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'all' || r.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const addNote = (recordId: string) => {
    if (!newNote.content.trim()) return;
    setRecords(prev => prev.map(r => {
      if (r.id !== recordId) return r;
      return {
        ...r,
        notes: [{ id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0], author: 'Vous', content: newNote.content, category: newNote.category }, ...r.notes],
      };
    }));
    if (selectedRecord?.id === recordId) {
      setSelectedRecord(prev => prev ? {
        ...prev,
        notes: [{ id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0], author: 'Vous', content: newNote.content, category: newNote.category }, ...prev.notes],
      } : null);
    }
    setNewNote({ content: '', category: 'Suivi' });
    setShowNewNote(false);
  };

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    if (years < 2) return `${years * 12 + months} mois`;
    return `${years} ans`;
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Detail view
  if (selectedRecord) {
    const rec = selectedRecord;
    const StatusIcon = statusConfig[rec.status].icon;
    const detailTabs = [
      { key: 'overview' as const, label: 'Vue d\'ensemble', icon: Eye },
      { key: 'evaluations' as const, label: 'Évaluations', icon: ClipboardList },
      { key: 'notes' as const, label: 'Notes cliniques', icon: FileText },
      { key: 'timeline' as const, label: 'Chronologie', icon: Activity },
    ];

    return (
      <DashboardLayout>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
              {rec.firstName[0]}{rec.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{rec.firstName} {rec.lastName}</h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[rec.status].color}`}>
                  <StatusIcon className="h-3 w-3" /> {statusConfig[rec.status].label}
                </span>
              </div>
              <p className="text-muted-foreground text-sm mt-0.5">
                {rec.id} · {calculateAge(rec.dob)} · {rec.gender === 'M' ? 'Masculin' : 'Féminin'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => { setSelectedRecord(null); setDetailTab('overview'); }}>
              <X className="h-4 w-4" /> Fermer
            </Button>
            <Button variant="outline" size="sm"><Printer className="h-4 w-4" /> Imprimer</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Exporter</Button>
          </div>
        </div>

        {/* Detail Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6 overflow-x-auto">
          {detailTabs.map(tab => (
            <button key={tab.key} onClick={() => setDetailTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${detailTab === tab.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {detailTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Identity */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><Baby className="h-4 w-4 text-primary" /> Identité de l'enfant</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {[
                    ['Nom complet', `${rec.firstName} ${rec.lastName}`],
                    ['Date de naissance', `${rec.dob} (${calculateAge(rec.dob)})`],
                    ['Genre', rec.gender === 'M' ? 'Masculin' : 'Féminin'],
                    ['N° Dossier', rec.id],
                    ['Date d\'ouverture', rec.createdAt],
                    ['Référé par', rec.referredBy],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-1">
                      <span className="text-muted-foreground text-xs">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parent info */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><User className="h-4 w-4 text-primary" /> Parent / Tuteur</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {[
                    ['Nom', rec.parentName],
                    ['Téléphone', rec.parentPhone],
                    ['Adresse', rec.address],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-1">
                      <span className="text-muted-foreground text-xs">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnoses */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><Brain className="h-4 w-4 text-primary" /> Diagnostics / Hypothèses</h3>
                {rec.diagnosis.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {rec.diagnosis.map((d, i) => (
                      <Badge key={i} variant="secondary" className="text-sm py-1 px-3">{d}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Aucun diagnostic posé pour le moment.</p>
                )}
              </div>
            </div>

            {/* Sidebar summary */}
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold mb-4">Résumé</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Évaluations</span>
                    <span className="font-semibold">{rec.evaluations.length}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Notes cliniques</span>
                    <span className="font-semibold">{rec.notes.length}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Dernière visite</span>
                    <span className="font-semibold">{rec.lastVisit}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Plan PEC</span>
                    <span className={`font-semibold ${rec.carePlanActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                      {rec.carePlanActive ? 'Actif' : 'Aucun'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 space-y-3">
                <h3 className="font-semibold mb-2">Actions rapides</h3>
                <Button className="w-full justify-start" size="sm"><ClipboardList className="h-4 w-4" /> Nouvelle évaluation</Button>
                <Button className="w-full justify-start" variant="outline" size="sm" onClick={() => { setDetailTab('notes'); setShowNewNote(true); }}>
                  <FileText className="h-4 w-4" /> Ajouter une note
                </Button>
                <Button className="w-full justify-start" variant="outline" size="sm"><Stethoscope className="h-4 w-4" /> Créer plan PEC</Button>
                <Button className="w-full justify-start" variant="outline" size="sm"><Calendar className="h-4 w-4" /> Planifier RDV</Button>
              </div>
            </div>
          </div>
        )}

        {/* Evaluations Tab */}
        {detailTab === 'evaluations' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Historique des évaluations</h3>
              <Button size="sm"><Plus className="h-4 w-4" /> Nouvelle évaluation</Button>
            </div>
            {rec.evaluations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">Aucune évaluation enregistrée</div>
            ) : (
              <div className="space-y-3">
                {rec.evaluations.map(ev => (
                  <div key={ev.id} className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{ev.type}</span>
                        <Badge variant="outline" className="text-xs">{ev.result}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{ev.professional} · {ev.date}</p>
                    </div>
                    {ev.score !== undefined && (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Score</div>
                          <div className={`text-2xl font-bold ${getScoreColor(ev.score)}`}>{ev.score}</div>
                        </div>
                        <div className="w-16 h-16 relative">
                          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                            <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3" className="stroke-muted" />
                            <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3"
                              strokeDasharray={`${ev.score} ${100 - ev.score}`}
                              className={ev.score >= 80 ? 'stroke-emerald-500' : ev.score >= 60 ? 'stroke-amber-500' : 'stroke-red-500'} />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {detailTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Notes cliniques</h3>
              <Button size="sm" onClick={() => setShowNewNote(!showNewNote)}>
                <Plus className="h-4 w-4" /> Ajouter une note
              </Button>
            </div>

            {showNewNote && (
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <div className="flex gap-3">
                  <select value={newNote.category} onChange={e => setNewNote({ ...newNote, category: e.target.value })}
                    className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring outline-none">
                    {['Suivi', 'Évaluation', 'Observation', 'Clôture', 'Autre'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <textarea value={newNote.content} onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Saisissez votre note clinique..."
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none min-h-[120px] text-sm" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => addNote(rec.id)}>Enregistrer</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowNewNote(false)}>Annuler</Button>
                </div>
              </div>
            )}

            {rec.notes.length === 0 && !showNewNote ? (
              <div className="text-center py-12 text-muted-foreground">Aucune note clinique</div>
            ) : (
              <div className="space-y-3">
                {rec.notes.map(note => (
                  <div key={note.id} className="bg-card rounded-xl border border-border p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{note.category}</Badge>
                        <span className="text-sm text-muted-foreground">{note.date}</span>
                      </div>
                      <span className="text-sm font-medium">{note.author}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {detailTab === 'timeline' && (
          <div className="space-y-4">
            <h3 className="font-semibold">Chronologie du dossier</h3>
            <div className="relative pl-8 space-y-6">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />
              {[
                ...rec.evaluations.map(e => ({ date: e.date, type: 'evaluation' as const, title: e.type, detail: `${e.result}${e.score ? ` (Score: ${e.score})` : ''} – ${e.professional}` })),
                ...rec.notes.map(n => ({ date: n.date, type: 'note' as const, title: `Note: ${n.category}`, detail: `${n.content.slice(0, 100)}${n.content.length > 100 ? '...' : ''} – ${n.author}` })),
                { date: rec.createdAt, type: 'event' as const, title: 'Ouverture du dossier', detail: `Référé par ${rec.referredBy}` },
              ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-5 w-4 h-4 rounded-full border-2 border-background ${
                    item.type === 'evaluation' ? 'bg-primary' : item.type === 'note' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <div className="bg-card rounded-xl border border-border p-4">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DashboardLayout>
    );
  }

  // List view
  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('sidebar.childRecords')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} dossier{filtered.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Exporter</Button>
          <Button size="sm"><Plus className="h-4 w-4" /> Nouveau dossier</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Actifs', count: records.filter(r => r.status === 'active').length, icon: CheckCircle, color: 'text-emerald-600' },
          { label: 'En attente', count: records.filter(r => r.status === 'pending').length, icon: Clock, color: 'text-amber-600' },
          { label: 'Urgents', count: records.filter(r => r.status === 'urgent').length, icon: AlertTriangle, color: 'text-red-600' },
          { label: 'Archivés', count: records.filter(r => r.status === 'archived').length, icon: FolderOpen, color: 'text-muted-foreground' },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold">{stat.count}</div>
          </div>
        ))}
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, ID ou parent..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring outline-none" />
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-muted rounded-lg mb-4 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}>
            {tab.label} <span className="text-xs opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Records List */}
      <div className="space-y-2">
        {filtered.map(rec => {
          const StatusIcon = statusConfig[rec.status].icon;
          return (
            <button key={rec.id} onClick={() => setSelectedRecord(rec)}
              className="w-full bg-card rounded-xl p-4 border border-border card-hover flex items-center justify-between text-left group">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                  {rec.firstName[0]}{rec.lastName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{rec.firstName} {rec.lastName}</span>
                    <span className="text-xs text-muted-foreground">{rec.id}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[rec.status].color}`}>
                      <StatusIcon className="h-3 w-3" /> {statusConfig[rec.status].label}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{calculateAge(rec.dob)}</span>
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{rec.parentName}</span>
                    <span>{rec.evaluations.length} éval. · {rec.notes.length} notes</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground shrink-0" />
            </button>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">Aucun dossier trouvé</p>}
      </div>
    </DashboardLayout>
  );
};

export default RecordsModule;
