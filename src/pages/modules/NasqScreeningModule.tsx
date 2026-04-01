import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, ClipboardList, Calendar, Baby, Loader2, LogOut, CheckCircle2, User, Phone, AlertTriangle, ShieldCheck, Plus, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// --- LISTE DES VILLES DE CÔTE D'IVOIRE ---
const IVORIAN_CITIES = [
  "Abidjan", "Bouaké", "Daloa", "Yamoussoukro", "San-Pédro", "Korhogo", "Man", "Divo", 
  "Gagnoa", "Abengourou", "Anyama", "Odienné", "Agboville", "Sinfra", "Bondoukou", "Seguela"
];

// --- QUESTIONS M-CHAT-R ---
const M_CHAT_R_QUESTIONS = [
  { id: 'q1', text: "Si vous pointez du doigt quelque chose de l'autre côté de la pièce, est-ce que votre enfant le regarde ?" },
  { id: 'q2', text: "Vous êtes-vous déjà demandé si votre enfant pouvait être sourd ?" },
  { id: 'q3', text: "Est-ce que votre enfant joue à faire semblant ? (ex: faire semblant de boire dans une tasse vide)" },
  { id: 'q4', text: "Est-ce que votre enfant aime grimper sur des choses ? (ex: meubles, marches d'escalier)" },
  { id: 'q5', text: "Est-ce que votre enfant fait des gestes inhabituels avec ses doigts près de ses yeux ?" },
  { id: 'q6', text: "Est-ce que votre enfant pointe du doigt pour demander quelque chose, ou pour avoir de l'aide ?" },
  { id: 'q7', text: "Est-ce que votre enfant pointe du doigt pour vous montrer quelque chose d'intéressant ?" },
  { id: 'q8', text: "Est-ce que votre enfant s'intéresse aux autres enfants ?" },
  { id: 'q9', text: "Est-ce que votre enfant vous montre des choses en les apportant ou en les tenant pour que vous les voyiez ?" },
  { id: 'q10', text: "Est-ce que votre enfant répond quand vous l'appelez par son nom ?" },
  { id: 'q11', text: "Lorsque vous lui souriez, est-ce que votre enfant vous sourit en retour ?" },
  { id: 'q12', text: "Est-ce que votre enfant semble dérangé par les bruits quotidiens ? (ex: aspirateur ou musique forte)" },
  { id: 'q13', text: "Est-ce que votre enfant marche ?" },
  { id: 'q14', text: "Est-ce que votre enfant vous regarde dans les yeux quand vous lui parlez, jouez avec lui ou l'habillez ?" },
  { id: 'q15', text: "Est-ce que votre enfant essaie de copier ce que vous faites ? (ex: faire au revoir, applaudir)" },
  { id: 'q16', text: "Si vous tournez la tête pour regarder quelque chose, est-ce que votre enfant tourne la tête pour voir ce que vous regardez ?" },
  { id: 'q17', text: "Est-ce que votre enfant essaie de vous faire regarder ce qu'il regarde ?" },
  { id: 'q18', text: "Est-ce que votre enfant comprend ce que vous lui dites de faire ?" },
  { id: 'q19', text: "Si quelque chose de nouveau arrive, est-ce que votre enfant regarde votre visage pour voir comment vous réagissez ?" },
  { id: 'q20', text: "Est-ce que votre enfant aime les activités de mouvement ? (ex: être balancé ou sauter sur vos genoux)" },
];

