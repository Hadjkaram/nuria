import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, ClipboardList, Calendar, User, Loader2, LogOut, Baby, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

// --- LISTE DES QUESTIONS (Propriété NURIA) ---
const NURIA_QUESTIONS = [
  { id: 'q1', text: "L'enfant réagit-il lorsque vous l'appelez par son nom ?", section: "Communication Sociale" },
  { id: 'q2', text: "L'enfant établit-il un contact visuel lorsqu'il parle ou joue avec les autres ?", section: "Communication Sociale" },
  { id: 'q3', text: "L'enfant manifeste-t-il de l'intérêt pour les autres enfants et essaie-t-il de jouer avec eux ?", section: "Communication Sociale" },
  { id: 'q4', text: "L'enfant partage-t-il des choses avec vous ou d'autres personnes (de son propre chef) ?", section: "Communication Sociale" },
  { id: 'q5', text: "L'enfant essaie-t-il de vous réconforter ou de réconforter les autres lorsqu'il est contrarié ou blessé ?", section: "Communication Sociale" },
  { id: 'q6', text: "L'enfant aime-t-il être avec d'autres personnes et recherche-t-il les interactions sociales ?", section: "Communication Sociale" },
  { id: 'q7', text: "L'enfant comprend-il des instructions simples sans gestes ni démonstrations ?", section: "Communication Sociale" },
  { id: 'q8', text: "L'enfant peut-il tenir une conversation (s'il est assez âgé pour parler) ?", section: "Communication Sociale" },
  { id: 'q9', text: "L'enfant utilise-t-il des gestes comme pointer du doigt, faire signe de la main ou hocher la tête pour communiquer ?", section: "Communication Sociale" },
  { id: 'q10', text: "L'enfant vous montre-t-il des choses qui l'intéressent (juste pour partager) ?", section: "Communication Sociale" },
  { id: 'q11', text: "L'enfant manifeste-t-il un intérêt très marqué pour des sujets ou des objets spécifiques qui semblent inhabituels ?", section: "Comportements Répétitifs" },
  { id: 'q12', text: "L'enfant insiste-t-il pour faire les choses de la même manière à chaque fois et se met-il très en colère si les habitudes changent ?", section: "Comportements Répétitifs" },
  { id: 'q13', text: "L'enfant répète-t-il des mouvements de façon répétée, comme se balancer, tourner sur lui-même ou agiter les mains ?", section: "Comportements Répétitifs" },
  { id: 'q14', text: "L'enfant répète-t-il des mots ou des phrases sans cesse (écholalie) ?", section: "Comportements Répétitifs" },
  { id: 'q15', text: "L'enfant aligne-t-il ses jouets ou objets d'une manière particulière et se fâche-t-il s'ils sont déplacés ?", section: "Comportements Répétitifs" },
  { id: 'q16', text: "L'enfant se concentre-t-il sur des parties d'objets (comme les roues d'une petite voiture) plutôt que sur l'objet entier ?", section: "Comportements Répétitifs" },
  { id: 'q17', text: "L'enfant a-t-il des attachements inhabituels à des objets spécifiques (autres que couverture préférée) ?", section: "Comportements Répétitifs" },
  { id: 'q18', text: "L'enfant semble-t-il hypersensible aux bruits, se bouche-t-il les oreilles ?", section: "Réponses Sensorielles" },
  { id: 'q19', text: "L'enfant semble-t-il hypersensible au toucher, évitant les câlins ou certaines textures ?", section: "Réponses Sensorielles" },
  { id: 'q20', text: "L'enfant recherche-t-il ou évite-t-il certaines odeurs ou certains goûts de manière inhabituelle ?", section: "Réponses Sensorielles" },
  { id: 'q21', text: "L'enfant semble-t-il ne pas ressentir la douleur ou les températures extrêmes ?", section: "Réponses Sensorielles" },
  { id: 'q22', text: "L'enfant fixe-t-il plus que les autres les lumières, les objets qui tournent ou en mouvement ?", section: "Réponses Sensorielles" },
  { id: 'q23', text: "Si l'enfant parle, utilise-t-il le langage de manière inhabituelle (voix monotone, répète publicités) ?", section: "Langage et Communication" },
  { id: 'q24', text: "L'enfant a-t-il des difficultés à comprendre les blagues, le sarcasme ou le langage figuré ?", section: "Langage et Communication" },
  { id: 'q25', text: "L'enfant interprète-t-il les choses de manière très littérale ?", section: "Langage et Communication" },
  { id: 'q26', text: "L'enfant a-t-il des difficultés à se faire des amis ou à garder des amis du même âge ?", section: "Interaction Sociale" },
  { id: 'q27', text: "L'enfant préfère-t-il jouer seul plutôt qu'avec les autres ?", section: "Interaction Sociale" },
  { id: 'q28', text: "L'enfant a-t-il des difficultés à comprendre les sentiments des autres ou à y répondre ?", section: "Interaction Sociale" },
  { id: 'q29', text: "L'enfant a-t-il des difficultés à respecter son tour dans les conversations ou les activités ?", section: "Interaction Sociale" },
  { id: 'q30', text: "L'enfant semble-t-il ignorer les règles sociales ou se comporte-t-il de manière jugée inappropriée ?", section: "Interaction Sociale" },
];

