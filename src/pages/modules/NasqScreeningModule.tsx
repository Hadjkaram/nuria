import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MapPin, Calendar, Baby, Loader2, LogOut, CheckCircle2, User, Phone, AlertTriangle, ShieldCheck, Plus, Search, FileText, History, ClipboardList, Download, Send, CheckSquare, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// --- LISTE DES VILLES DE CÔTE D'IVOIRE ---
const IVORIAN_CITIES = [
  "Abidjan", "Bouaké", "Daloa", "Yamoussoukro", "San-Pédro", "Korhogo", "Man", "Divo", 
  "Gagnoa", "Abengourou", "Anyama", "Odienné", "Agboville", "Sinfra", "Bondoukou", "Seguela"
];

// --- QUESTIONS M-CHAT-R (Classique) ---
const M_CHAT_R_QUESTIONS = [
  { id: 'mq1', text: "Si vous pointez du doigt quelque chose de l'autre côté de la pièce, est-ce que votre enfant le regarde ?" },
  { id: 'mq2', text: "Vous êtes-vous déjà demandé si votre enfant pouvait être sourd ?" },
  { id: 'mq3', text: "Est-ce que votre enfant joue à faire semblant ?" },
  { id: 'mq4', text: "Est-ce que votre enfant aime grimper sur des choses ?" },
  { id: 'mq5', text: "Est-ce que votre enfant fait des gestes inhabituels avec ses doigts près de ses yeux ?" },
  { id: 'mq6', text: "Est-ce que votre enfant pointe du doigt pour demander quelque chose, ou pour avoir de l'aide ?" },
  { id: 'mq7', text: "Est-ce que votre enfant pointe du doigt pour vous montrer quelque chose d'intéressant ?" },
  { id: 'mq8', text: "Est-ce que votre enfant s'intéresse aux autres enfants ?" },
  { id: 'mq9', text: "Est-ce que votre enfant vous montre des choses en les apportant ou en les tenant pour que vous les voyiez ?" },
  { id: 'mq10', text: "Est-ce que votre enfant répond quand vous l'appelez par son nom ?" },
  { id: 'mq11', text: "Lorsque vous lui souriez, est-ce que votre enfant vous sourit en retour ?" },
  { id: 'mq12', text: "Est-ce que votre enfant semble dérangé par les bruits quotidiens ?" },
  { id: 'mq13', text: "Est-ce que votre enfant marche ?" },
  { id: 'mq14', text: "Est-ce que votre enfant vous regarde dans les yeux quand vous lui parlez ?" },
  { id: 'mq15', text: "Est-ce que votre enfant essaie de copier ce que vous faites ?" },
  { id: 'mq16', text: "Si vous tournez la tête pour regarder quelque chose, est-ce que votre enfant tourne la tête ?" },
  { id: 'mq17', text: "Est-ce que votre enfant essaie de vous faire regarder ce qu'il regarde ?" },
  { id: 'mq18', text: "Est-ce que votre enfant comprend ce que vous lui dites de faire ?" },
  { id: 'mq19', text: "Si quelque chose de nouveau arrive, est-ce que votre enfant regarde votre visage ?" },
  { id: 'mq20', text: "Est-ce que votre enfant aime les activités de mouvement ?" },
];