const NasqScreeningModule: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // États du formulaire
  const [childName, setChildName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentContact, setParentContact] = useState('');
  
  // Réponses et États d'envoi
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- NOUVEAU : État pour l'écran de résultat ---
  const [submittedResult, setSubmittedResult] = useState<{score: number, risk: any} | null>(null);

  const handleAnswer = (qId: string, value: boolean) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  // --- LOGIQUE DE SCORING OFFICIELLE M-CHAT-R ---
  const calculateScore = () => {
    let score = 0;
    M_CHAT_R_QUESTIONS.forEach((q, index) => {
      const qNum = index + 1;
      const answer = answers[q.id];
      if (answer === undefined) return;

      // Pour les items 2, 5 et 12, la réponse "OUI" indique un risque (+1 point)
      if (qNum === 2 || qNum === 5 || qNum === 12) {
        if (answer === true) score += 1;
      } 
      // Pour tous les autres items, la réponse "NON" indique un risque (+1 point)
      else {
        if (answer === false) score += 1;
      }
    });
    return score;
  };

  const getRiskLevel = (score: number) => {
    if (score <= 2) return { label: "Risque Faible", color: "text-emerald-600", bg: "bg-emerald-100", borderTop: "border-t-emerald-500", icon: <ShieldCheck className="h-12 w-12 text-emerald-600" /> };
    if (score <= 7) return { label: "Risque Moyen", color: "text-amber-600", bg: "bg-amber-100", borderTop: "border-t-amber-500", icon: <AlertTriangle className="h-12 w-12 text-amber-600" /> };
    return { label: "Risque Élevé", color: "text-red-600", bg: "bg-red-100", borderTop: "border-t-red-500", icon: <AlertTriangle className="h-12 w-12 text-red-600" /> };
  };

  const answeredCount = Object.keys(answers).length;
  const currentScore = calculateScore();
  const riskStatus = getRiskLevel(currentScore);

  const handleSubmit = async () => {
    if (!childName || !dob || !gender || !location || answeredCount < M_CHAT_R_QUESTIONS.length) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir toutes les informations obligatoires (*) et répondre aux 20 questions.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('screenings').insert([{
        agent_id: user?.id,
        child_name: childName,
        dob: dob,
        gender: gender,
        location: location,
        parent_name: parentName,
        parent_contact: parentContact,
        responses: answers,
        score: currentScore,
        risk_level: riskStatus.label,
        created_at: new Date().toISOString()
      }]);

      if (error) throw error;
      
      // AFFICHER LE BEAU RESULTAT (on remonte la page doucement)
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSubmittedResult({ score: currentScore, risk: riskStatus });

    } catch (err: any) {
      toast({
        title: "Erreur de sauvegarde",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedResult(null);
    setAnswers({});
    setChildName('');
    setDob('');
    setGender('');
    setLocation('');
    setParentName('');
    setParentContact('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // -------------------------------------------------------------------------
  // ÉCRAN DE RÉSULTAT PRO ET DESIGN
  // -------------------------------------------------------------------------
  if (submittedResult) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <div className="bg-primary text-white p-6 shadow-md flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ClipboardList /> Recensement NURIA
            </h1>
          </div>
          <Button variant="ghost" className="text-white" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut className="h-5 w-5 mr-2" /> Quitter
          </Button>
        </div>

        <div className="container max-w-xl mx-auto mt-12 px-4">
          <Card className={`border-t-8 shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-500 ${submittedResult.risk.borderTop}`}>
            <CardContent className="pt-12 pb-10 flex flex-col items-center text-center space-y-6">
              
              {/* Icône animée */}
              <div className={`w-24 h-24 rounded-full flex items-center justify-center animate-in zoom-in delay-200 duration-500 ${submittedResult.risk.bg}`}>
                {submittedResult.risk.icon}
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Évaluation enregistrée</h2>
                <p className="text-muted-foreground">Le dossier de <strong className="text-foreground">{childName}</strong> a été sauvegardé avec succès sur la plateforme NURIA.</p>
              </div>

              {/* Bloc Score central */}
              <div className="bg-slate-50 w-full rounded-2xl p-6 border shadow-inner">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Score M-CHAT-R</p>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className={`text-7xl font-black ${submittedResult.risk.color}`}>{submittedResult.score}</span>
                  <span className="text-3xl font-bold text-slate-300">/20</span>
                </div>
                <div className={`inline-block px-6 py-2 rounded-full font-bold text-lg ${submittedResult.risk.bg} ${submittedResult.risk.color}`}>
                  {submittedResult.risk.label}
                </div>
              </div>

              {/* Recommandations */}
              <div className="text-sm text-slate-600 max-w-sm mt-4 leading-relaxed">
                {submittedResult.score <= 2 && "Aucune action immédiate n'est requise. Poursuivez le suivi pédiatrique classique de l'enfant."}
                {(submittedResult.score >= 3 && submittedResult.score <= 7) && "Une évaluation détaillée de suivi (M-CHAT-R/F) ou une consultation avec un spécialiste est recommandée pour approfondir les observations."}
                {submittedResult.score >= 8 && "Une orientation rapide vers un spécialiste (pédopsychiatre, neuropédiatre) pour une évaluation diagnostique complète est fortement recommandée."}
              </div>

              {/* Actions */}
              <div className="w-full grid grid-cols-1 gap-3 pt-6 mt-4 border-t">
                <Button size="lg" className="w-full h-14 text-lg shadow-lg" onClick={resetForm}>
                  <Plus className="mr-2" /> Nouveau recensement
                </Button>
                {submittedResult.score >= 3 && (
                  <Button variant="outline" size="lg" className="w-full h-14 text-lg border-primary text-primary" onClick={() => navigate('/dashboard')}>
                    Aller au tableau de bord <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // ÉCRAN DU FORMULAIRE (Affiché par défaut)
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-primary text-white p-6 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ClipboardList /> Recensement NURIA (M-CHAT-R)
          </h1>
          <p className="text-sm opacity-80">Agent : {user?.firstName} {user?.lastName}</p>
        </div>
        <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => { logout(); navigate('/login'); }}>
          <LogOut className="h-5 w-5 mr-2" /> Quitter
        </Button>
      </div>

      <div className="container max-w-2xl mx-auto mt-8 px-4 space-y-6">
        {/* Section Information */}
        <Card className="shadow-sm border-t-4 border-t-primary">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-semibold"><Baby className="h-4 w-4 text-primary" /> Nom de l'enfant <span className="text-red-500">*</span></Label>
                <Input placeholder="Prénom Nom" value={childName} onChange={(e) => setChildName(e.target.value)} className="bg-white" />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-semibold"><Calendar className="h-4 w-4 text-primary" /> Date de naissance <span className="text-red-500">*</span></Label>
                <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="bg-white" />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Genre <span className="text-red-500">*</span></Label>
                <Select onValueChange={setGender} value={gender}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculin</SelectItem>
                    <SelectItem value="F">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-primary" /> Lieu de recensement <span className="text-red-500">*</span></Label>
                <Select onValueChange={setLocation} value={location}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Choisir la ville..." /></SelectTrigger>
                  <SelectContent>
                    {IVORIAN_CITIES.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-semibold"><User className="h-4 w-4 text-slate-500" /> Nom du parent / tuteur</Label>
                <Input placeholder="Prénom Nom" value={parentName} onChange={(e) => setParentName(e.target.value)} className="bg-white" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-semibold"><Phone className="h-4 w-4 text-slate-500" /> Contact du parent</Label>
                <Input type="tel" placeholder="Ex: 0102030405" value={parentContact} onChange={(e) => setParentContact(e.target.value)} className="bg-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Questions */}
        <div className="space-y-3">
          {M_CHAT_R_QUESTIONS.map((q, index) => (
            <Card key={q.id} className={`transition-colors duration-300 ${answers[q.id] !== undefined ? 'border-primary/40 bg-primary/5 shadow-sm' : 'hover:border-primary/20'}`}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4">
                  <p className="text-[15px] font-medium leading-relaxed text-slate-700">
                    <span className="text-primary mr-2 font-black text-lg">{index + 1}.</span>
                    {q.text}
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      className={`flex-1 h-12 text-base transition-all ${answers[q.id] === true ? "ring-2 ring-primary ring-offset-2 scale-[1.02]" : ""}`}
                      variant={answers[q.id] === true ? "default" : "outline"}
                      onClick={() => handleAnswer(q.id, true)}
                    >Oui</Button>
                    <Button 
                      className={`flex-1 h-12 text-base transition-all ${answers[q.id] === false ? "ring-2 ring-destructive ring-offset-2 scale-[1.02]" : ""}`}
                      variant={answers[q.id] === false ? "destructive" : "outline"}
                      onClick={() => handleAnswer(q.id, false)}
                    >Non</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Barre de progression flottante et Soumission */}
        <div className="sticky bottom-4 z-10">
          <Card className="shadow-2xl border-t-0 bg-white/95 backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-sm font-bold text-slate-600">Progression</span>
                <span className="text-sm font-bold text-primary">{answeredCount} / {M_CHAT_R_QUESTIONS.length}</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full mb-4 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-500 ease-out" 
                  style={{ width: `${(answeredCount / M_CHAT_R_QUESTIONS.length) * 100}%` }}
                />
              </div>

              <Button 
                className="w-full h-14 text-lg shadow-lg font-bold" 
                size="lg" 
                disabled={isSubmitting || answeredCount < M_CHAT_R_QUESTIONS.length}
                onClick={handleSubmit}
              >
                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-6 w-6" /> : <CheckCircle2 className="mr-2 h-6 w-6" />}
                {answeredCount < M_CHAT_R_QUESTIONS.length 
                  ? `Veuillez répondre à toutes les questions` 
                  : `Enregistrer le recensement (${currentScore}/20)`}
              </Button>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
};

export default NasqScreeningModule;