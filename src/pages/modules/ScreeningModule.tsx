import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Baby, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// --- QUESTIONS PNSM ---
const AGE_BRACKETS = [
  { label: "0 à 3 mois", min: 0, max: 2, questions: [
    { id: 'q15', text: "Nouveau-né à terme (36s +6j ≤ âge ≤ 39s) ?" },
    { id: 'q16', text: "Le bébé a-t-il crié immédiatement ?" },
    { id: 'q17', text: "Le bébé a-t-il présenté des Geignements ?" },
    { id: 'q18', text: "Le bébé a-t-il poussé des cris vigoureux ?" },
    { id: 'q19', text: "Le bébé a-t-il été réanimé ?" },
    { id: 'q21', text: "Le bébé a-t-il présenté des pathologies néonatales ?" },
  ]},
  { label: "3 à 6 mois", min: 3, max: 5, questions: [
    { id: 'q22', text: "Le bébé maintient-il la tête ?" },
    { id: 'q23', text: "Le bébé sourit-il lorsque quelqu’un lui sourit ?" },
    { id: 'q24', text: "Le bébé poursuit-il du regard ?" },
    { id: 'q25', text: "Le bébé réagit-il aux stimuli sonores ?" },
    { id: 'q26', text: "Le bébé dort-il bien ?" },
  ]},
  { label: "6 à 9 mois", min: 6, max: 8, questions: [
    { id: 'q27', text: "Le bébé s’assoit-il ?" },
    { id: 'q28', text: "Le bébé fait-il quatre-pattes ?" },
    { id: 'q29', text: "Le bébé saisit-il les objets ?" },
    { id: 'q31', text: "Le bébé réagit-il à l’appel de son nom ?" },
  ]},
  { label: "9 à 12 mois", min: 9, max: 11, questions: [
    { id: 'q40', text: "Le bébé se tient-il débout avec appui ?" },
    { id: 'q41', text: "Le bébé marche-t-il tenu par la main ?" },
    { id: 'q46', text: "Le bébé réagit-il à l’appel de son prénom ?" },
  ]},
  { label: "12 à 18 mois", min: 12, max: 17, questions: [
    { id: 'q50', text: "Le bébé marche-t-il tout seul ?" },
    { id: 'q53', text: "Le bébé comprend-il le « non » ?" },
    { id: 'q59', text: "Le bébé pointe-t-il du doigt un objet ?" },
  ]},
  { label: "18 à 24 mois", min: 18, max: 23, questions: [
    { id: 'q60', text: "Le bébé dit-il des mots phrases ?" },
    { id: 'q67', text: "Le bébé joue-t-il à faire semblant ?" },
  ]},
  { label: "24 à 36 mois", min: 24, max: 35, questions: [
    { id: 'q73', text: "L’enfant obéît-il lorsqu’on l’envoie ?" },
    { id: 'q74', text: "L’enfant fait-il des phrases simples ?" },
  ]},
  { label: "36 à 48 mois", min: 36, max: 47, questions: [
    { id: 'q88', text: "L’enfant monte-t-il l’escalier tout seul ?" },
    { id: 'q94', text: "L’enfant joue-t-il avec les autres ?" },
  ]},
  { label: "48 à 59 mois", min: 48, max: 500, questions: [ // 500 pour couvrir au-delà de 59 mois
    { id: 'q102', text: "L’enfant prononce-t-il correctement les mots ?" },
    { id: 'q103', text: "L’enfant fait-il des phrases correctes ?" },
  ]}
];