// --- NOUVELLES QUESTIONS DE DEVELOPPEMENT PAR TRANCHE D'ÂGE ---
const AGE_BRACKETS = [
  {
    label: "0 à 3 mois", min: 0, max: 2, questions: [
      { id: 'q15', text: "Nouveau-né à terme (36 semaines +6 Jours ≤ d’âge gestationnel ≤ 39 semaines) ?" },
      { id: 'q16', text: "Le bébé a-t-il crié immédiatement ?" },
      { id: 'q17', text: "Le bébé a-t-il présenté des Geignements ?" },
      { id: 'q18', text: "Le bébé a-t-il poussé des cris vigoureux ?" },
      { id: 'q19', text: "Le bébé a-t-il été réanimé ?" },
      { id: 'q21', text: "Le bébé a-t-il présenté des pathologies néonatales (0 – 28j) ?" },
    ]
  },
  {
    label: "3 à 6 mois", min: 3, max: 5, questions: [
      { id: 'q22', text: "Le bébé maintient-il la tête ?" },
      { id: 'q23', text: "Le bébé sourit-il lorsque quelqu’un lui sourit ?" },
      { id: 'q24', text: "Le bébé poursuit-il du regard ?" },
      { id: 'q25', text: "Le bébé réagit-il aux stimuli sonores ?" },
      { id: 'q26', text: "Le bébé dort-il bien ?" },
    ]
  },
  {
    label: "6 à 9 mois", min: 6, max: 8, questions: [
      { id: 'q27', text: "Le bébé s’assoit-il ?" },
      { id: 'q28', text: "Le bébé fait-il quatre-pattes ?" },
      { id: 'q29', text: "Le bébé saisit-il les objets ?" },
      { id: 'q30', text: "Le bébé passe-t-il l’objet d’une main à une autre ?" },
      { id: 'q31', text: "Le bébé réagit-il à l’appel de son nom ?" },
      { id: 'q32', text: "Le bébé émet-il des sons (Syllabes : ma…Ba. Da…) ?" },
      { id: 'q33', text: "Le bébé suit-il du regard ?" },
      { id: 'q34', text: "Le bébé réagit-il aux stimuli sonores ?" },
      { id: 'q35', text: "Le bébé dort-il bien ?" },
      { id: 'q36', text: "Le bébé semble-t-il trop calme ?" },
      { id: 'q37', text: "Le bébé semble-t-il trop mou ?" },
      { id: 'q39', text: "Le bébé tend-il les bras pour être pris ?" },
    ]
  },
  {
    label: "9 à 12 mois", min: 9, max: 11, questions: [
      { id: 'q40', text: "Le bébé se tient-il débout avec appui ?" },
      { id: 'q41', text: "Le bébé marche-t-il lorsqu’il est tenu par la main ?" },
      { id: 'q42', text: "Le bébé palpe-t-il les objets placés dans sa main ?" },
      { id: 'q43', text: "Le bébé tend-il les objets à une personne ?" },
      { id: 'q45', text: "Le bébé a-t-il peur de l’étranger ?" },
      { id: 'q46', text: "Le bébé réagit-il à l’appel de son prénom ?" },
      { id: 'q47', text: "Le bébé dort-il bien ?" },
      { id: 'q48', text: "Le bébé regarde-t-il dans la direction du doigt pointé par l’adulte ?" },
      { id: 'q49', text: "Le bébé émet-il des sons (Syllabes : ma…Ba. Da…) ?" },
    ]
  },
  {
    label: "12 à 18 mois", min: 12, max: 17, questions: [
      { id: 'q50', text: "Le bébé marche-t-il tout seul ?" },
      { id: 'q51', text: "Le bébé évite-t-il les obstacles ?" },
      { id: 'q52', text: "Le bébé boit-il seul ?" },
      { id: 'q53', text: "Le bébé comprend-il le « non » ?" },
      { id: 'q54', text: "Le bébé dit-il des mots ?" },
      { id: 'q55', text: "Le bébé joue-t-il à jeter les objets par terre et à taper sur la table ?" },
      { id: 'q56', text: "Le bébé réagit-il à l’appel de son prénom ?" },
      { id: 'q57', text: "Le bébé dort-il bien ?" },
      { id: 'q58', text: "Le bébé imite-t-il les gestes ?" },
      { id: 'q59', text: "Le bébé pointe-t-il du doigt un objet ou une personne ?" },
    ]
  },
  {
    label: "18 à 24 mois", min: 18, max: 23, questions: [
      { id: 'q60', text: "Le bébé dit-il des mots phrases ?" },
      { id: 'q61', text: "Le bébé exécute-t-il une consigne simple (donne-moi le gobelet) ?" },
      { id: 'q62', text: "Le bébé a-t-il peur du danger ?" },
      { id: 'q63', text: "Le bébé pointe-t-il du doigt un objet/une personne ?" },
      { id: 'q64', text: "Le bébé mange-t-il seul à l’aide d’une cuillère ?" },
      { id: 'q65', text: "Le bébé trie-t-il la nourriture ?" },
      { id: 'q66', text: "Le bébé joue-t-il avec les autres enfants de son âge ?" },
      { id: 'q67', text: "Le bébé joue-t-il à faire semblant (ex : il porte tout objet à l’oreille pour téléphoner) ?" },
      { id: 'q68', text: "Le bébé marche-t-il à reculons ?" },
      { id: 'q69', text: "Le bébé pousse-t-il du pied un ballon ?" },
      { id: 'q70', text: "Le bébé joue-t-il au cache-cache ?" },
      { id: 'q71', text: "Le bébé réagit-il à l’appel de son prénom ?" },
      { id: 'q72', text: "Le bébé dort-il bien ?" },
    ]
  },
  {
    label: "24 à 36 mois", min: 24, max: 35, questions: [
      { id: 'q73', text: "L’enfant obéît-il lorsqu’on l’envoie ?" },
      { id: 'q74', text: "L’enfant fait-il des phrases simples ?" },
      { id: 'q75', text: "L’enfant bouge-t-il beaucoup ?" },
      { id: 'q76', text: "L’enfant manifeste-t-il l’envie de faire ses besoins (Pipi, selles) ?" },
      { id: 'q77', text: "L’enfant imite-t-il les gestes ?" },
      { id: 'q78', text: "L’enfant dort-il bien ?" },
      { id: 'q79', text: "L’enfant distingue-t-il les odeurs ?" },
      { id: 'q80', text: "L’enfant utilise-t-il correctement les jouets ?" },
      { id: 'q81', text: "L’enfant imite-t-il les sons (bruit des animaux, bruit de voiture…) ?" },
      { id: 'q82', text: "L’enfant comprend-il ce qu’on lui dit ?" },
      { id: 'q83', text: "L’enfant fait-il des mouvements inhabituels du corps (balancement, battement rapide des mains…) ?" },
      { id: 'q84', text: "L’enfant marche-t-il sur la pointe des pieds ?" },
      { id: 'q85', text: "L’enfant se bouche-t-il les oreilles le plus souvent ?" },
      { id: 'q86', text: "L’enfant répète-t-il la même question en guise de réponse (écholalie) ?" },
      { id: 'q87', text: "L’enfant utilise-t-il la main d’autrui pour exprimer ses besoins ?" },
    ]
  },
  {
    label: "36 à 48 mois", min: 36, max: 47, questions: [
      { id: 'q88', text: "L’enfant monte-t-il l’escalier tout seul ?" },
      { id: 'q89', text: "L’enfant pointe-t-il du doigt ?" },
      { id: 'q90', text: "L’enfant aide-t-il au port de chaussure ?" },
      { id: 'q91', text: "L’enfant aide-t-il à l’habillage ?" },
      { id: 'q92', text: "L’enfant fait-il du gribouillage ?" },
      { id: 'q93', text: "L’enfant est-il curieux ?" },
      { id: 'q94', text: "L’enfant joue-t-il avec les autres enfants de son âge ?" },
      { id: 'q95', text: "L’enfant est-il indifférent aux sollicitations ?" },
      { id: 'q96', text: "L’enfant peut-il rapporter un fait vécu ?" },
      { id: 'q97', text: "L’enfant est-il agressif ?" },
      { id: 'q98', text: "L’enfant distingue-t-il la gauche de la droite ?" },
      { id: 'q99', text: "L’enfant utilise-t-il correctement les jouets ?" },
      { id: 'q100', text: "L’enfant dort-il bien ?" },
      { id: 'q101', text: "L’enfant vit-il mal la séparation d’avec ses proches ?" },
    ]
  },
  {
    label: "48 à 59 mois", min: 48, max: 60, questions: [
      { id: 'q102', text: "L’enfant prononce-t-il correctement les mots ?" },
      { id: 'q103', text: "L’enfant fait-il des phrases correctes (sujet- verbe- complément) ?" },
      { id: 'q104', text: "L’enfant utilise-t-il seul les toilettes ?" },
      { id: 'q105', text: "L’enfant s’habille-t-il tout seul ?" },
      { id: 'q106', text: "L’enfant se chausse-t-il tout seul ?" },
      { id: 'q107', text: "L’enfant s’adapte-t-il à la vie scolaire ?" },
      { id: 'q108', text: "L’enfant trie-t-il la nourriture ?" },
      { id: 'q109', text: "L’enfant est-il capable de manger tout seul ?" },
      { id: 'q110', text: "L’enfant dort-il bien ?" },
      { id: 'q111', text: "L’enfant répond-il de façon adaptée aux questions simples ?" },
      { id: 'q112', text: "L’enfant exécute-t-il les consignes simples ?" },
      { id: 'q113', text: "L’enfant utilise-t-il correctement les jouets ?" },
      { id: 'q114', text: "L’enfant mastique-t-il correctement les aliments avant de les avaler ?" },
      { id: 'q115', text: "L’enfant est-il agressif ? (Hétéro-agressivité ou auto agressivité)" },
      { id: 'q117', text: "L’enfant a-t-il le vocabulaire assez fourni pour soutenir une conversation ?" },
      { id: 'q118', text: "L’enfant obéît-il aux consignes ?" },
      { id: 'q121', text: "L’enfant mène-t-il une activité jusqu’à terme ?" },
      { id: 'q122', text: "L’enfant bouge-t-il tout le temps ?" },
      { id: 'q123', text: "L’enfant parle-t-il trop ?" },
      { id: 'q124', text: "L’enfant est-il en retrait des autres ?" },
      { id: 'q125', text: "L’enfant change-t-il d’humeur de façon subite et radicale ?" },
      { id: 'q127', text: "L’enfant a-t-il peur du danger ?" },
      { id: 'q128', text: "L’enfant mastique-t-il correctement les aliments avant de les avaler ?" },
    ]
  }
];


