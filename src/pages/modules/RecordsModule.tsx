import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search, FolderOpen, Plus, Calendar, User, FileText, Brain,
  Activity, ClipboardList, ChevronRight, Download, Printer,
  AlertTriangle, CheckCircle, Clock, Eye, MapPin, X, Loader2, Baby, Stethoscope
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type RecordStatus = 'active' | 'pending' | 'archived' | 'urgent';
type TabType = 'all' | 'active' | 'pending' | 'urgent' | 'archived';

// Interface adaptée aux données de la table 'screenings'
interface ChildRecord {
  id: string;
  child_name: string;
  dob: string;
  gender: 'M' | 'F' | string;
  parent_name: string;
  parent_contact: string;
  location: string;
  status: RecordStatus;
  created_at: string;
  risk_level: string;
  score: number;
  evaluations: any[]; // Gardé pour la structure UI
  notes: any[];       // Gardé pour la structure UI
  carePlanActive: boolean;
}

const statusConfig: Record<RecordStatus, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: 'Actif (Suivi normal)', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
  pending: { label: 'En attente (Risque Moyen)', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  urgent: { label: 'Urgent (Risque Élevé)', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertTriangle },
  archived: { label: 'Archivé', color: 'bg-muted text-muted-foreground', icon: FolderOpen },
};