const NasqScreeningModule: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // --- SÉCURITÉ ANTI-INTRUSION ---
  useEffect(() => {
    if (!user) {
      navigate('/login-agent');
    }
  }, [user, navigate]);
  
  const [sites, setSites] = useState<any[]>([]);
  const [specialists, setSpecialists] = useState<any[]>([]);
  
  const [childData, setChildData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'M',
    parentName: '',
    parentPhone: ''
  });
  
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  
  const [newlyCreatedChildId, setNewlyCreatedChildId] = useState<string | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      const { data: sitesData } = await supabase.from('screening_sites').select('*');
      if (sitesData) setSites(sitesData);

      const { data: specData } = await supabase.from('profiles').select('*').eq('role', 'professional');
      if (specData) setSpecialists(specData);
    };
    fetchData();
  }, []);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const answeredCount = Object.keys(answers).length;
  const isChildFormValid = childData.firstName && childData.lastName && childData.dob && selectedSiteId;

  const handleSubmitTest = async () => {
    if (!isChildFormValid || !user || answeredCount < 30) return;
    setIsSubmitting(true);

    try {
      const { data: insertedChild, error: childError } = await supabase
        .from('children')
        .insert([{
          first_name: childData.firstName,
          last_name: childData.lastName,
          dob: childData.dob,
          gender: childData.gender,
          parent_name: childData.parentName,
          site_id: selectedSiteId,
          user_id: user.id,
          status: 'active'
        }])
        .select()
        .single();

      if (childError) throw childError;
      
      const childId = insertedChild.id;
      setNewlyCreatedChildId(childId);

      const score = Object.values(answers).reduce((acc, val) => acc + val, 0);
      const needsReferral = score >= 8;
      setFinalScore(score);

      const { error: nuriaError } = await supabase.from('nuria_results').insert([{
        child_id: childId,
        agent_id: user.id,
        answers: answers,
        total_score: score,
        needs_referral: needsReferral
      }]);

      if (nuriaError) throw nuriaError;

      if (needsReferral) {
        setShowReferralModal(true);
      } else {
        alert(`Évaluation NURIA terminée. Score : ${score}/30. Aucun risque majeur détecté.`);
        resetForm();
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement des données.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!newlyCreatedChildId || !user || !appointmentDate || !selectedSpecialistId) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('appointments').insert([{
        child_id: newlyCreatedChildId,
        agent_id: user.id,
        specialist_id: selectedSpecialistId,
        appointment_date: new Date(appointmentDate).toISOString(),
        reason: `Suspicion de TND suite au Formulaire NURIA (Score: ${finalScore}/30)`
      }]);

      if (error) throw error;
      
      alert("Rendez-vous confirmé. L'enfant a été enregistré et orienté avec succès.");
      setShowReferralModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la prise de rendez-vous.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAnswers({});
    setChildData({ firstName: '', lastName: '', dob: '', gender: 'M', parentName: '', parentPhone: '' });
    setSelectedSiteId('');
    setFinalScore(null);
    setNewlyCreatedChildId(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login-agent');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-400" />
            <span className="font-bold text-lg tracking-tight">NURIA Terrain</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:inline-block">Agent : {user?.lastName}</span>
            <Button variant="secondary" size="sm" onClick={handleLogout} className="h-8">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Quitter</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary">Formulaire de Dépistage NURIA</h1>
          <p className="text-muted-foreground text-sm mt-1">Outil propriétaire de recensement communautaire</p>
        </div>

        <Card className="mb-8 border-primary/20 shadow-sm">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary">
              <Baby className="h-5 w-5" /> Informations de l'enfant
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Prénom de l'enfant *</Label>
                <Input placeholder="Ex: Amadou" value={childData.firstName} onChange={(e) => setChildData({...childData, firstName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Nom de l'enfant *</Label>
                <Input placeholder="Ex: Diallo" value={childData.lastName} onChange={(e) => setChildData({...childData, lastName: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Date de naissance *</Label>
                <Input type="date" value={childData.dob} onChange={(e) => setChildData({...childData, dob: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Genre</Label>
                <Select value={childData.gender} onValueChange={(val) => setChildData({...childData, gender: val})}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculin</SelectItem>
                    <SelectItem value="F">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lieu de recensement *</Label>
                <Select onValueChange={setSelectedSiteId} value={selectedSiteId}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Choisir le site..." /></SelectTrigger>
                  <SelectContent>
                    {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.city})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-2">
              <div className="space-y-2">
                <Label>Nom du parent / tuteur</Label>
                <Input placeholder="Ex: Fatou Diallo" value={childData.parentName} onChange={(e) => setChildData({...childData, parentName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Contact du parent</Label>
                <Input placeholder="Numéro de téléphone" value={childData.parentPhone} onChange={(e) => setChildData({...childData, parentPhone: e.target.value})} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {Array.from(new Set(NURIA_QUESTIONS.map(q => q.section))).map((sectionTitle, index) => (
            <div key={index} className="space-y-4">
              <h2 className="text-lg font-bold border-b pb-2 text-primary">Section {index + 1}: {sectionTitle}</h2>
              <div className="grid grid-cols-1 gap-3">
                {NURIA_QUESTIONS.filter(q => q.section === sectionTitle).map((q, i) => (
                  <div key={q.id} className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <p className="text-sm flex-1 font-medium"><span className="text-muted-foreground mr-2">{i+1}.</span>{q.text}</p>
                    <div className="flex gap-2 w-full sm:w-auto shrink-0">
                      <Button variant={answers[q.id] === 0 ? "default" : "outline"} className={answers[q.id] === 0 ? "bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto" : "w-full sm:w-auto"} onClick={() => handleAnswer(q.id, 0)}>0</Button>
                      <Button variant={answers[q.id] === 1 ? "default" : "outline"} className={answers[q.id] === 1 ? "bg-amber-600 hover:bg-amber-700 w-full sm:w-auto" : "w-full sm:w-auto"} onClick={() => handleAnswer(q.id, 1)}>1</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-sm sm:text-base">Progression : {answeredCount} / 30 questions</p>
            {!isChildFormValid && <p className="text-xs text-destructive">Veuillez remplir les informations de l'enfant.</p>}
          </div>
          <Button size="lg" className="w-full sm:w-auto" disabled={answeredCount < 30 || !isChildFormValid || isSubmitting} onClick={handleSubmitTest}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Enregistrer et Soumettre
          </Button>
        </div>
      </div>

      <Dialog open={showReferralModal} onOpenChange={() => {}}> 
        <DialogContent className="sm:max-w-[500px] border-destructive">
          <DialogHeader>
            <div className="flex items-center gap-3 text-destructive mb-2">
              <AlertTriangle className="h-8 w-8" />
              <DialogTitle className="text-xl">Alerte : Orientation Nécessaire</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              L'enfant <strong>{childData.firstName} {childData.lastName}</strong> a été enregistré.
              Son score au Formulaire NURIA est de <strong className="text-destructive text-lg">{finalScore}/30</strong>. 
              <strong>Vous devez immédiatement planifier un rendez-vous avec un spécialiste.</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 mt-2 border-t">
            <div className="space-y-2">
              <label className="text-sm font-bold">Sélectionner un Spécialiste / Médecin</label>
              <Select onValueChange={setSelectedSpecialistId} value={selectedSpecialistId}>
                <SelectTrigger><SelectValue placeholder="Choisir un professionnel..." /></SelectTrigger>
                <SelectContent>
                  {specialists.map(s => <SelectItem key={s.id} value={s.id}>Dr. {s.first_name} {s.last_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2"><Calendar className="h-4 w-4"/> Date du rendez-vous</label>
              <Input type="datetime-local" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="destructive" className="w-full" disabled={!selectedSpecialistId || !appointmentDate || isSubmitting} onClick={handleBookAppointment}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirmer l'orientation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NasqScreeningModule;