import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext'; // <-- AJOUT
import { Button } from '@/components/ui/button';
import { ArrowRight, Building, Stethoscope, MapPin, Loader2 } from 'lucide-react'; // <-- AJOUT Loader2
import { supabase } from '@/lib/supabase'; // <-- AJOUT
import { useToast } from '@/hooks/use-toast'; // <-- AJOUT

interface Professional {
  id: string;
  name: string;
  specialty: string;
  location: string;
  available: boolean;
}

interface Structure {
  id: string;
  name: string;
  type: string;
  city: string;
}

const OrientationModule: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<'professionals' | 'structures'>('professionals');
  const [referralSent, setReferralSent] = useState<string | null>(null);
  
  const [professionals, setProfessionals] = useState<Professional[]>([]); // <-- INITIALISATION VIDE
  const [structures, setStructures] = useState<Structure[]>([]); // <-- INITIALISATION VIDE
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null); // Pour le spinner du bouton

  // --- 1. LECTURE DEPUIS SUPABASE ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [profRes, structRes] = await Promise.all([
          supabase.from('professionals').select('*').order('name', { ascending: true }),
          supabase.from('structures').select('*').order('name', { ascending: true })
        ]);

        if (profRes.error) throw profRes.error;
        if (structRes.error) throw structRes.error;

        if (profRes.data) {
          setProfessionals(profRes.data.map(p => ({
            id: p.id,
            name: p.name,
            specialty: p.specialty,
            location: p.location,
            available: p.available
          })));
        }

        if (structRes.data) {
          setStructures(structRes.data.map(s => ({
            id: s.id,
            name: s.name,
            type: s.type, // On peut adapter le formatage du type si besoin
            city: s.district || s.region // On utilise le district comme ville
          })));
        }
      } catch (err: any) {
        toast({ title: "Erreur", description: "Impossible de charger les données d'orientation.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // --- 2. ENREGISTREMENT DE L'ORIENTATION EN DB ---
  const handleOrientation = async (targetId: string, targetType: 'professional' | 'structure') => {
    setIsSubmitting(targetId);
    try {
      const { error } = await supabase.from('referrals').insert([{
        user_id: user?.id,
        target_id: targetId,
        target_type: targetType,
        status: 'pending'
      }]);

      if (error) throw error;

      setReferralSent(targetId); // Affiche le bandeau de succès d'origine
      toast({ title: "Succès", description: "L'orientation a été enregistrée dans le système." });
      
      // Auto-fermeture du bandeau après 5 secondes
      setTimeout(() => setReferralSent(null), 5000);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">{t('module.orientation')}</h1>
      <div className="flex gap-2 mb-6">
        <Button variant={tab === 'professionals' ? 'default' : 'outline'} onClick={() => setTab('professionals')}>
          <Stethoscope className="h-4 w-4 mr-2" /> Professionnels
        </Button>
        <Button variant={tab === 'structures' ? 'default' : 'outline'} onClick={() => setTab('structures')}>
          <Building className="h-4 w-4 mr-2" /> Structures
        </Button>
      </div>

      {referralSent && (
        <div className="bg-secondary/10 text-secondary p-4 rounded-lg mb-4 flex justify-between items-center">
          <span>Orientation envoyée avec succès !</span>
          <Button variant="ghost" size="sm" onClick={() => setReferralSent(null)}>✕</Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tab === 'professionals' ? (
        <div className="space-y-3">
          {professionals.length === 0 ? (
            <div className="text-center py-12 bg-card border rounded-xl text-muted-foreground">
              <Stethoscope className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>Aucun professionnel enregistré.</p>
            </div>
          ) : (
            professionals.map(p => (
              <div key={p.id} className="bg-card rounded-xl p-4 border border-border card-hover flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{p.name[0]}</div>
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      {p.specialty} · <MapPin className="h-3 w-3" /> {p.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${p.available ? 'bg-secondary/10 text-secondary' : 'bg-muted text-muted-foreground'}`}>
                    {p.available ? 'Disponible' : 'Indisponible'}
                  </span>
                  <Button 
                    size="sm" 
                    disabled={!p.available || isSubmitting === p.id} 
                    onClick={() => handleOrientation(p.id, 'professional')}
                  >
                    {isSubmitting === p.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : 'Orienter'}
                    {isSubmitting !== p.id && <ArrowRight className="h-3 w-3 ml-1" />}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {structures.length === 0 ? (
            <div className="text-center py-12 bg-card border rounded-xl text-muted-foreground">
              <Building className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>Aucune structure enregistrée.</p>
            </div>
          ) : (
            structures.map(s => (
              <div key={s.id} className="bg-card rounded-xl p-4 border border-border card-hover flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"><Building className="h-5 w-5 text-accent" /></div>
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-muted-foreground">{s.type} · {s.city}</div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  disabled={isSubmitting === s.id}
                  onClick={() => handleOrientation(s.id, 'structure')}
                >
                  {isSubmitting === s.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : 'Orienter'}
                  {isSubmitting !== s.id && <ArrowRight className="h-3 w-3 ml-1" />}
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default OrientationModule;