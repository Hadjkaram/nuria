import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, FolderOpen, Plus, Calendar, User, FileText, Brain,
  Activity, ClipboardList, ChevronRight, Download, Printer,
  AlertTriangle, CheckCircle, Clock, Eye, MapPin, X, Loader2, Baby, Stethoscope
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type RecordStatus = 'active' | 'pending' | 'archived' | 'urgent';
type TabType = 'all' | 'active' | 'pending' | 'urgent' | 'archived';

interface ChildRecord {
  id: string;
  child_name: string;
  dob: string;
  gender: string;
  parent_name: string;
  parent_contact: string;
  location: string;
  status: RecordStatus;
  created_at: string;
  risk_level: string;
  score: number;
  evaluations: any[];
  notes: any[];
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
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [records, setRecords] = useState<ChildRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedRecord, setSelectedRecord] = useState<ChildRecord | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'evaluations' | 'notes' | 'timeline'>('overview');

  // États pour les modales d'actions
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showApptModal, setShowApptModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Données des formulaires
  const [formData, setFormData] = useState({ child_name: '', dob: '', gender: '', parent_name: '', parent_contact: '', location: '' });
  const [noteContent, setNoteContent] = useState('');
  const [planContent, setPlanContent] = useState('');
  const [apptData, setApptData] = useState({ date: '', time: '', type: 'Consultation de suivi' });

  // --- LECTURE DES DONNÉES GLOBALES ---
  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('screenings').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      const formattedRecords: ChildRecord[] = (data || []).map((item: any) => {
        let recordStatus: RecordStatus = 'active';
        if (item.risk_level?.includes('Élevé') || item.risk_level?.includes('TND')) recordStatus = 'urgent';
        else if (item.risk_level?.includes('Moyen') || item.risk_level?.includes('Faible')) recordStatus = 'pending';

        return {
          id: item.id,
          child_name: item.child_name || 'Non renseigné',
          dob: item.dob || '',
          gender: item.gender || '',
          parent_name: item.parent_name || 'Non renseigné',
          parent_contact: item.parent_contact || 'Non renseigné',
          location: item.location || 'Non renseigné',
          status: recordStatus,
          created_at: new Date(item.created_at).toLocaleDateString('fr-FR'),
          risk_level: item.risk_level || 'Non évalué',
          score: item.score || 0,
          evaluations: item.form_type ? [
            { id: item.id, date: new Date(item.created_at).toLocaleDateString('fr-FR'), type: item.form_type, result: item.risk_level, score: item.score, professional: 'Agent Terrain', rawDate: item.created_at }
          ] : [],
          notes: [],
          carePlanActive: false,
        };
      });
      setRecords(formattedRecords);
    } catch (err: any) {
      toast({ title: "Erreur", description: "Impossible de charger les dossiers.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // --- LECTURE DES DÉTAILS DU PATIENT SÉLECTIONNÉ (Notes & Plans) ---
  const fetchRecordDetails = async (recordId: string) => {
    try {
      const [notesRes, plansRes] = await Promise.all([
        supabase.from('clinical_notes').select('*').eq('child_id', recordId).order('created_at', { ascending: false }),
        supabase.from('care_plans').select('*').eq('child_id', recordId).eq('status', 'active')
      ]);

      setSelectedRecord(prev => {
        if (!prev) return null;
        return {
          ...prev,
          notes: notesRes.data || [],
          carePlanActive: (plansRes.data && plansRes.data.length > 0) ? true : false
        };
      });
    } catch (err) {
      console.error("Erreur de chargement des détails", err);
    }
  };

  // Dès qu'on clique sur un dossier, on charge ses notes
  useEffect(() => {
    if (selectedRecord && selectedRecord.notes.length === 0) {
      fetchRecordDetails(selectedRecord.id);
    }
  }, [selectedRecord]);

  // --- ACTIONS SUPABASE : AJOUTER NOTE ---
  const handleSaveNote = async () => {
    if (!noteContent || !selectedRecord) return;
    setIsSubmitting(true);
    try {
      const author = user?.firstName ? `Dr. ${user.firstName} ${user.lastName}` : 'Professionnel de santé';
      const { data, error } = await supabase.from('clinical_notes').insert([{
        child_id: selectedRecord.id, author_name: author, content: noteContent
      }]).select();

      if (error) throw error;
      
      toast({ title: "Note ajoutée", description: "La note clinique a été sauvegardée." });
      setNoteContent('');
      setShowNoteModal(false);
      fetchRecordDetails(selectedRecord.id); // Rafraîchit les notes
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ACTIONS SUPABASE : PLANIFIER RDV ---
  const handleSaveAppt = async () => {
    if (!apptData.date || !apptData.time || !selectedRecord) return;
    setIsSubmitting(true);
    try {
      const doctorName = user?.firstName ? `Dr. ${user.firstName} ${user.lastName}` : 'Médecin NURIA';
      const { error } = await supabase.from('appointments').insert([{
        user_id: user?.id,
        child_name: selectedRecord.child_name,
        professional_name: doctorName,
        appointment_date: apptData.date,
        appointment_time: apptData.time,
        appointment_type: apptData.type,
        status: 'scheduled'
      }]);

      if (error) throw error;
      toast({ title: "RDV Planifié", description: "Le rendez-vous a bien été enregistré dans l'agenda." });
      setShowApptModal(false);
      setApptData({ date: '', time: '', type: 'Consultation de suivi' });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ACTIONS SUPABASE : CRÉER PLAN PEC ---
  const handleSavePlan = async () => {
    if (!planContent || !selectedRecord) return;
    setIsSubmitting(true);
    try {
      const author = user?.firstName ? `Dr. ${user.firstName} ${user.lastName}` : 'Professionnel de santé';
      const { error } = await supabase.from('care_plans').insert([{
        child_id: selectedRecord.id, author_name: author, description: planContent, status: 'active'
      }]);

      if (error) throw error;
      toast({ title: "Plan créé", description: "Le plan de prise en charge est désormais actif." });
      setShowPlanModal(false);
      setPlanContent('');
      fetchRecordDetails(selectedRecord.id);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ACTION : EXPORT ---
  const handleExport = () => {
    if (filtered.length === 0) return toast({ title: "Export impossible", description: "Aucun dossier.", variant: "destructive" });
    const headers = ['ID', 'Nom Enfant', 'Date Naissance', 'Genre', 'Parent', 'Contact', 'Localisation', 'Statut', 'Niveau Risque', 'Score'];
    const csvContent = [
      headers.join(','),
      ...filtered.map(r => `"${r.id}","${r.child_name}","${r.dob}","${r.gender}","${r.parent_name}","${r.parent_contact}","${r.location}","${r.status}","${r.risk_level}","${r.score}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dossiers_patients_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: "Succès", description: "L'export CSV a été téléchargé." });
  };

  // --- ACTION : CRÉATION MANUELLE ---
  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('screenings').insert([{
        child_name: formData.child_name, dob: formData.dob, gender: formData.gender,
        parent_name: formData.parent_name, parent_contact: formData.parent_contact,
        location: formData.location, risk_level: 'Non évalué', score: 0
      }]);
      if (error) throw error;
      toast({ title: "Succès", description: "Le dossier a été créé avec succès." });
      setShowAddForm(false);
      fetchRecords();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 'Inconnu';
    const birth = new Date(dob);
    const now = new Date();
    const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
    return totalMonths < 12 ? `${totalMonths} mois` : `${Math.floor(totalMonths/12)} ans ${totalMonths%12} mois`;
  };

  const getScoreColor = (score?: number) => {
    if (score === undefined) return 'text-muted-foreground';
    if (score >= 8) return 'text-red-600 dark:text-red-400';
    if (score >= 3) return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'Tous', count: records.length },
    { key: 'active', label: 'Actifs', count: records.filter(r => r.status === 'active').length },
    { key: 'pending', label: 'En attente', count: records.filter(r => r.status === 'pending').length },
    { key: 'urgent', label: 'Urgents', count: records.filter(r => r.status === 'urgent').length },
    { key: 'archived', label: 'Archivés', count: records.filter(r => r.status === 'archived').length },
  ];

  const filtered = records.filter(r => {
    const matchesSearch = `${r.child_name} ${r.parent_name}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (activeTab === 'all' || r.status === activeTab);
  });

  // -------------------------------------------------------------------------
  // VUE DÉTAIL DU DOSSIER SÉLECTIONNÉ
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

    // Construction de la chronologie (fusion des évals et des notes)
    const timelineEvents = [
      ...rec.evaluations.map(e => ({ type: 'eval', date: e.rawDate, title: `Évaluation : ${e.type}`, desc: `Score: ${e.score} - Risque: ${e.result}` })),
      ...rec.notes.map(n => ({ type: 'note', date: n.created_at, title: `Note clinique par ${n.author_name}`, desc: n.content }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
            <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Navigation des onglets du dossier */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6 overflow-x-auto">
          {detailTabs.map(tab => (
            <button key={tab.key} onClick={() => setDetailTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${detailTab === tab.key ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* 1. ONGLET VUE D'ENSEMBLE */}
        {detailTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><Baby className="h-4 w-4 text-primary" /> Identité du patient</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                  {[
                    ['Nom complet', rec.child_name],
                    ['Date de naissance', `${rec.dob} (${calculateAge(rec.dob)})`],
                    ['Genre', rec.gender === 'M' ? 'Garçon' : 'Fille'],
                    ['Lieu de résidence', rec.location],
                    ['Date d\'enregistrement', rec.created_at],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-1">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">{label}</span>
                      <span className="font-bold text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

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

              <div className="bg-card rounded-xl border border-border p-6 shadow-sm border-t-4 border-t-primary">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><Brain className="h-4 w-4 text-primary" /> Profil Clinique & Risques</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={`text-sm py-1.5 px-4 font-bold border-2 ${statusConfig[rec.status].color.split(' ')[1].replace('text', 'border')}`}>
                    Dernier résultat : {rec.risk_level} (Score: {rec.score})
                  </Badge>
                </div>
              </div>
            </div>

            {/* Sidebar Actions dans le dossier */}
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
                <Button className="w-full justify-start font-medium" size="sm" onClick={() => setDetailTab('evaluations')}>
                  <ClipboardList className="h-4 w-4 mr-2" /> Voir les bilans
                </Button>
                <Button className="w-full justify-start font-medium" variant="outline" size="sm" onClick={() => setShowNoteModal(true)}>
                  <FileText className="h-4 w-4 mr-2" /> Ajouter une note
                </Button>
                <Button className="w-full justify-start font-medium" variant="outline" size="sm" onClick={() => setShowPlanModal(true)} disabled={rec.carePlanActive}>
                  <Stethoscope className="h-4 w-4 mr-2" /> {rec.carePlanActive ? 'Plan déjà actif' : 'Créer un plan PEC'}
                </Button>
                <Button className="w-full justify-start font-medium" variant="outline" size="sm" onClick={() => setShowApptModal(true)}>
                  <Calendar className="h-4 w-4 mr-2" /> Planifier un RDV
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 2. ONGLET ÉVALUATIONS */}
        {detailTab === 'evaluations' && (
          <div className="space-y-4">
            <h3 className="font-semibold">Historique des dépistages</h3>
            {rec.evaluations.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed"><p className="text-slate-500">Aucune évaluation.</p></div>
            ) : (
              rec.evaluations.map(ev => (
                <div key={ev.id} className="bg-card rounded-xl border p-5 flex flex-col sm:flex-row justify-between gap-4 shadow-sm">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg">{ev.type}</span>
                      <Badge variant="outline" className={`font-bold ${getScoreColor(ev.score)}`}>{ev.result}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Par : {ev.professional} le {ev.date}</p>
                  </div>
                  <div className="flex flex-col items-end justify-center bg-slate-50 px-4 py-2 rounded-lg border">
                    <span className="text-xs font-bold text-slate-400 uppercase">Score Total</span>
                    <span className={`text-3xl font-black ${getScoreColor(ev.score)}`}>{ev.score}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. ONGLET NOTES CLINIQUES */}
        {detailTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Notes Cliniques</h3>
              <Button size="sm" onClick={() => setShowNoteModal(true)}><Plus className="h-4 w-4 mr-2" /> Nouvelle Note</Button>
            </div>
            {rec.notes.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed"><FileText className="h-12 w-12 mx-auto text-slate-300 mb-3"/><p className="text-slate-500">Le dossier clinique est vide.</p></div>
            ) : (
              rec.notes.map(note => (
                <div key={note.id} className="bg-white p-5 rounded-xl border shadow-sm space-y-3">
                  <div className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="font-bold text-primary">{note.author_name}</span>
                    <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(note.created_at).toLocaleString('fr-FR')}</span>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. ONGLET CHRONOLOGIE */}
        {detailTab === 'timeline' && (
          <div className="space-y-6 px-4">
            <h3 className="font-semibold mb-4">Parcours du patient</h3>
            {timelineEvents.length === 0 ? (
              <p className="text-slate-500 text-center py-10">Aucun événement enregistré.</p>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${evt.type === 'eval' ? 'bg-primary text-white' : 'bg-amber-500 text-white'}`}>
                      {evt.type === 'eval' ? <ClipboardList className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                    </div>
                    <div className="bg-white p-4 rounded-xl border shadow-sm">
                      <p className="text-xs font-bold text-slate-400 mb-1">{new Date(evt.date).toLocaleString('fr-FR')}</p>
                      <p className="font-bold text-slate-800">{evt.title}</p>
                      <p className="text-sm text-slate-600 mt-1">{evt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODALES D'ACTIONS INTERNES */}
        <Dialog open={showNoteModal} onOpenChange={setShowNoteModal}>
          <DialogContent>
            <DialogHeader><DialogTitle>Ajouter une note clinique</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <textarea 
                className="w-full min-h-[150px] p-3 rounded-md border border-input focus:ring-2 focus:ring-primary outline-none" 
                placeholder="Saisissez vos observations cliniques ici..."
                value={noteContent} onChange={e => setNoteContent(e.target.value)} 
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNoteModal(false)}>Annuler</Button>
              <Button onClick={handleSaveNote} disabled={isSubmitting || !noteContent}>{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enregistrer la note'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showApptModal} onOpenChange={setShowApptModal}>
          <DialogContent>
            <DialogHeader><DialogTitle>Planifier un Rendez-vous</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Date</Label><Input type="date" value={apptData.date} onChange={e => setApptData({...apptData, date: e.target.value})} /></div>
                <div><Label>Heure</Label><Input type="time" value={apptData.time} onChange={e => setApptData({...apptData, time: e.target.value})} /></div>
              </div>
              <div>
                <Label>Motif de consultation</Label>
                <Select value={apptData.type} onValueChange={v => setApptData({...apptData, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consultation de suivi">Consultation de suivi</SelectItem>
                    <SelectItem value="Bilan psychomoteur">Bilan psychomoteur</SelectItem>
                    <SelectItem value="Bilan orthophonique">Bilan orthophonique</SelectItem>
                    <SelectItem value="Entretien parental">Entretien parental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApptModal(false)}>Annuler</Button>
              <Button onClick={handleSaveAppt} disabled={isSubmitting || !apptData.date || !apptData.time}>{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Planifier'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
          <DialogContent>
            <DialogHeader><DialogTitle>Créer un Plan de Prise en Charge (PEC)</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <Label>Objectifs et recommandations thérapeutiques</Label>
              <textarea 
                className="w-full min-h-[120px] p-3 rounded-md border border-input focus:ring-2 focus:ring-primary outline-none" 
                placeholder="Ex: Séances d'orthophonie 2x/semaine. Stimulation sensorielle à domicile..."
                value={planContent} onChange={e => setPlanContent(e.target.value)} 
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPlanModal(false)}>Annuler</Button>
              <Button onClick={handleSavePlan} disabled={isSubmitting || !planContent}>{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Activer le plan'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
          <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" /> Exporter la liste</Button>
          <Button onClick={() => setShowAddForm(true)}><Plus className="h-4 w-4 mr-2" /> Créer un dossier manuel</Button>
        </div>
      </div>

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

      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Créer un dossier manuel</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateManual} className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nom complet *</Label><Input required value={formData.child_name} onChange={e => setFormData({...formData, child_name: e.target.value})} /></div>
              <div className="space-y-2"><Label>Date de naissance *</Label><Input type="date" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Genre *</Label>
                <Select value={formData.gender} onValueChange={v => setFormData({...formData, gender: v})}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent><SelectItem value="M">Masculin</SelectItem><SelectItem value="F">Féminin</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Localisation *</Label><Input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nom du parent *</Label><Input required value={formData.parent_name} onChange={e => setFormData({...formData, parent_name: e.target.value})} /></div>
              <div className="space-y-2"><Label>Contact parent *</Label><Input required value={formData.parent_contact} onChange={e => setFormData({...formData, parent_contact: e.target.value})} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Créer'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default RecordsModule;