const ScreeningModule: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const isParent = user?.role === 'parent';

  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [ageGroup, setAgeGroup] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);

  // --- 1. LECTURE DES ENFANTS (Avec Filtre) ---
  useEffect(() => {
    const fetchChildren = async () => {
      setIsLoadingChildren(true);
      try {
        let query = supabase
          .from('screenings')
          .select('id, child_name, dob, created_at')
          .order('created_at', { ascending: false });

        // LE FILTRE EST ICI : Si parent, on ne charge que ses enfants
        if (isParent) {
          query = query.eq('parent_id', user.id);
        }
          
        const { data, error } = await query;
        
        if (error) throw error;
        if (data) {
          const uniqueChildren = Array.from(new Set(data.map(a => a.child_name)))
            .map(name => data.find(a => a.child_name === name));
          setChildren(uniqueChildren);
        }
      } catch (err: any) {
        toast({ title: "Erreur", description: "Impossible de charger la liste.", variant: "destructive" });
      } finally {
        setIsLoadingChildren(false);
      }
    };
    fetchChildren();
  }, [user]);

  // --- 2. LOGIQUE DE SÉLECTION AUTOMATIQUE ---
  const handleChildSelection = (id: string) => {
    setSelectedChildId(id);
    const selectedChild = children.find(c => c.id === id);

    if (selectedChild && selectedChild.dob) {
      // Calcul de l'âge en mois
      const birthDate = new Date(selectedChild.dob);
      const today = new Date();
      let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
      months -= birthDate.getMonth();
      months += today.getMonth();
      const ageInMonths = months <= 0 ? 0 : months;

      // Trouver automatiquement la tranche d'âge correspondante
      const autoBracket = AGE_BRACKETS.find(b => ageInMonths >= b.min && ageInMonths <= b.max);
      
      if (autoBracket) {
        setAgeGroup(autoBracket.label);
        toast({ 
          title: "Âge détecté", 
          description: `L'enfant a ${ageInMonths} mois. Chargement du questionnaire : ${autoBracket.label}` 
        });
      }
    }
  };

  const currentBracket = AGE_BRACKETS.find(b => b.label === ageGroup) || null;
  const questions = currentBracket ? currentBracket.questions : [];
  const answeredCount = Object.keys(answers).length;

  const handleAnswer = (qId: string, value: boolean) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedChildId || !user || !ageGroup) return;
    setLoading(true);
    const score = Object.values(answers).filter(v => v === true).length;
    
    try {
      const { error } = await supabase.from('general_screenings').insert([{
        child_id: selectedChildId,
        user_id: user.id,
        age_category: ageGroup,
        scores: answers,
        total_score: score,
        status: 'completed'
      }]);
      if (error) throw error;
      setIsSubmitted(true);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto text-center py-12">
          <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Évaluation enregistrée</h2>
          <Button onClick={() => { setIsSubmitted(false); setAnswers({}); setSelectedChildId(''); setAgeGroup(''); }}>Retour</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">
        {isParent ? 'Évaluer le développement de mon enfant' : t('module.screening')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Baby className="h-4 w-4 text-[#00A3E0]" /> {isParent ? 'Sélectionner mon enfant' : "Sélectionner l'enfant"}
          </label>
          <Select onValueChange={handleChildSelection} value={selectedChildId} disabled={isLoadingChildren}>
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder={isLoadingChildren ? "Chargement..." : "Choisir..."} />
            </SelectTrigger>
            <SelectContent>
              {children.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>{c.child_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Tranche d'âge (Auto-détectée)</label>
          <Select onValueChange={setAgeGroup} value={ageGroup}>
            <SelectTrigger className="h-12 rounded-xl border-[#00A3E0] bg-blue-50/50">
              <SelectValue placeholder="Tranche d'âge" />
            </SelectTrigger>
            <SelectContent>
              {AGE_BRACKETS.map(b => (
                <SelectItem key={b.label} value={b.label}>{b.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {ageGroup ? (
        <div className="space-y-3 animate-in fade-in duration-500">
          <div className="bg-[#0056A8] text-white p-4 rounded-xl mb-4 font-bold text-sm">
            Questionnaire de surveillance : {ageGroup}
          </div>
          {questions.map(q => (
            <div key={q.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-700 flex-1">{q.text}</p>
              <div className="flex gap-2">
                <Button 
                  variant={answers[q.id] === true ? "default" : "outline"} 
                  size="sm" onClick={() => handleAnswer(q.id, true)}
                >Oui</Button>
                <Button 
                  variant={answers[q.id] === false ? "destructive" : "outline"} 
                  size="sm" onClick={() => handleAnswer(q.id, false)}
                >Non</Button>
              </div>
            </div>
          ))}
          <Button 
            className="w-full mt-6 h-14 text-lg font-bold bg-[#00A3E0]" 
            disabled={answeredCount < questions.length || loading}
            onClick={handleSubmit}
          >
            {loading && <Loader2 className="animate-spin mr-2" />}
            Valider l'évaluation clinique ({answeredCount}/{questions.length})
          </Button>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">Sélectionnez un enfant pour charger automatiquement son questionnaire.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ScreeningModule;