interface ScreeningHistory {
  id: string;
  child_name: string;
  risk_level: string;
  score: number;
  created_at: string;
  responses?: Record<string, boolean>;
  agent_id?: string;
  form_type?: string; 
}

interface MonthlyReport {
  id: string;
  report_month: string;
  created_at: string;
}

const NasqScreeningModule: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // États d'identification
  const [childName, setChildName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentContact, setParentContact] = useState('');

  // MODIFICATION 1/3 : État pour stocker la structure assignée à l'agent
  const [agentAssignedStructure, setAgentAssignedStructure] = useState<string | null>(null);
  
  // Nouveaux champs facultatifs
  const [motherDob, setMotherDob] = useState('');
  const [tndHistory, setTndHistory] = useState('');
  const [cmuNumber, setCmuNumber] = useState('');

  // États du formulaire
  const [stage, setStage] = useState<1 | 2>(1); // 1 = Dépistage Âge, 2 = M-CHAT
  const [answersStage1, setAnswersStage1] = useState<Record<string, boolean>>({});
  const [answersStage2, setAnswersStage2] = useState<Record<string, boolean>>({});
  const [agentComment, setAgentComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{score: number, risk: any, maxScore: number} | null>(null);
  
  // Pop-up Sensibilisation
  const [showSensibilisationPopup, setShowSensibilisationPopup] = useState(false);

  // États pour l'historique et les onglets
  const [myScreenings, setMyScreenings] = useState<ScreeningHistory[]>([]);
  const [myReports, setMyReports] = useState<MonthlyReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ScreeningHistory | null>(null);
  const [activeTab, setActiveTab] = useState<'screenings' | 'reports'>('screenings');

  // Rapport Mensuel
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTransmittingReport, setIsTransmittingReport] = useState(false);
  const [reportData, setReportData] = useState({
    femmesEduquees: '', seancesEducation: '', femmesCasSuspects: '', femmesOrientees: '',
    enfantsConsultes: '', enfantsSurveilles: '', enfantsCasSuspects: '', enfantsReferes: '', enfantsMchatPositifs: ''
  });

  // --- LOGIQUE D'ÂGE ET DE FORMULAIRE DYNAMIQUE ---
  const ageInMonths = useMemo(() => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
    months -= birthDate.getMonth();
    months += today.getMonth();
    return months <= 0 ? 0 : months;
  }, [dob]);

  const currentBracket = useMemo(() => {
    if (ageInMonths === null) return null;
    
    // Cherche la tranche qui correspond exactement
    const exactBracket = AGE_BRACKETS.find(b => ageInMonths >= b.min && ageInMonths <= b.max);
    if (exactBracket) return exactBracket;

    // NOUVEAUTÉ : Si l'enfant a plus de 60 mois (dépassant la dernière tranche), on lui assigne la toute dernière tranche disponible
    if (ageInMonths > 60) {
      return AGE_BRACKETS[AGE_BRACKETS.length - 1]; // "48 à 59 mois"
    }

    return null;
  }, [ageInMonths]);

  const currentQuestions1 = currentBracket ? currentBracket.questions : [];
  const currentFormName = currentBracket ? `Surveillance PNSM (${currentBracket.label})` : "Formulaire Dépistage";

  // Réinitialiser les réponses si on change de date de naissance
  useEffect(() => {
    setAnswersStage1({});
    setAnswersStage2({});
    setStage(1);
    setAgentComment('');
  }, [dob]);


  // --- CHARGEMENT HISTORIQUE ---
  const fetchMyData = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      // MODIFICATION 2/3 : On récupère la structure de l'agent en silence
      const { data: profileData } = await supabase
        .from('profiles')
        .select('assigned_structure')
        .eq('id', user.id)
        .single();

      if (profileData && profileData.assigned_structure) {
        setAgentAssignedStructure(profileData.assigned_structure);
      }

      const { data: screeningsData, error: screeningsError } = await supabase
        .from('screenings')
        .select('id, child_name, risk_level, score, created_at, responses, agent_id, form_type')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (screeningsError) throw screeningsError;
      setMyScreenings(screeningsData || []);

      const { data: reportsData, error: reportsError } = await supabase
        .from('monthly_reports')
        .select('id, report_month, created_at')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;
      setMyReports(reportsData || []);
      
    } catch (err: any) {
      console.error("Erreur de chargement des données:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchMyData();
  }, [user]);

  // --- VÉRIFICATION DES DOUBLONS ---
  useEffect(() => {
    const checkDuplicate = async () => {
      if (childName.length > 2 && dob && parentName.length > 2) {
        try {
          const { data, error } = await supabase
            .from('screenings')
            .select('*')
            .ilike('child_name', childName.trim())
            .eq('dob', dob)
            .ilike('parent_name', parentName.trim())
            .limit(1);

          if (error) throw error;

          if (data && data.length > 0) {
            const existingPatient = data[0];
            if (existingPatient.agent_id === user?.id) {
              toast({ title: "Patient existant", description: "Ce patient a déjà été recensé par vous. Redirection vers l'historique." });
              resetForm();
              setSelectedHistoryItem(existingPatient);
            } else {
              toast({ title: "Accès Refusé", description: "Ce patient est déjà recensé par un autre agent dans le système national.", variant: "destructive" });
              resetForm();
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    const timeoutId = setTimeout(() => { checkDuplicate(); }, 1000);
    return () => clearTimeout(timeoutId);
  }, [childName, dob, parentName, user?.id, toast]);


  const handleAnswer1 = (qId: string, value: boolean) => { setAnswersStage1(prev => ({ ...prev, [qId]: value })); };
  const handleAnswer2 = (qId: string, value: boolean) => { setAnswersStage2(prev => ({ ...prev, [qId]: value })); };

  const answeredCount1 = Object.keys(answersStage1).length;
  const answeredCount2 = Object.keys(answersStage2).length;

  // Calcul du risque pour le Stage 1 (Au moins un NON = Risque)
  const hasRiskInStage1 = currentQuestions1.some(q => answersStage1[q.id] === false);

  // Calcul du score M-CHAT (Stage 2)
  const calculateMchatScore = () => {
    let score = 0;
    M_CHAT_R_QUESTIONS.forEach((q, index) => {
      const answer = answersStage2[q.id];
      if (answer === undefined) return;
      // Questions inversées (2, 5, 12) : Oui = Risque
      if ((index + 1) === 2 || (index + 1) === 5 || (index + 1) === 12) {
        if (answer === true) score += 1;
      } else {
        if (answer === false) score += 1;
      }
    });
    return score;
  };

  const getRiskLevel = (score: number, isMchat: boolean) => {
    if (!isMchat) {
      return { label: "Développement Normal", color: "text-emerald-600", bg: "bg-emerald-50", borderTop: "border-t-emerald-500", icon: <ShieldCheck className="h-12 w-12 text-emerald-600" /> };
    } else {
      if (score <= 2) return { label: "Risque Faible", color: "text-emerald-600", bg: "bg-emerald-50", borderTop: "border-t-emerald-500", icon: <ShieldCheck className="h-12 w-12 text-emerald-600" /> };
      if (score <= 7) return { label: "Risque Moyen", color: "text-amber-600", bg: "bg-amber-50", borderTop: "border-t-amber-500", icon: <AlertTriangle className="h-12 w-12 text-amber-600" /> };
      return { label: "Risque Élevé", color: "text-red-600", bg: "bg-red-50", borderTop: "border-t-red-500", icon: <AlertTriangle className="h-12 w-12 text-red-600" /> };
    }
  };

  const proceedToNextStage = () => {
    if (hasRiskInStage1) {
      setStage(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast({ title: "Risque détecté", description: "Le système requiert l'administration du questionnaire M-CHAT-R.", variant: "destructive" });
    } else {
      submitData(false); // Soumission directe (Normal)
    }
  };

  const submitData = async (fromMchat: boolean) => {
    if (!childName || !dob || !gender || !location) {
      toast({ title: "Erreur", description: "Veuillez remplir toutes les informations obligatoires (*).", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    
    // Si MCHAT a été fait, le score final est celui du MCHAT. Sinon, c'est le nombre de "Non" du stage 1 (qui est 0 ici).
    const finalScore = fromMchat ? calculateMchatScore() : 0;
    const riskStatus = getRiskLevel(finalScore, fromMchat);
    const finalFormType = fromMchat ? `${currentFormName} + M-CHAT-R` : currentFormName;

    // Concaténer toutes les réponses et métadonnées
    const finalResponses = {
      ...answersStage1,
      ...answersStage2,
      agent_comment: agentComment,
      mother_dob: motherDob,
      tnd_history: tndHistory,
      cmu_number: cmuNumber
    };

    try {
      const { error } = await supabase.from('screenings').insert([{
        agent_id: user?.id,
        child_name: childName,
        dob: dob,
        gender: gender,
        location: location,
        parent_name: parentName,
        parent_contact: parentContact,
        responses: finalResponses,
        score: finalScore,
        risk_level: riskStatus.label,
        form_type: finalFormType,
        structure: agentAssignedStructure || 'Non assignée', // MODIFICATION 3/3 : On injecte la structure ici
        created_at: new Date().toISOString()
      }]);

      if (error) throw error;
      toast({ title: "Succès", description: "Recensement enregistré !" });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSubmittedResult({ score: finalScore, risk: riskStatus, maxScore: fromMchat ? M_CHAT_R_QUESTIONS.length : currentQuestions1.length });
      
      // Si MCHAT a été déclenché, on affiche le Pop-up de sensibilisation
      if (fromMchat) {
        setShowSensibilisationPopup(true);
      }

      fetchMyData(); 
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- GÉNÉRATION DU PDF ---
  const downloadReportPDF = () => {
    const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const printContent = `
      <html>
        <head>
          <title>Rapport Mensuel - ${currentMonth}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #0056A8; padding-bottom: 20px; }
            .title { color: #0056A8; font-size: 24px; font-weight: 900; margin: 10px 0; text-transform: uppercase; }
            .subtitle { color: #00A3E0; font-size: 16px; font-weight: bold; margin-bottom: 20px; }
            .meta { font-size: 14px; color: #64748b; display: flex; justify-content: space-between; }
            .section { margin-bottom: 40px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
            .section-title { background: #f8fafc; color: #0056A8; padding: 15px; font-weight: bold; font-size: 14px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
            .row { display: flex; justify-content: space-between; padding: 12px 15px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .row:last-child { border-bottom: none; }
            .val { font-weight: bold; font-size: 16px; color: #0f172a; }
            .highlight { color: #0056A8; }
            .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 50px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Rapport Mensuel d'Activité</div>
            <div class="subtitle">Programme National de Santé Mentale (PNSM)</div>
            <div class="meta">
              <span><strong>Agent:</strong> ${user?.firstName} ${user?.lastName}</span>
              <span><strong>Mois:</strong> ${currentMonth.toUpperCase()}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">1. Chez les femmes en âge de procréer</div>
            <div class="row"><span>Femmes éduquées (Dev. jeune enfant)</span><span class="val">${reportData.femmesEduquees || '0'}</span></div>
            <div class="row"><span>Séances d'éducation organisées</span><span class="val">${reportData.seancesEducation || '0'}</span></div>
            <div class="row"><span>Cas suspects détectés</span><span class="val">${reportData.femmesCasSuspects || '0'}</span></div>
            <div class="row"><span>Femmes orientées vers les spécialistes</span><span class="val">${reportData.femmesOrientees || '0'}</span></div>
          </div>

          <div class="section">
            <div class="section-title">2. Chez les enfants de 0 à 59 mois</div>
            <div class="row"><span>Enfants de 0 à 59 mois reçus en consultation</span><span class="val">${reportData.enfantsConsultes || '0'}</span></div>
            <div class="row"><span>Enfants ayant bénéficié d'une surveillance</span><span class="val">${reportData.enfantsSurveilles || '0'}</span></div>
            <div class="row"><span>Cas suspects (Troubles du dev.) détectés</span><span class="val">${reportData.enfantsCasSuspects || '0'}</span></div>
            <div class="row"><span>Enfants référés vers les spécialistes</span><span class="val">${reportData.enfantsReferes || '0'}</span></div>
            <div class="row" style="background:#f0f9ff;">
              <span class="highlight">Enfants de 18 à 24 mois dépistés positifs au M-CHAT</span>
              <span class="val highlight">${reportData.enfantsMchatPositifs || '0'}</span>
            </div>
          </div>
          
          <div class="footer">
            Généré depuis le Portail Terrain NURIA le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const transmitReport = async () => {
    setIsTransmittingReport(true);
    try {
      const { error } = await supabase.from('monthly_reports').insert([{
        agent_id: user?.id,
        report_month: new Date().toISOString().slice(0, 7),
        data: reportData
      }]);

      if (error) throw error;
      
      toast({ title: "Rapport Transmis", description: "Votre rapport a été envoyé avec succès au Programme national." });
      setIsReportModalOpen(false);
      fetchMyData();
    } catch (err: any) {
      toast({ title: "Erreur d'envoi", description: err.message, variant: "destructive" });
    } finally {
      setIsTransmittingReport(false);
    }
  };

  const resetForm = () => {
    setSubmittedResult(null);
    setAnswersStage1({});
    setAnswersStage2({});
    setStage(1);
    setChildName('');
    setDob('');
    setGender('');
    setLocation('');
    setParentName('');
    setParentContact('');
    setMotherDob('');
    setTndHistory('');
    setCmuNumber('');
    setAgentComment('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredHistory = myScreenings.filter(s => s.child_name.toLowerCase().includes(searchQuery.toLowerCase()));
  const alertCount = myScreenings.filter(s => s.score >= (s.form_type?.includes('M-CHAT') ? 3 : 1)).length; 

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-slate-800 relative">
      
      <div className="fixed inset-0 z-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img src="/logo-nuria.png" alt="" className="w-[80%] md:w-[60%] object-contain" />
      </div>

      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm relative">
        <div className="container max-w-7xl mx-auto px-4 h-24 flex justify-between items-center">
          <div className="flex items-center gap-5">
             <img src="/logo-nuria.png" alt="NURIA Logo" className="h-16 md:h-20 object-contain" />
             <div className="hidden md:block border-l-2 border-slate-200 pl-5">
               <h1 className="text-xl font-black text-[#0056A8] tracking-tight uppercase">Portail Agent Terrain</h1>
               <p className="text-sm font-semibold text-[#00A3E0]">Dépistage & Surveillance</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-700">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs font-medium text-slate-500 flex items-center justify-end gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> En ligne
              </p>
            </div>
            <Button variant="ghost" className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full h-10 w-10 p-0" onClick={() => { logout(); navigate('/login'); }} title="Quitter">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto mt-8 px-4 flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* ==================== COLONNE GAUCHE (HISTORIQUE MULTIPLE) ==================== */}
        <div className="w-full lg:w-1/3 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#0056A8] to-[#00A3E0] p-1"></div>
            <CardHeader className="pb-4 bg-white border-b">
              <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                <History className="h-5 w-5 text-[#00A3E0]" /> Mon Activité
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6 bg-white">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Recensés</p>
                  <p className="text-4xl font-black text-[#0056A8]">{myScreenings.length}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex flex-col items-center justify-center">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">À Risque</p>
                  <p className="text-4xl font-black text-red-600">{alertCount}</p>
                </div>
              </div>

              <Button onClick={() => setIsReportModalOpen(true)} className="w-full h-12 bg-[#0056A8] hover:bg-[#004080] text-white shadow-md hover:shadow-lg transition-all rounded-xl font-bold" size="lg">
                <FileText className="mr-2 h-5 w-5" /> Gérer le Rapport Mensuel
              </Button>

              <div className="flex bg-slate-100 p-1.5 rounded-xl">
                <button 
                  onClick={() => setActiveTab('screenings')} 
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'screenings' ? 'bg-white shadow-sm text-[#0056A8]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Dépistages
                </button>
                <button 
                  onClick={() => setActiveTab('reports')} 
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'reports' ? 'bg-white shadow-sm text-[#0056A8]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Rapports Transmis
                </button>
              </div>

              {activeTab === 'screenings' && (
                <>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 mt-1" />
                    <Input 
                      placeholder="Rechercher un enfant..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-11 h-12 bg-slate-50 border-transparent focus:border-[#00A3E0] focus:ring-[#00A3E0] rounded-xl font-medium"
                    />
                  </div>

                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {isLoadingHistory ? (
                      <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-[#00A3E0]" /></div>
                    ) : filteredHistory.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed">
                        <p className="text-sm font-medium text-slate-500">Aucun recensement trouvé.</p>
                      </div>
                    ) : (
                      filteredHistory.map(item => {
                        const isMchat = item.form_type?.includes('M-CHAT');
                        const isAtRisk = isMchat ? item.score >= 3 : item.score > 0;
                        const isHighRisk = isMchat ? item.score >= 8 : item.score > 2;

                        return (
                          <div 
                            key={item.id} 
                            onClick={() => setSelectedHistoryItem(item)}
                            className={`p-4 rounded-xl border flex justify-between items-center transition-all hover:shadow-md cursor-pointer bg-white ${
                              isHighRisk ? 'border-l-4 border-l-red-500' : 
                              isAtRisk ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-emerald-500'
                            }`}
                          >
                            <div className="min-w-0 pr-3">
                              <p className="font-bold text-slate-800 truncate text-[15px]">{item.child_name}</p>
                              <p className="text-xs font-semibold text-slate-400 mt-0.5">{new Date(item.created_at).toLocaleDateString('fr-FR')} • {isMchat ? 'M-CHAT' : 'PNSM'}</p>
                            </div>
                            <Badge variant="outline" className={`font-black text-sm px-3 py-1 shrink-0 ${
                              isHighRisk ? 'text-red-600 bg-red-50 border-red-200' : 
                              isAtRisk ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200'
                            }`}>
                              Score: {item.score}
                            </Badge>
                          </div>
                        )
                      })
                    )}
                  </div>
                </>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                  {myReports.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed">
                      <p className="text-sm font-medium text-slate-500">Aucun rapport transmis pour le moment.</p>
                    </div>
                  ) : (
                    myReports.map(report => (
                      <div key={report.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="bg-emerald-100 p-2 rounded-lg"><CheckSquare className="h-5 w-5 text-emerald-600" /></div>
                          <div>
                            <p className="font-bold text-slate-800 text-[15px]">Mois : {new Date(report.report_month + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                            <p className="text-xs font-semibold text-slate-400 mt-0.5">Envoyé le {new Date(report.created_at).toLocaleDateString('fr-FR')} à {new Date(report.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ==================== COLONNE DROITE (FORMULAIRE) ==================== */}
        <div className="w-full lg:w-2/3">
          {submittedResult ? (
            <Card className={`border-none shadow-2xl rounded-2xl animate-in zoom-in slide-in-from-bottom-8 duration-500 ${submittedResult.risk.borderTop}`}>
              <div className={`h-2 w-full ${submittedResult.risk.bg.includes('red') ? 'bg-red-500' : submittedResult.risk.bg.includes('amber') ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
              <CardContent className="pt-16 pb-12 flex flex-col items-center text-center space-y-8 bg-white">
                <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-inner animate-in zoom-in delay-200 duration-500 ${submittedResult.risk.bg}`}>
                  {submittedResult.risk.icon}
                </div>
                <div>
                  <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">Évaluation Terminée</h2>
                  <p className="text-lg font-medium text-slate-500">Le dossier de <strong className="text-[#0056A8]">{childName}</strong> a été enregistré avec succès.</p>
                </div>
                <div className="bg-slate-50 w-full max-w-md rounded-3xl p-8 border shadow-sm">
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Score Final</p>
                  <div className="flex items-baseline justify-center gap-2 mb-5">
                    <span className={`text-8xl font-black tracking-tighter ${submittedResult.risk.color}`}>{submittedResult.score}</span>
                    <span className="text-4xl font-bold text-slate-300">/{submittedResult.maxScore}</span>
                  </div>
                  <div className={`inline-block px-8 py-3 rounded-full font-black text-xl shadow-sm border ${submittedResult.risk.bg} ${submittedResult.risk.color} border-${submittedResult.risk.color.split('-')[1]}-200`}>
                    {submittedResult.risk.label}
                  </div>
                </div>
                <div className="w-full max-w-md grid grid-cols-1 gap-4 pt-6">
                  <Button size="lg" className="h-16 text-lg bg-[#00A3E0] hover:bg-[#0082b3] text-white shadow-lg rounded-xl font-bold transition-all" onClick={resetForm}>
                    <Plus className="mr-2 h-6 w-6" /> Nouveau recensement
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            
            <div className="space-y-6">
              
              {/* CARTE D'IDENTIFICATION (Affichée uniquement à l'étape 1) */}
              {stage === 1 && (
                <Card className="border-none shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
                  <div className="bg-[#0056A8] p-1.5"></div>
                  <CardHeader className="bg-white border-b pb-5">
                    <CardTitle className="text-xl font-black text-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Baby className="h-6 w-6 text-[#00A3E0]" /> Identité de l'enfant
                      </div>
                      {currentBracket && (
                        <Badge className="bg-[#0056A8] text-white text-xs px-3 py-1 font-bold">
                          {currentFormName}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-5 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Nom de l'enfant <span className="text-red-500">*</span></Label>
                        <Input placeholder="Prénom Nom" value={childName} onChange={(e) => setChildName(e.target.value)} className="h-12 bg-slate-50 rounded-xl border-slate-200 focus:border-[#0056A8]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Date de naissance de l'enfant <span className="text-red-500">*</span></Label>
                        <Input type="date" max={new Date().toISOString().split("T")[0]} value={dob} onChange={(e) => setDob(e.target.value)} className="h-12 bg-slate-50 rounded-xl border-slate-200 focus:border-[#0056A8]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Genre <span className="text-red-500">*</span></Label>
                        <Select onValueChange={setGender} value={gender}>
                          <SelectTrigger className="h-12 bg-slate-50 rounded-xl border-slate-200 focus:ring-[#0056A8]"><SelectValue placeholder="Choisir" /></SelectTrigger>
                          <SelectContent><SelectItem value="M">Masculin</SelectItem><SelectItem value="F">Féminin</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Lieu de recensement <span className="text-red-500">*</span></Label>
                        <Select onValueChange={setLocation} value={location}>
                          <SelectTrigger className="h-12 bg-slate-50 rounded-xl border-slate-200 focus:ring-[#0056A8]"><SelectValue placeholder="Choisir la ville..." /></SelectTrigger>
                          <SelectContent>
                            {IVORIAN_CITIES.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-500">Nom de la mère / tuteur <span className="text-red-500">*</span></Label>
                        <Input placeholder="Prénom Nom" value={parentName} onChange={(e) => setParentName(e.target.value)} className="h-12 bg-slate-50 rounded-xl border-slate-200 focus:border-[#0056A8]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-500">Contact parent</Label>
                        <Input type="tel" placeholder="Numéro de téléphone" value={parentContact} onChange={(e) => setParentContact(e.target.value)} className="h-12 bg-slate-50 rounded-xl border-slate-200 focus:border-[#0056A8]" />
                      </div>
                    </div>

                    {/* NOUVEAUX CHAMPS FACULTATIFS */}
                    <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-500 text-xs uppercase">Date naiss. Mère <span className="font-normal lowercase text-slate-400">(optionnel)</span></Label>
                        <Input type="date" value={motherDob} onChange={(e) => setMotherDob(e.target.value)} className="h-12 bg-slate-50 rounded-xl border-slate-200 focus:border-[#0056A8]" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-500 text-xs uppercase">Antécédent TND <span className="font-normal lowercase text-slate-400">(optionnel)</span></Label>
                        <Select onValueChange={setTndHistory} value={tndHistory}>
                          <SelectTrigger className="h-12 bg-slate-50 rounded-xl border-slate-200 focus:ring-[#0056A8]"><SelectValue placeholder="Oui / Non" /></SelectTrigger>
                          <SelectContent><SelectItem value="Oui">Oui</SelectItem><SelectItem value="Non">Non</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-500 text-xs uppercase">Numéro CMU <span className="font-normal lowercase text-slate-400">(optionnel)</span></Label>
                        <Input placeholder="N° CMU" value={cmuNumber} onChange={(e) => setCmuNumber(e.target.value)} className="h-12 bg-slate-50 rounded-xl border-slate-200 focus:border-[#0056A8]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ÉTAPE 1 : QUESTIONNAIRE PNSM PAR TRANCHE D'ÂGE */}
              {stage === 1 && ageInMonths === null && (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300">
                  <p className="text-slate-500 font-medium">Veuillez renseigner la date de naissance de l'enfant pour afficher les questions correspondantes.</p>
                </div>
              )}

              {stage === 1 && ageInMonths !== null && (
                <>
                  {currentQuestions1.map((q, index) => (
                    <Card key={q.id} className={`border-none shadow-sm rounded-2xl transition-all duration-300 overflow-hidden ${
                      answersStage1[q.id] !== undefined ? 'ring-2 ring-[#00A3E0]/30 bg-blue-50/30' : 'hover:shadow-md bg-white border border-slate-100'
                    }`}>
                      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex-1">
                          <p className="text-base md:text-lg font-semibold leading-snug text-slate-700">
                            <span className="text-[#0056A8] mr-3 font-black text-xl bg-blue-50 w-10 h-10 inline-flex items-center justify-center rounded-xl">{index + 1}</span>
                            {q.text}
                          </p>
                        </div>
                        <div className="flex gap-3 shrink-0 md:w-64">
                          <Button 
                            className={`flex-1 h-14 rounded-xl font-bold text-lg transition-all ${
                              answersStage1[q.id] === true ? "bg-[#0056A8] text-white shadow-md scale-105" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`} 
                            variant="ghost" onClick={() => handleAnswer1(q.id, true)}>Oui</Button>
                          <Button 
                            className={`flex-1 h-14 rounded-xl font-bold text-lg transition-all ${
                              answersStage1[q.id] === false ? "bg-red-500 text-white shadow-md scale-105" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`} 
                            variant="ghost" onClick={() => handleAnswer1(q.id, false)}>Non</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* CHAMP COMMENTAIRE (Fin du stage 1) */}
                  {currentQuestions1.length > 0 && (
                    <Card className="border-none shadow-sm rounded-2xl bg-white border border-slate-100">
                      <CardContent className="p-6">
                        <Label className="font-bold text-slate-700 mb-2 block">Commentaire ou observation de l'agent <span className="font-normal text-slate-400">(Facultatif)</span></Label>
                        <textarea 
                          value={agentComment}
                          onChange={(e) => setAgentComment(e.target.value)}
                          placeholder="Notez ici toute observation comportementale inhabituelle remarquée lors de l'entretien..."
                          className="w-full min-h-[100px] p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#0056A8] focus:ring-1 focus:ring-[#0056A8] outline-none transition-all resize-y"
                        />
                      </CardContent>
                    </Card>
                  )}

                  {currentQuestions1.length > 0 && (
                    <div className="sticky bottom-6 z-10 pt-4">
                      <Card className="border-none shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-2xl bg-white/95 backdrop-blur-xl">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4 px-1">
                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Progression</span>
                            <span className="text-base font-black text-[#0056A8] bg-blue-50 px-3 py-1 rounded-lg">{answeredCount1} / {currentQuestions1.length}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-3 rounded-full mb-6 overflow-hidden">
                            <div className="h-full transition-all duration-500 ease-out rounded-full bg-gradient-to-r from-[#00A3E0] to-[#0056A8]" style={{ width: `${(answeredCount1 / currentQuestions1.length) * 100}%` }} />
                          </div>
                          <Button 
                            className={`w-full h-16 text-lg rounded-xl font-black transition-all ${
                              answeredCount1 === currentQuestions1.length ? (hasRiskInStage1 ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xl hover:-translate-y-1' : 'bg-[#0056A8] hover:bg-[#004080] text-white shadow-xl hover:-translate-y-1') : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`} 
                            disabled={isSubmitting || answeredCount1 < currentQuestions1.length} 
                            onClick={proceedToNextStage}
                          >
                            {isSubmitting ? <Loader2 className="animate-spin mr-3 h-6 w-6" /> : (hasRiskInStage1 ? <ArrowRight className="mr-3 h-6 w-6" /> : <CheckCircle2 className="mr-3 h-6 w-6" />)}
                            {answeredCount1 < currentQuestions1.length ? `Répondez aux questions restantes` : (hasRiskInStage1 ? `Suivant (Approfondissement M-CHAT-R requis)` : `Enregistrer le dépistage`)}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </>
              )}

              {/* ÉTAPE 2 : QUESTIONNAIRE M-CHAT-R (Affiché uniquement si risque détecté en Stage 1) */}
              {stage === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
                    <AlertTriangle className="h-8 w-8 text-amber-500 shrink-0" />
                    <div>
                      <h3 className="font-bold text-amber-800 text-lg">Approfondissement Requis</h3>
                      <p className="text-amber-700 text-sm mt-1">L'évaluation précédente indique un risque. Veuillez poursuivre avec le questionnaire spécifique M-CHAT-R pour affiner le diagnostic.</p>
                    </div>
                  </div>

                  {M_CHAT_R_QUESTIONS.map((q, index) => (
                    <Card key={q.id} className={`border-none shadow-sm rounded-2xl transition-all duration-300 overflow-hidden ${
                      answersStage2[q.id] !== undefined ? 'ring-2 ring-amber-400/50 bg-amber-50/30' : 'hover:shadow-md bg-white border border-slate-100'
                    }`}>
                      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex-1">
                          <p className="text-base md:text-lg font-semibold leading-snug text-slate-700">
                            <span className="text-amber-600 mr-3 font-black text-xl bg-amber-100 w-10 h-10 inline-flex items-center justify-center rounded-xl">{index + 1}</span>
                            {q.text}
                          </p>
                        </div>
                        <div className="flex gap-3 shrink-0 md:w-64">
                          <Button 
                            className={`flex-1 h-14 rounded-xl font-bold text-lg transition-all ${
                              answersStage2[q.id] === true ? "bg-amber-500 text-white shadow-md scale-105" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`} 
                            variant="ghost" onClick={() => handleAnswer2(q.id, true)}>Oui</Button>
                          <Button 
                            className={`flex-1 h-14 rounded-xl font-bold text-lg transition-all ${
                              answersStage2[q.id] === false ? "bg-red-500 text-white shadow-md scale-105" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`} 
                            variant="ghost" onClick={() => handleAnswer2(q.id, false)}>Non</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="sticky bottom-6 z-10 pt-4">
                    <Card className="border-none shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-2xl bg-white/95 backdrop-blur-xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4 px-1">
                          <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Progression M-CHAT-R</span>
                          <span className="text-base font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">{answeredCount2} / {M_CHAT_R_QUESTIONS.length}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full mb-6 overflow-hidden">
                          <div className="h-full transition-all duration-500 ease-out rounded-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: `${(answeredCount2 / M_CHAT_R_QUESTIONS.length) * 100}%` }} />
                        </div>
                        <Button 
                          className={`w-full h-16 text-lg rounded-xl font-black transition-all ${
                            answeredCount2 === M_CHAT_R_QUESTIONS.length ? 'bg-[#0056A8] hover:bg-[#004080] text-white shadow-xl hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`} 
                          disabled={isSubmitting || answeredCount2 < M_CHAT_R_QUESTIONS.length} 
                          onClick={() => submitData(true)}
                        >
                          {isSubmitting ? <Loader2 className="animate-spin mr-3 h-6 w-6" /> : <CheckCircle2 className="mr-3 h-6 w-6" />}
                          {answeredCount2 < M_CHAT_R_QUESTIONS.length ? `Terminez les questions restantes` : `Enregistrer l'évaluation complète`}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL : SENSIBILISATION (S'affiche après un M-CHAT complété) */}
      {/* ========================================================================= */}
      <Dialog open={showSensibilisationPopup} onOpenChange={setShowSensibilisationPopup}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white border-2 border-red-100">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-800">Action Requise</DialogTitle>
            <DialogDescription className="text-base font-medium text-slate-600">
              L'évaluation de l'enfant a révélé des signes de risque de Trouble du Neurodéveloppement (TND).
            </DialogDescription>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 w-full text-left">
              <p className="text-sm font-bold text-slate-800 mb-2">Consigne pour l'agent :</p>
              <p className="text-sm text-slate-600">
                Veuillez conseiller fermement aux parents de se rendre dans le centre de santé le plus proche pour une consultation médicale spécialisée.
              </p>
            </div>
            <Button className="w-full h-14 text-lg font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl" onClick={() => setShowSensibilisationPopup(false)}>
              J'ai transmis l'information
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL : DÉTAIL D'UN DÉPISTAGE (HISTORIQUE) */}
      {/* ========================================================================= */}
      <Dialog open={!!selectedHistoryItem} onOpenChange={(open) => !open && setSelectedHistoryItem(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 bg-slate-50">
          <DialogHeader className="mb-4 border-b border-slate-200 pb-4">
            <DialogTitle className="text-2xl font-black text-slate-800">Détail du dépistage</DialogTitle>
            <DialogDescription className="text-base font-semibold text-slate-600 mt-2">
              Patient : <span className="text-[#0056A8]">{selectedHistoryItem?.child_name}</span><br/>
              Date : {selectedHistoryItem ? new Date(selectedHistoryItem.created_at).toLocaleDateString('fr-FR') : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-slate-200 mb-6 shadow-sm">
            <span className="font-bold text-slate-600 uppercase tracking-widest text-sm">Score Obtenu :</span>
            <Badge variant="outline" className={`font-black text-lg px-4 py-1.5 ${
              (selectedHistoryItem?.score || 0) >= (selectedHistoryItem?.form_type?.includes('M-CHAT') ? 8 : 2) ? 'text-red-600 bg-red-50 border-red-200' : 
              (selectedHistoryItem?.score || 0) >= (selectedHistoryItem?.form_type?.includes('M-CHAT') ? 3 : 1) ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200'
            }`}>
              {selectedHistoryItem?.score} {selectedHistoryItem?.form_type?.includes('M-CHAT') ? '/20' : ''} - {selectedHistoryItem?.risk_level}
            </Badge>
          </div>
          <div className="space-y-3">
            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-[#00A3E0]" /> Réponses sauvegardées :
            </h3>
            
            {/* Si un commentaire a été laissé, on l'affiche */}
            {selectedHistoryItem?.responses?.agent_comment && (
               <div className="p-4 border border-blue-200 rounded-xl bg-blue-50 mb-4 shadow-sm">
                  <p className="text-xs font-bold text-blue-800 uppercase mb-1">Commentaire de l'agent :</p>
                  <p className="text-sm font-medium text-blue-900">{selectedHistoryItem.responses.agent_comment}</p>
               </div>
            )}

            {/* Affichage des réponses M-CHAT ou de la liste globale (le form_type détermine ce qui a été fait) */}
            {(selectedHistoryItem?.form_type?.includes('M-CHAT') ? M_CHAT_R_QUESTIONS : [...AGE_BRACKETS.flatMap(b => b.questions)]).map((q, index) => {
              const ans = selectedHistoryItem?.responses?.[q.id];
              if (ans === undefined) return null; // Ne pas afficher les questions non posées
              return (
                <div key={q.id} className="flex gap-4 p-4 border border-slate-200 rounded-xl bg-white items-center justify-between shadow-sm">
                  <p className="text-sm font-semibold text-slate-700 flex-1">{q.text}</p>
                  <Badge className={`shrink-0 text-sm font-black w-16 h-8 flex justify-center items-center ${
                    ans === true ? 'bg-[#0056A8] text-white' : ans === false ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>{ans === true ? 'OUI' : ans === false ? 'NON' : '-'}</Badge>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL : RAPPORT MENSUEL (Inchangé) */}
      {/* ========================================================================= */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-0">
          <div className="bg-[#0056A8] p-6 text-white text-center rounded-t-3xl relative">
            <h2 className="text-2xl font-black">Rapport Mensuel d'Activité</h2>
            <p className="text-[#00A3E0] font-bold mt-1">Programme National de Santé Mentale (PNSM)</p>
          </div>
          
          <div className="p-8 space-y-8 bg-white">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-black text-[#0056A8] text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-lg">1</div> Femmes en âge de procréer
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Nb. de femmes ayant bénéficié d'une éducation (Dev. enfant)", key: "femmesEduquees" },
                  { label: "Nb. de séances d'éducation organisées", key: "seancesEducation" },
                  { label: "Nb. de cas suspects détectés", key: "femmesCasSuspects", isAlert: true },
                  { label: "Nb. de femmes orientées vers les spécialistes", key: "femmesOrientees" }
                ].map((field) => (
                  <div key={field.key} className="flex items-center justify-between gap-4 p-2 hover:bg-white rounded-lg transition-colors">
                    <Label className={`text-sm font-semibold flex-1 ${field.isAlert ? 'text-amber-600' : 'text-slate-600'}`}>{field.label}</Label>
                    <Input type="number" className={`w-24 h-12 text-center text-lg font-bold rounded-xl ${field.isAlert ? 'border-amber-300 focus:ring-amber-500' : 'border-slate-300'}`} value={(reportData as any)[field.key]} onChange={e => setReportData({...reportData, [field.key]: e.target.value})} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-black text-[#00A3E0] text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-lg text-[#00A3E0]">2</div> Enfants de 0 à 59 mois
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Nb. d'enfants reçus en consultation", key: "enfantsConsultes" },
                  { label: "Nb. d'enfants ayant bénéficié d'une surveillance", key: "enfantsSurveilles" },
                  { label: "Nb. de cas suspects (Troubles du dev.) détectés", key: "enfantsCasSuspects", isAlert: true },
                  { label: "Nb. d'enfants référés vers les spécialistes", key: "enfantsReferes" },
                ].map((field) => (
                  <div key={field.key} className="flex items-center justify-between gap-4 p-2 hover:bg-white rounded-lg transition-colors">
                    <Label className={`text-sm font-semibold flex-1 ${field.isAlert ? 'text-red-500' : 'text-slate-600'}`}>{field.label}</Label>
                    <Input type="number" className={`w-24 h-12 text-center text-lg font-bold rounded-xl ${field.isAlert ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`} value={(reportData as any)[field.key]} onChange={e => setReportData({...reportData, [field.key]: e.target.value})} />
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100 mt-4">
                  <Label className="text-sm font-black text-[#0056A8] flex-1">Nb. d'enfants de 18 à 24 mois dépistés positifs au M-CHAT</Label>
                  <Input type="number" className="w-24 h-14 text-center text-xl font-black rounded-xl border-[#0056A8] text-[#0056A8] focus:ring-[#0056A8]" value={reportData.enfantsMchatPositifs} onChange={e => setReportData({...reportData, enfantsMchatPositifs: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200">
              <Button variant="outline" className="flex-1 h-16 text-lg rounded-2xl font-bold border-2 border-[#0056A8] text-[#0056A8] hover:bg-blue-50" onClick={downloadReportPDF}>
                <Download className="mr-2 h-5 w-5" /> Télécharger en PDF
              </Button>
              <Button 
                className="flex-1 h-16 text-lg rounded-2xl bg-[#0056A8] hover:bg-[#004080] shadow-xl hover:-translate-y-1 transition-all font-black text-white" 
                onClick={transmitReport}
                disabled={isTransmittingReport}
              >
                {isTransmittingReport ? <Loader2 className="animate-spin mr-3 h-6 w-6" /> : <Send className="mr-3 h-6 w-6" />}
                Transmettre au Programme
              </Button>
            </div>
            
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NasqScreeningModule;