const RecordsModule: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [records, setRecords] = useState<ChildRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedRecord, setSelectedRecord] = useState<ChildRecord | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'evaluations' | 'notes' | 'timeline'>('overview');

  // LECTURE DEPUIS SUPABASE
  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('screenings')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transformation des données Supabase pour correspondre à notre UI de Dossier
        const formattedRecords: ChildRecord[] = (data || []).map((item: any) => {
          
          // Détermination intelligente du statut basé sur le risque M-CHAT-R
          let recordStatus: RecordStatus = 'active';
          if (item.risk_level?.includes('Élevé')) recordStatus = 'urgent';
          else if (item.risk_level?.includes('Moyen')) recordStatus = 'pending';

          return {
            id: item.id,
            child_name: item.child_name,
            dob: item.dob,
            gender: item.gender,
            parent_name: item.parent_name || 'Non renseigné',
            parent_contact: item.parent_contact || 'Non renseigné',
            location: item.location,
            status: recordStatus,
            created_at: new Date(item.created_at).toLocaleDateString('fr-FR'),
            risk_level: item.risk_level,
            score: item.score,
            evaluations: [
              { id: 'E1', date: new Date(item.created_at).toLocaleDateString('fr-FR'), type: 'M-CHAT-R', result: item.risk_level, score: item.score, professional: 'Agent NURIA' }
            ],
            notes: [], // Vide pour l'instant
            carePlanActive: false,
          };
        });

        setRecords(formattedRecords);
      } catch (err: any) {
        toast({ title: "Erreur", description: "Impossible de charger les dossiers : " + err.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, [toast]);

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'Tous', count: records.length },
    { key: 'active', label: 'Actifs', count: records.filter(r => r.status === 'active').length },
    { key: 'pending', label: 'En attente', count: records.filter(r => r.status === 'pending').length },
    { key: 'urgent', label: 'Urgents', count: records.filter(r => r.status === 'urgent').length },
    { key: 'archived', label: 'Archivés', count: records.filter(r => r.status === 'archived').length },
  ];

  const filtered = records.filter(r => {
    const matchesSearch = `${r.child_name} ${r.parent_name}`.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'all' || r.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const calculateAge = (dob: string) => {
    if (!dob) return 'Âge inconnu';
    const birth = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    let totalMonths = years * 12 + months;
    if (totalMonths < 12) return `${totalMonths} mois`;
    return `${Math.floor(totalMonths/12)} ans ${totalMonths%12} mois`;
  };

  const getScoreColor = (score?: number) => {
    if (score === undefined) return 'text-muted-foreground';
    if (score >= 8) return 'text-red-600 dark:text-red-400';
    if (score >= 3) return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  // -------------------------------------------------------------------------
  // VUE DÉTAIL DU DOSSIER
  // -------------------------------------------------------------------------
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
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold ${statusConfig[rec.status].color.replace('text-', 'bg-').replace('100', '200')}`}>
              {rec.child_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{rec.child_name}</h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[rec.status].color}`}>
                  <StatusIcon className="h-3 w-3" /> {statusConfig[rec.status].label}
                </span>
              </div>
              <p className="text-muted-foreground text-sm mt-0.5 flex items-center gap-2">
                ID: {rec.id.substring(0,8)}... · {calculateAge(rec.dob)} · {rec.gender === 'M' ? 'Garçon' : 'Fille'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => { setSelectedRecord(null); setDetailTab('overview'); }}>
              <X className="h-4 w-4 mr-2" /> Fermer le dossier
            </Button>
            <Button variant="outline" size="sm"><Printer className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Detail Tabs Nav */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6 overflow-x-auto">
          {detailTabs.map(tab => (
            <button key={tab.key} onClick={() => setDetailTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${detailTab === tab.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab Content */}
        {detailTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Identity */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><Baby className="h-4 w-4 text-primary" /> Identité du patient</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                  {[
                    ['Nom complet', rec.child_name],
                    ['Date de naissance', `${rec.dob} (${calculateAge(rec.dob)})`],
                    ['Genre', rec.gender === 'M' ? 'Garçon' : 'Fille'],
                    ['Lieu de résidence', rec.location],
                    ['Date du 1er dépistage', rec.created_at],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-1">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">{label}</span>
                      <span className="font-bold text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parent info */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><User className="h-4 w-4 text-primary" /> Parent / Tuteur responsable</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                  {[
                    ['Nom', rec.parent_name],
                    ['Contact téléphonique', rec.parent_contact],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-1">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">{label}</span>
                      <span className="font-bold text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnoses / Risques */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm border-t-4 border-t-primary">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><Brain className="h-4 w-4 text-primary" /> Profil Clinique & Risques</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={`text-sm py-1.5 px-4 font-bold border-2 ${statusConfig[rec.status].color.split(' ')[1].replace('text', 'border')}`}>
                    M-CHAT-R : {rec.risk_level} (Score: {rec.score})
                  </Badge>
                </div>
              </div>
            </div>

            {/* Sidebar summary */}
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm bg-slate-50">
                <h3 className="font-bold mb-4 uppercase text-sm tracking-wider text-slate-500">Résumé du dossier</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Évaluations réalisées</span>
                    <span className="font-black text-primary">{rec.evaluations.length}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Notes cliniques</span>
                    <span className="font-black text-primary">{rec.notes.length}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Dernier contact</span>
                    <span className="font-bold">{rec.created_at}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Plan PEC Actif</span>
                    <span className={`font-bold ${rec.carePlanActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {rec.carePlanActive ? 'Oui' : 'Non'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 space-y-3 shadow-sm">
                <h3 className="font-bold mb-3 uppercase text-sm tracking-wider text-slate-500">Actions médicales</h3>
                <Button className="w-full justify-start font-medium" size="sm"><ClipboardList className="h-4 w-4 mr-2" /> Démarrer un bilan</Button>
                <Button className="w-full justify-start font-medium" variant="outline" size="sm"><FileText className="h-4 w-4 mr-2" /> Ajouter une note</Button>
                <Button className="w-full justify-start font-medium" variant="outline" size="sm"><Stethoscope className="h-4 w-4 mr-2" /> Créer un plan PEC</Button>
                <Button className="w-full justify-start font-medium" variant="outline" size="sm"><Calendar className="h-4 w-4 mr-2" /> Planifier un RDV</Button>
              </div>
            </div>
          </div>
        )}

        {/* Evaluations Tab */}
        {detailTab === 'evaluations' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Historique des dépistages et évaluations</h3>
            </div>
            {rec.evaluations.map(ev => (
              <div key={ev.id} className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row justify-between gap-4 shadow-sm">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg">{ev.type}</span>
                    <Badge variant="outline" className={`font-bold ${getScoreColor(ev.score)}`}>{ev.result}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Réalisé par : {ev.professional} le {ev.date}</p>
                </div>
                {ev.score !== undefined && (
                  <div className="flex flex-col items-end justify-center bg-slate-50 px-4 rounded-lg border">
                    <span className="text-xs font-bold text-slate-400 uppercase">Score Total</span>
                    <span className={`text-3xl font-black ${getScoreColor(ev.score)}`}>{ev.score}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Placeholder for other tabs */}
        {(detailTab === 'notes' || detailTab === 'timeline') && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Section en construction</h3>
            <p className="text-slate-500 text-sm mt-2">Cette fonctionnalité sera bientôt reliée à la base de données.</p>
          </div>
        )}

      </DashboardLayout>
    );
  }

  // -------------------------------------------------------------------------
  // VUE LISTE PRINCIPALE
  // -------------------------------------------------------------------------
  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('sidebar.childRecords')}</h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">{filtered.length} dossier(s) patient(s) enregistré(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Exporter la liste</Button>
          <Button><Plus className="h-4 w-4 mr-2" /> Créer un dossier manuel</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Dossiers Actifs', count: records.filter(r => r.status === 'active').length, icon: CheckCircle, color: 'text-emerald-600', bg:'bg-emerald-50' },
          { label: 'En attente d\'éval.', count: records.filter(r => r.status === 'pending').length, icon: Clock, color: 'text-amber-600', bg:'bg-amber-50' },
          { label: 'Urgents (À voir)', count: records.filter(r => r.status === 'urgent').length, icon: AlertTriangle, color: 'text-red-600', bg:'bg-red-50' },
          { label: 'Dossiers Archivés', count: records.filter(r => r.status === 'archived').length, icon: FolderOpen, color: 'text-slate-500', bg:'bg-slate-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`h-4 w-4 ${stat.color}`} /></div>
            </div>
            <div className="text-3xl font-black text-slate-800">{isLoading ? '-' : stat.count}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un enfant ou un parent..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-white text-sm shadow-sm focus:ring-2 focus:ring-primary outline-none font-medium" />
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap border ${
              activeTab === tab.key ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}>
            {tab.label} <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-slate-100'}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-slate-500 font-medium">Récupération des dossiers médicaux...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed shadow-sm">
            <FolderOpen className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700">Aucun dossier trouvé</h3>
            <p className="text-slate-500 mt-2">La recherche n'a retourné aucun résultat.</p>
          </div>
        ) : (
          filtered.map(rec => {
            const StatusIcon = statusConfig[rec.status].icon;
            return (
              <button key={rec.id} onClick={() => setSelectedRecord(rec)}
                className="w-full bg-white rounded-xl p-5 border border-border hover:border-primary/50 hover:shadow-md transition-all flex items-center justify-between text-left group">
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${statusConfig[rec.status].color.replace('text-', 'bg-').replace('100', '200')}`}>
                    {rec.child_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <span className="font-bold text-lg text-slate-800">{rec.child_name}</span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${statusConfig[rec.status].color.split(' ')[1].replace('text', 'border')} ${statusConfig[rec.status].color}`}>
                        <StatusIcon className="h-3.5 w-3.5" /> {statusConfig[rec.status].label}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-slate-500 flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{calculateAge(rec.dob)}</span>
                      <span className="flex items-center gap-1.5"><User className="h-4 w-4" />Parent: {rec.parent_name}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{rec.location}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-primary shrink-0 transition-colors" />
              </button>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
};

export default RecordsModule;